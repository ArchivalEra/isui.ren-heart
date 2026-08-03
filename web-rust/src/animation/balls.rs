// 三球队列动画组件：Canvas + setInterval 驱动（帧率可配，极致低占用）
use crate::animation::engine::BallsEngine;
use leptos::prelude::*;
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::closure::Closure;
use wasm_bindgen::JsCast;

/// 帧间隔 ms（33 ≈ 30fps；可改 16 ≈ 60fps。慢速游动 30fps 已流畅，最省电）
const FRAME_MS: i32 = 33;

#[component]
pub fn BallsAnimation() -> impl IntoView {
    let canvas_ref = NodeRef::<leptos::html::Canvas>::new();

    Effect::new(move |_| {
        if let Some(canvas_el) = canvas_ref.get() {
            let canvas: web_sys::HtmlCanvasElement = canvas_el.into();
            let engine = Rc::new(RefCell::new(BallsEngine::new(canvas)));

            // setInterval 驱动（无 rAF 闭包自引用问题）
            let engine_loop = Rc::clone(&engine);
            let closure = Closure::<dyn FnMut()>::new(move || {
                engine_loop.borrow_mut().frame();
            });
            let window = web_sys::window().expect("window");
            let interval = window
                .set_interval_with_callback_and_timeout_and_arguments_0(
                    closure.as_ref().unchecked_ref(),
                    FRAME_MS,
                )
                .expect("set_interval");
            // 保持 closure 存活
            let _ = closure.into_js_value();
            let _ = interval;
        }
    });

    view! {
        <canvas node_ref=canvas_ref class="balls-canvas" aria-hidden="true"></canvas>
    }
}
