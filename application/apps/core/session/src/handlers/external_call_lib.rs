use crate::{
    events::{NativeError, NativeErrorKind, Severity},
    operations::{OperationAPI, OperationResult},
};
use libloading::{Library, Symbol};

pub async fn handle(
    operation_api: &OperationAPI,
    path: String,
    a: u64,
    b: u64,
    lines: &[&str],
) -> OperationResult<(u64, Option<String>)> {
    // Cancellation token can be used to stop operation
    let _canceler = operation_api.cancellation_token();
    unsafe {
        let lib = Library::new(path).map_err(|e| NativeError {
            severity: Severity::ERROR,
            kind: NativeErrorKind::ComputationFailed,
            message: Some(format!("Fail to load lib: {e}")),
        })?;
        let sum: Symbol<fn(u64, u64) -> u64> = lib.get(b"sum").map_err(|e| NativeError {
            severity: Severity::ERROR,
            kind: NativeErrorKind::ComputationFailed,
            message: Some(format!("Fail to link \"sum\" func: {e}")),
        })?;
        #[allow(clippy::type_complexity)]
        let find: Symbol<fn(&[&str], &str) -> Option<String>> =
            lib.get(b"find").map_err(|e| NativeError {
                severity: Severity::ERROR,
                kind: NativeErrorKind::ComputationFailed,
                message: Some(format!("Fail to link \"find\" func: {e}")),
            })?;
        Ok(Some((sum(a, b), find(lines, "tw"))))
    }
}
