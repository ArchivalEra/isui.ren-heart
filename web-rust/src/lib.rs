// 入口：纯 CSR（零 SSR）——静态 HTML + wasm 客户端渲染
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
mod app;
#[cfg(target_arch = "wasm32")]
mod animation;
#[cfg(target_arch = "wasm32")]
mod config;
#[cfg(target_arch = "wasm32")]
mod pages;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    leptos::mount::mount_to_body(app::App);
}
