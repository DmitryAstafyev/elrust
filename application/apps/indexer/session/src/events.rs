use crossbeam_channel as cc;
use log::warn;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Ticks {
    pub count: u64,
    pub state: Option<String>,
    pub total: Option<u64>,
}

impl Ticks {
    pub fn done(&self) -> bool {
        match self.total {
            Some(total) => self.count == total,
            None => false,
        }
    }

    pub fn new() -> Self {
        Ticks {
            count: 0,
            state: None,
            total: None,
        }
    }
}

pub enum Progress {
    Ticks(Ticks),
    Notification(Notification),
    Stopped,
}

impl Progress {
    pub fn ticks(count: u64, total: Option<u64>, state: Option<String>) -> Self {
        Self::Ticks(Ticks {
            count,
            total,
            state,
        })
    }
}

pub type IndexingResults<T> = std::result::Result<IndexingProgress<T>, Notification>;

#[derive(Debug)]
pub enum IndexingProgress<T> {
    /// GotItem called once per operation. It reflects results of operation, but
    /// not a progress
    GotItem {
        item: T,
    },
    /// Progress indicates how many ticks of the total amount have been processed
    /// the first number indicates the actual amount, the second the presumed total
    Progress {
        ticks: (u64, u64),
    },
    Stopped,
    Finished,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Notification {
    pub severity: Severity,
    pub content: String,
    pub line: Option<usize>,
}

pub struct ProgressReporter<T> {
    update_channel: cc::Sender<std::result::Result<IndexingProgress<T>, Notification>>,
    processed_bytes: u64,
    progress_percentage: u64,
    total: u64,
}

impl<T> ProgressReporter<T> {
    pub fn new(
        total: u64,
        update_channel: cc::Sender<std::result::Result<IndexingProgress<T>, Notification>>,
    ) -> ProgressReporter<T> {
        ProgressReporter {
            update_channel,
            processed_bytes: 0,
            progress_percentage: 0,
            total,
        }
    }
    pub fn make_progress(&mut self, consumed: usize) {
        self.processed_bytes += consumed as u64;
        let new_progress_percentage: u64 =
            (self.processed_bytes as f64 / self.total as f64 * 100.0).round() as u64;
        if new_progress_percentage != self.progress_percentage {
            self.progress_percentage = new_progress_percentage;
            match self.update_channel.send(Ok(IndexingProgress::Progress {
                ticks: (self.processed_bytes, self.total),
            })) {
                Ok(()) => (),
                Err(e) => warn!("could not send: {}", e),
            }
        }
    }
}

#[allow(clippy::upper_case_acronyms)]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
pub enum Severity {
    WARNING,
    ERROR,
}

impl Severity {
    pub fn as_str(&self) -> &str {
        match self {
            Severity::WARNING => "WARNING",
            Severity::ERROR => "ERROR",
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum NativeErrorKind {
    /// The file in question does not exist
    FileNotFound,
    /// The file type is not currently supported
    UnsupportedFileType,
    ComputationFailed,
    Configuration,
    Interrupted,
    OperationSearch,
    NotYetImplemented,
    ChannelError,
    Io,
    Grabber,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NativeError {
    pub severity: Severity,
    pub kind: NativeErrorKind,
    pub message: Option<String>,
}

impl NativeError {
    pub fn channel(msg: &str) -> Self {
        NativeError {
            severity: Severity::ERROR,
            kind: NativeErrorKind::ChannelError,
            message: Some(String::from(msg)),
        }
    }
}

impl From<ComputationError> for NativeError {
    fn from(err: ComputationError) -> Self {
        NativeError {
            severity: Severity::ERROR,
            kind: NativeErrorKind::Io,
            message: Some(err.to_string()),
        }
    }
}

impl From<std::io::Error> for NativeError {
    fn from(err: std::io::Error) -> Self {
        NativeError {
            severity: Severity::ERROR,
            kind: NativeErrorKind::Io,
            message: Some(err.to_string()),
        }
    }
}

impl From<tokio::sync::mpsc::error::SendError<CallbackEvent>> for NativeError {
    fn from(err: tokio::sync::mpsc::error::SendError<CallbackEvent>) -> Self {
        NativeError {
            severity: Severity::ERROR,
            kind: NativeErrorKind::ComputationFailed,
            message: Some(format!("Callback channel is broken: {err}")),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OperationDone {
    pub uuid: Uuid,
    pub result: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum CallbackEvent {
    /**
     * Triggered on error in the scope of session
     * >> Scope: session
     * >> Kind: repeated
     */
    SessionError(NativeError),
    /**
     * Triggered on error in the scope proccessing an async operation
     * >> Scope: session, async operation
     * >> Kind: repeated
     */
    OperationError { uuid: Uuid, error: NativeError },
    /**
     * Operations is created; task is spawned.
     * This even is triggered always
     * Triggered on all continues asynch operation like observe
     * >> Scope: async operation
     * >> Kind: repeated
     */
    OperationStarted(Uuid),
    /**
     * All initializations are done and operation is processing now.
     * There are no guarantees an event would be triggered. It depends
     * on each specific operation. This event can be triggered multiple
     * times in the scope of one operation (for example concat).
     * Could be triggered on continues asynch operation like observe
     * >> Scope: async operation
     * >> Kind: repeated
     */
    OperationProcessing(Uuid),
    /**
     * Triggered on some asynch operation is done
     * >> Scope: async operation
     * >> Kind: repeated
     */
    OperationDone(OperationDone),
    /**
     * Triggered on session is destroyed
     * >> Scope: session
     * >> Kind: once
     */
    SessionDestroyed,
}

impl std::fmt::Display for CallbackEvent {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Self::SessionError(err) => write!(f, "SessionError: {err:?}"),
            Self::OperationError { uuid, error } => {
                write!(f, "OperationError: {uuid}: {error:?}")
            }
            Self::OperationStarted(uuid) => write!(f, "OperationStarted: {uuid}"),
            Self::OperationProcessing(uuid) => write!(f, "OperationProcessing: {uuid}"),
            Self::OperationDone(info) => write!(f, "OperationDone: {}", info.uuid),
            Self::SessionDestroyed => write!(f, "SessionDestroyed"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum LifecycleTransition {
    Started { uuid: Uuid, alias: String },
    Ticks { uuid: Uuid, ticks: Ticks },
    Stopped(Uuid),
}

impl LifecycleTransition {
    pub fn uuid(&self) -> Uuid {
        match self {
            Self::Started { uuid, alias: _ } => *uuid,
            Self::Ticks { uuid, ticks: _ } => *uuid,
            Self::Stopped(uuid) => *uuid,
        }
    }

    pub fn started(uuid: &Uuid, alias: &str) -> Self {
        LifecycleTransition::Started {
            uuid: *uuid,
            alias: alias.to_owned(),
        }
    }

    pub fn stopped(uuid: &Uuid) -> Self {
        LifecycleTransition::Stopped(*uuid)
    }

    pub fn ticks(uuid: &Uuid, ticks: Ticks) -> Self {
        LifecycleTransition::Ticks { uuid: *uuid, ticks }
    }
}

#[derive(Error, Debug, Serialize)]
pub enum ComputationError {
    #[error("Destination path should be defined to stream from MassageProducer")]
    DestinationPath,
    #[error("Native communication error ({0})")]
    Communication(String),
    #[error("Operation not supported ({0})")]
    OperationNotSupported(String),
    #[error("IO error ({0})")]
    IoOperation(String),
    #[error("Invalid data error")]
    InvalidData,
    #[error("Invalid arguments")]
    InvalidArgs(String),
    #[error("Error during processing: ({0})")]
    Process(String),
    #[error("Wrong usage of API: ({0})")]
    Protocol(String),
    #[error("start method canbe called just once")]
    MultipleInitCall,
    #[error("Session is destroyed or not inited yet")]
    SessionUnavailable,
    #[error("{0:?}")]
    NativeError(NativeError),
    #[error("Sending data to source error: {0:?}")]
    Sde(String),
}

pub type SyncChannel<T> = (cc::Sender<T>, cc::Receiver<T>);
