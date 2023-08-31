use crate::{
    events::{CallbackEvent, ComputationError, Severity},
    operations,
    operations::Operation,
    state,
    state::SessionStateAPI,
    tracker,
    tracker::OperationTrackerAPI,
};
use log::{debug, error};
use serde::Serialize;
use tokio::{
    join,
    sync::mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender},
    task,
};
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

pub type OperationsChannel = (UnboundedSender<Operation>, UnboundedReceiver<Operation>);

pub struct Session {
    uuid: Uuid,
    tx_operations: UnboundedSender<Operation>,
    destroyed: CancellationToken,
    pub state: SessionStateAPI,
    pub tracker: OperationTrackerAPI,
}

impl Session {
    /// Starts a new elrust session
    ///
    /// use `uuid` as the handle to refer to this session
    /// This method will spawn a new task that runs the operations loop and
    /// the state loop.
    /// The operations loop is the entry point to pass opartion requests from an outside thread.
    /// The state loop is responsible for all state manipulations of the session.
    ///
    pub async fn new(
        uuid: Uuid,
    ) -> Result<(Self, UnboundedReceiver<CallbackEvent>), ComputationError> {
        let (tx_operations, rx_operations): OperationsChannel = unbounded_channel();
        let (tracker_api, rx_tracker_api) = OperationTrackerAPI::new();
        let (state_api, rx_state_api) = SessionStateAPI::new(tracker_api.clone());
        let (tx_callback_events, rx_callback_events): (
            UnboundedSender<CallbackEvent>,
            UnboundedReceiver<CallbackEvent>,
        ) = unbounded_channel();
        let session = Self {
            uuid,
            tx_operations: tx_operations.clone(),
            destroyed: CancellationToken::new(),
            state: state_api.clone(),
            tracker: tracker_api.clone(),
        };
        let destroyed = session.destroyed.clone();
        task::spawn(async move {
            debug!("Session is started");
            let tx_callback_events_state = tx_callback_events.clone();
            join!(
                async {
                    operations::run(
                        rx_operations,
                        state_api.clone(),
                        tracker_api.clone(),
                        tx_callback_events.clone(),
                    )
                    .await;
                    if let Err(err) = state_api.shutdown() {
                        error!("Fail to shutdown state; error: {:?}", err);
                    }
                },
                async {
                    if let Err(err) = state::run(rx_state_api, tx_callback_events_state).await {
                        error!("State loop exits with error:: {:?}", err);
                        if let Err(err) =
                            Session::send_stop_signal(Uuid::new_v4(), &tx_operations, None).await
                        {
                            error!("Fail to send stop signal (on state fail):: {:?}", err);
                        }
                    }
                },
                async {
                    if let Err(err) = tracker::run(state_api.clone(), rx_tracker_api).await {
                        error!("Tracker loop exits with error:: {:?}", err);
                        if let Err(err) =
                            Session::send_stop_signal(Uuid::new_v4(), &tx_operations, None).await
                        {
                            error!("Fail to send stop signal (on tracker fail):: {:?}", err);
                        }
                    }
                },
            );
            destroyed.cancel();
            debug!("Session is finished");
        });
        Ok((session, rx_callback_events))
    }

    pub fn get_uuid(&self) -> Uuid {
        self.uuid
    }
    pub fn get_state(&self) -> SessionStateAPI {
        self.state.clone()
    }

    pub fn abort(&self, operation_id: Uuid, target: Uuid) -> Result<(), ComputationError> {
        self.tx_operations
            .send(Operation::new(
                operation_id,
                operations::OperationKind::Cancel { target },
            ))
            .map_err(|e| ComputationError::Communication(e.to_string()))
    }

    pub(crate) async fn send_stop_signal(
        operation_id: Uuid,
        tx_operations: &UnboundedSender<Operation>,
        destroyed: Option<&CancellationToken>,
    ) -> Result<(), ComputationError> {
        tx_operations
            .send(Operation::new(operation_id, operations::OperationKind::End))
            .map_err(|e| ComputationError::Communication(e.to_string()))?;
        if let Some(destroyed) = destroyed {
            destroyed.cancelled().await;
        }
        Ok(())
    }

    pub async fn stop(&self, operation_id: Uuid) -> Result<(), ComputationError> {
        Session::send_stop_signal(operation_id, &self.tx_operations, Some(&self.destroyed)).await
    }

    /// Used for debug goals
    pub fn sleep(&self, operation_id: Uuid, ms: u64) -> Result<(), ComputationError> {
        self.tx_operations
            .send(Operation::new(
                operation_id,
                operations::OperationKind::Sleep(ms),
            ))
            .map_err(|e| ComputationError::Communication(e.to_string()))
    }

    /// Used for debug goals
    pub async fn trigger_state_error(&self) -> Result<(), ComputationError> {
        self.state
            .shutdown_with_error()
            .map_err(ComputationError::NativeError)
    }

    /// Used for debug goals
    pub async fn trigger_tracker_error(&self) -> Result<(), ComputationError> {
        self.tracker
            .shutdown_with_error()
            .map_err(ComputationError::NativeError)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct GeneralError {
    severity: Severity,
    message: String,
}
