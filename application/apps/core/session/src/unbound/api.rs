use crate::events::ComputationError;
use serde::Serialize;
use tokio::sync::{mpsc::UnboundedSender, oneshot};

use super::commands::{Command, CommandOutcome};

#[derive(Debug)]
pub enum API {
    Shutdown(oneshot::Sender<()>),
    CancelJob(u64),
    Run(Command, u64),
    /// remove finished jobs from registry
    Remove(u64),
}

#[derive(Clone, Debug)]
pub struct UnboundSessionAPI {
    tx: UnboundedSender<API>,
}

impl UnboundSessionAPI {
    pub fn new(tx: UnboundedSender<API>) -> Self {
        Self { tx }
    }

    pub async fn shutdown(&self) -> Result<(), ComputationError> {
        let (tx, rx): (oneshot::Sender<()>, oneshot::Receiver<()>) = oneshot::channel();
        self.tx.send(API::Shutdown(tx)).map_err(|_| {
            ComputationError::Communication(String::from("Fail to send API::Shutdown"))
        })?;
        rx.await.map_err(|e| {
            ComputationError::Communication(format!(
                "Fail to get response from API::Shutdown: {e:?}"
            ))
        })
    }

    pub async fn cancel_job(&self, operation_id: &u64) -> Result<(), ComputationError> {
        self.tx.send(API::CancelJob(*operation_id)).map_err(|_| {
            ComputationError::Communication(String::from("Fail to send API::CancelJob"))
        })
    }

    async fn process_command<T: Serialize>(
        &self,
        id: u64,
        rx_results: oneshot::Receiver<Result<CommandOutcome<T>, ComputationError>>,
        command: Command,
    ) -> Result<CommandOutcome<T>, ComputationError> {
        self.tx.send(API::Run(command, id)).map_err(|_| {
            ComputationError::Communication(String::from("Fail to send call Job::SomeJob"))
        })?;
        rx_results
            .await
            .map_err(|e| ComputationError::Communication(format!("channel error: {e}")))?
    }

    pub(crate) fn remove_command(&self, id: u64) -> Result<(), ComputationError> {
        self.tx.send(API::Remove(id)).map_err(|_| {
            ComputationError::Communication(String::from("Fail to send call Job::SomeJob"))
        })?;
        Ok(())
    }

    pub async fn cancel_test(
        &self,
        id: u64,
        custom_arg_a: i64,
        custom_arg_b: i64,
    ) -> Result<CommandOutcome<i64>, ComputationError> {
        let (tx_results, rx_results) = oneshot::channel();
        self.process_command(
            id,
            rx_results,
            Command::CancelTest(custom_arg_a, custom_arg_b, tx_results),
        )
        .await
    }
}
