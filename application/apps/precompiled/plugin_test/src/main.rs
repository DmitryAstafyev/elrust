use libloading::{Library, Symbol};
fn main() {
    unsafe {
        let lib = Library::new("/storage/projects/esrlabs/autosar/application/apps/precompiled/plugin/target/release/libplugin.so").unwrap();
        let sum: Symbol<fn(u64, u64) -> u64> = lib.get(b"sum").unwrap();
        let find: Symbol<fn(&[&str], &str) -> Option<String>> = lib.get(b"find").unwrap();
        let lines = vec!["one", "two", "three"];
        println!("2 + 4 = {}", sum(2, 4));
        println!("find \"tw\" in {:?} = {:?}", lines, find(&lines, "tw"));
    }
}
