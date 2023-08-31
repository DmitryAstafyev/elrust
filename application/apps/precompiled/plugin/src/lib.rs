#[no_mangle]
pub fn sum(a: u64, b: u64) -> u64 {
    a + b
}

#[no_mangle]
pub fn find(lines: &[&str], target: &str) -> Option<String> {
    lines
        .iter()
        .find(|s| s.contains(target))
        .map_or(None, |s| Some(s.to_string()))
}
