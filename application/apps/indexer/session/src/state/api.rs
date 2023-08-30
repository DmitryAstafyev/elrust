use crate::{events::NativeError, tracker::OperationTrackerAPI};
use std::fmt::Display;
use tokio::sync::{
    mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender},
    oneshot,
};
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

pub enum Api {
    CloseSession(oneshot::Sender<()>),
    SetDebugMode((bool, oneshot::Sender<()>)),
    NotifyCancelingOperation(Uuid),
    NotifyCanceledOperation(Uuid),
    // Used for tests of error handeling
    ShutdownWithError,
    Shutdown,
}

impl Display for Api {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(
            f,
            "{}",
            match self {
                Self::CloseSession(_) => "CloseSession",
                Self::SetDebugMode(_) => "SetDebugMode",
                Self::NotifyCancelingOperation(_) => "NotifyCancelingOperation",
                Self::NotifyCanceledOperation(_) => "NotifyCanceledOperation",
                Self::Shutdown => "Shutdown",
                Self::ShutdownWithError => "ShutdownWithError",
            }
        )
    }
}

#[derive(Clone, Debug)]
pub struct SessionStateAPI {
    tx_api: UnboundedSender<Api>,
    tracker: OperationTrackerAPI,
    closing_token: CancellationToken,
}

#[allow(clippy::type_complexity)]
impl SessionStateAPI {
    pub fn new(tracker: OperationTrackerAPI) -> (Self, UnboundedReceiver<Api>) {
        let (tx_api, rx_api): (UnboundedSender<Api>, UnboundedReceiver<Api>) = unbounded_channel();
        (
            SessionStateAPI {
                tx_api,
                closing_token: CancellationToken::new(),
                tracker,
            },
            rx_api,
        )
    }

    async fn exec_operation<T>(
        &self,
        api: Api,
        rx_response: oneshot::Receiver<T>,
    ) -> Result<T, NativeError> {
        let api_str = format!("{api}");
        self.tx_api.send(api).map_err(|e| {
            NativeError::channel(&format!("Failed to send to Api::{api_str}; error: {e}"))
        })?;
        rx_response.await.map_err(|_| {
            NativeError::channel(&format!("Failed to get response from Api::{api_str}"))
        })
    }

    pub async fn canceling_operation(&self, uuid: Uuid) -> Result<(), NativeError> {
        self.tx_api
            .send(Api::NotifyCancelingOperation(uuid))
            .map_err(|e| {
                NativeError::channel(&format!(
                    "fail to send to Api::NotifyCancelingOperation; error: {e}",
                ))
            })
    }

    pub async fn canceled_operation(&self, uuid: Uuid) -> Result<(), NativeError> {
        self.tx_api
            .send(Api::NotifyCanceledOperation(uuid))
            .map_err(|e| {
                NativeError::channel(&format!(
                    "Failed to send to Api::NotifyCanceledOperation; error: {e}",
                ))
            })
    }

    pub async fn close_session(&self) -> Result<(), NativeError> {
        self.closing_token.cancel();
        self.tracker.cancel_all().await?;
        let (tx, rx) = oneshot::channel();
        self.exec_operation(Api::CloseSession(tx), rx).await
    }

    pub async fn set_debug(&self, debug: bool) -> Result<(), NativeError> {
        let (tx, rx) = oneshot::channel();
        self.exec_operation(Api::SetDebugMode((debug, tx)), rx)
            .await
    }

    pub fn shutdown(&self) -> Result<(), NativeError> {
        self.tx_api.send(Api::Shutdown).map_err(|e| {
            NativeError::channel(&format!("fail to send to Api::Shutdown; error: {e}",))
        })
    }

    pub fn shutdown_with_error(&self) -> Result<(), NativeError> {
        self.tx_api.send(Api::ShutdownWithError).map_err(|e| {
            NativeError::channel(&format!(
                "fail to send to Api::ShutdownWithError; error: {e}",
            ))
        })
    }

    pub fn is_closing(&self) -> bool {
        self.closing_token.is_cancelled()
    }
}
