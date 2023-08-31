use crate::events::{NativeError, NativeErrorKind, Severity};
use dirs;
use std::path::PathBuf;

const ELRUST_HOME: &str = ".elrust";
const ELRUST_TMP: &str = "tmp";

pub fn get_home_dir() -> Result<PathBuf, NativeError> {
    if let Some(home) = dirs::home_dir().take() {
        Ok(home.join(ELRUST_HOME))
    } else {
        Err(NativeError {
            severity: Severity::ERROR,
            kind: NativeErrorKind::Io,
            message: Some(String::from("Fail to find home folder")),
        })
    }
}

pub fn get_streams_dir() -> Result<PathBuf, NativeError> {
    let streams = get_home_dir()?.join(ELRUST_TMP);
    if !streams.exists() {
        std::fs::create_dir(&streams).map_err(|e| NativeError {
            severity: Severity::ERROR,
            kind: NativeErrorKind::Io,
            message: Some(format!(
                "Fail to create streams folder {}: {}",
                streams.to_string_lossy(),
                e
            )),
        })?;
    }
    Ok(streams)
}
