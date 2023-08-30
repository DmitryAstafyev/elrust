use crate::events::{CallbackEvent, NativeError, NativeErrorKind, Severity};
use log::debug;
use std::collections::HashMap;
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

mod api;

pub use api::{Api, SessionStateAPI};

#[derive(Debug)]
pub enum Status {
    Open,
    Closed,
}

#[derive(Debug)]
pub struct SessionState {
    pub cancelling_operations: HashMap<Uuid, bool>,
    pub status: Status,
    pub debug: bool,
}

impl SessionState {
    fn new(_tx_callback_events: UnboundedSender<CallbackEvent>) -> Self {
        Self {
            status: Status::Open,
            cancelling_operations: HashMap::new(),
            debug: false,
        }
    }
}

pub async fn run(
    mut rx_api: UnboundedReceiver<Api>,
    tx_callback_events: UnboundedSender<CallbackEvent>,
) -> Result<(), NativeError> {
    let mut state = SessionState::new(tx_callback_events.clone());
    let state_cancellation_token = CancellationToken::new();
    debug!("task is started");
    while let Some(msg) = rx_api.recv().await {
        match msg {
            Api::CloseSession(tx_response) => {
                state_cancellation_token.cancel();
                state.status = Status::Closed;
                // Note: all operations would be canceled in close_session of API. We cannot do it here,
                // because we would lock this loop if some operation needs access to state during cancellation.
                if tx_response.send(()).is_err() {
                    return Err(NativeError::channel(
                        "fail to response to Api::CloseSession",
                    ));
                }
            }
            Api::SetDebugMode((debug, tx_response)) => {
                state.debug = debug;
                if tx_response.send(()).is_err() {
                    return Err(NativeError::channel(
                        "fail to response to Api::SetDebugMode",
                    ));
                }
            }
            Api::NotifyCancelingOperation(uuid) => {
                state.cancelling_operations.insert(uuid, true);
            }
            Api::NotifyCanceledOperation(uuid) => {
                state.cancelling_operations.remove(&uuid);
            }
            Api::Shutdown => {
                state_cancellation_token.cancel();
                debug!("shutdown has been requested");
                break;
            }
            Api::ShutdownWithError => {
                debug!("shutdown state loop with error for testing");
                return Err(NativeError {
                    severity: Severity::ERROR,
                    kind: NativeErrorKind::Io,
                    message: Some(String::from("Shutdown state loop with error for testing")),
                });
            }
        }
    }
    debug!("task is finished");
    Ok(())
}
