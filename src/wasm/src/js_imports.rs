use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(string: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (crate::js_imports::log(&format_args!($($t)*).to_string()))
}

pub fn test() {
    console_log!("Hello")
}