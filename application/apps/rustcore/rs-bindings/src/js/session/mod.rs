pub mod events;
pub mod progress_tracker;

use crate::js::session::events::ComputationErrorWrapper;
use events::CallbackEventWrapper;
use log::{debug, error};
use node_bindgen::derive::node_bindgen;
use session::{
    events::{CallbackEvent, ComputationError, NativeError},
    operations,
    session::Session,
};
use std::thread;
use tokio::{runtime::Runtime, sync::oneshot};
use uuid::Uuid;

struct RustSession {
    session: Option<Session>,
    uuid: Uuid,
}

#[node_bindgen]
impl RustSession {
    #[node_bindgen(constructor)]
    pub fn new(id: String) -> Self {
        let uuid = match operations::uuid_from_str(&id) {
            Ok(uuid) => uuid,
            Err(err) => {
                // TODO: Should be replaced with error
                panic!("Fail to convert UUID = {}; error:{}", id, err);
            }
        };
        Self {
            session: None,
            uuid,
        }
    }

    #[node_bindgen(mt)]
    async fn init<F: Fn(CallbackEventWrapper) + Send + 'static>(
        &mut self,
        callback: F,
    ) -> Result<(), ComputationErrorWrapper> {
        let rt = Runtime::new().map_err(|e| {
            ComputationError::Process(format!("Could not start tokio runtime: {e}"))
        })?;
        let (tx_session, rx_session) = oneshot::channel();
        let uuid = self.uuid;
        thread::spawn(move || {
            rt.block_on(async {
                match Session::new(uuid).await {
                    Ok((session, mut rx_callback_events)) => {
                        if tx_session.send(Some(session)).is_err() {
                            error!("Cannot setup session instance");
                            return;
                        }
                        debug!("task is started");
                        while let Some(event) = rx_callback_events.recv().await {
                            callback(event.into())
                        }
                        debug!("sending SessionDestroyed event");
                        callback(CallbackEvent::SessionDestroyed.into());
                        debug!("task is finished");
                    }
                    Err(e) => {
                        error!("Cannot create session instance: {e}");
                        if tx_session.send(None).is_err() {
                            error!("Cannot setup session instance");
                        }
                    }
                }
            })
        });
        self.session = rx_session.await.map_err(|_| {
            ComputationErrorWrapper(ComputationError::Communication(String::from(
                "Fail to get session instance to setup",
            )))
        })?;
        Ok(())
    }

    #[node_bindgen]
    fn get_uuid(&self) -> Result<String, ComputationErrorWrapper> {
        if let Some(ref session) = self.session {
            Ok(session.get_uuid().to_string())
        } else {
            Err(ComputationErrorWrapper(
                ComputationError::SessionUnavailable,
            ))
        }
    }

    #[node_bindgen]
    fn abort(
        &self,
        operation_id: String,
        target_id: String,
    ) -> Result<(), ComputationErrorWrapper> {
        if let Some(ref session) = self.session {
            session
                .abort(
                    operations::uuid_from_str(&operation_id)?,
                    operations::uuid_from_str(&target_id)?,
                )
                .map_err(ComputationErrorWrapper)
        } else {
            Err(ComputationErrorWrapper(
                ComputationError::SessionUnavailable,
            ))
        }
    }

    #[node_bindgen]
    async fn stop(&self, operation_id: String) -> Result<(), ComputationErrorWrapper> {
        if let Some(ref session) = self.session {
            session
                .stop(operations::uuid_from_str(&operation_id)?)
                .await
                .map_err(ComputationErrorWrapper)?;
            Ok(())
        } else {
            Err(ComputationErrorWrapper(
                ComputationError::SessionUnavailable,
            ))
        }
    }

    #[node_bindgen]
    async fn set_debug(&self, debug: bool) -> Result<(), ComputationErrorWrapper> {
        if let Some(ref session) = self.session {
            session
                .state
                .set_debug(debug)
                .await
                .map_err(|e: NativeError| ComputationError::NativeError(e).into())
        } else {
            Err(ComputationErrorWrapper(
                ComputationError::SessionUnavailable,
            ))
        }
    }

    #[node_bindgen]
    async fn get_operations_stat(&self) -> Result<String, ComputationErrorWrapper> {
        if let Some(ref session) = self.session {
            session
                .tracker
                .get_operations_stat()
                .await
                .map_err(|e: NativeError| ComputationError::NativeError(e).into())
        } else {
            Err(ComputationErrorWrapper(
                ComputationError::SessionUnavailable,
            ))
        }
    }

    #[node_bindgen]
    async fn sleep(&self, operation_id: String, ms: i64) -> Result<(), ComputationErrorWrapper> {
        if let Some(ref session) = self.session {
            session
                .sleep(operations::uuid_from_str(&operation_id)?, ms as u64)
                .map_err(ComputationErrorWrapper)
        } else {
            Err(ComputationErrorWrapper(
                ComputationError::SessionUnavailable,
            ))
        }
    }

    #[node_bindgen]
    async fn trigger_state_error(&self) -> Result<(), ComputationErrorWrapper> {
        if let Some(ref session) = self.session {
            session
                .trigger_state_error()
                .await
                .map_err(ComputationErrorWrapper)
        } else {
            Err(ComputationErrorWrapper(
                ComputationError::SessionUnavailable,
            ))
        }
    }

    #[node_bindgen]
    async fn trigger_tracker_error(&self) -> Result<(), ComputationErrorWrapper> {
        if let Some(ref session) = self.session {
            session
                .trigger_tracker_error()
                .await
                .map_err(ComputationErrorWrapper)
        } else {
            Err(ComputationErrorWrapper(
                ComputationError::SessionUnavailable,
            ))
        }
    }
}
