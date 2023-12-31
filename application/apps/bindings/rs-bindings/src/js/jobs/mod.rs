use crate::js::session::events::ComputationErrorWrapper;
use log::{debug, error};
use node_bindgen::{
    core::{val::JsEnv, NjError, TryIntoJs},
    derive::node_bindgen,
    sys::napi_value,
};
use serde::Serialize;
use session::{
    events::ComputationError,
    unbound::{api::UnboundSessionAPI, commands::CommandOutcome, UnboundSession},
};
use std::{convert::TryFrom, thread};
use tokio::runtime::Runtime;
use tokio_util::sync::CancellationToken;

struct UnboundJobs {
    api: Option<UnboundSessionAPI>,
    finished: CancellationToken,
}

pub(crate) struct CommandOutcomeWrapper<T: Serialize>(pub CommandOutcome<T>);

impl<T: Serialize> TryIntoJs for CommandOutcomeWrapper<T> {
    /// serialize into json object
    fn try_to_js(self, js_env: &JsEnv) -> Result<napi_value, NjError> {
        match serde_json::to_string(&self.0) {
            Ok(s) => js_env.create_string_utf8(&s),
            Err(e) => Err(NjError::Other(format!(
                "Could not convert Callback event to json: {e}"
            ))),
        }
    }
}

fn id_from_i64(id: i64) -> Result<u64, ComputationErrorWrapper> {
    u64::try_from(id).map_err(|_| {
        ComputationErrorWrapper(ComputationError::InvalidArgs(String::from(
            "ID of job is invalid",
        )))
    })
}

#[node_bindgen]
impl UnboundJobs {
    // Self methods
    #[node_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            api: None,
            finished: CancellationToken::new(),
        }
    }

    #[node_bindgen(mt)]
    async fn init(&mut self) -> Result<(), ComputationErrorWrapper> {
        let rt = Runtime::new().map_err(|e| {
            ComputationError::Process(format!("Could not start tokio runtime: {e}"))
        })?;

        let (mut session, api) = UnboundSession::new();
        self.api = Some(api);
        let confirmation = self.finished.clone();
        thread::spawn(move || {
            rt.block_on(async {
                if let Err(err) = session.init().await {
                    error!("Fail to init unbound session: {err}");
                } else {
                    debug!("Unbound session is started");
                    session.finished.cancelled().await;
                    confirmation.cancel();
                    debug!("Unbound session is closed");
                }
            })
        });
        Ok(())
    }

    #[node_bindgen]
    async fn destroy(&self) -> Result<(), ComputationErrorWrapper> {
        self.api
            .as_ref()
            .ok_or(ComputationError::SessionUnavailable)?
            .shutdown()
            .await?;
        self.finished.cancelled().await;
        Ok(())
    }

    /// Cancel given operation/task
    #[node_bindgen]
    async fn abort(&self, id: i64) -> Result<(), ComputationErrorWrapper> {
        self.api
            .as_ref()
            .ok_or(ComputationError::SessionUnavailable)?
            .cancel_job(&id_from_i64(id)?)
            .await
            .map_err(ComputationErrorWrapper)
    }

    #[node_bindgen]
    async fn job_cancel_test(
        &self,
        id: i64,
        custom_arg_a: i64,
        custom_arg_b: i64,
    ) -> Result<CommandOutcomeWrapper<i64>, ComputationErrorWrapper> {
        self.api
            .as_ref()
            .ok_or(ComputationError::SessionUnavailable)?
            .cancel_test(id_from_i64(id)?, custom_arg_a, custom_arg_b)
            .await
            .map_err(ComputationErrorWrapper)
            .map(CommandOutcomeWrapper)
    }
}
