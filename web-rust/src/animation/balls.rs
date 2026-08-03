// 三球队列动画组件：Canvas + rAF 自适应循环
// 帧率：vsync 对齐（电视/低端屏自动低帧），超预算自动跳帧（FRAME_BUDGET_MS / MAX_SKIP 可配）
use crate::animation::engine::BallsEngine;
use crate::config::params::{FRAME_BUDGET_MS, MAX_SKIP};
use leptos::prelude::*;
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::closure::Closure;
use wasm_bindgen::JsCast;

#[component]
pub fn BallsAnimation() -> impl IntoView {
    let canvas_ref = NodeRef::<leptos::html::Canvas>::new();

    Effect::new(move |_| {
        if let Some(canvas_el) = canvas_ref.get() {
            let canvas: web_sys::HtmlCanvasElement = canvas_el.into();
            let engine = Rc::new(RefCell::new(BallsEngine::new(canvas)));
            let window = web_sys::window().expect("window");
            let performance = window.performance().expect("performance");

            // rAF 自引用循环（closure 存 Rc 中，每帧重新调度自己）
            let holder: Rc<RefCell<Option<Closure<dyn FnMut()>>>> = Rc::new(RefCell::new(None));
            let holder_loop = Rc::clone(&holder);
            let engine_loop = Rc::clone(&engine);
            let perf_loop = performance.clone();

            let mut last = 0.0;
            let mut acc = 0.0;
            let mut skip = 0u32;
            let window_loop = window.clone();

            *holder.borrow_mut() = Some(Closure::wrap(Box::new(move || {
                let now = perf_loop.now();
                if last > 0.0 {
                    acc += now - last;
                }
                last = now;
                // 帧耗时预算：超预算跳帧；MAX_SKIP 保底（低端/电视场景仍渲染）
                if acc >= FRAME_BUDGET_MS || skip >= MAX_SKIP {
                    engine_loop.borrow_mut().frame();
                    acc = 0.0;
                    skip = 0;
                } else {
                    skip += 1;
                }
                let b = holder_loop.borrow();
                let cb = b.as_ref().unwrap().as_ref().unchecked_ref();
                let _ = window_loop.request_animation_frame(cb);
            }) as Box<dyn FnMut()>));

            {
                let b = holder.borrow();
                let cb = b.as_ref().unwrap().as_ref().unchecked_ref();
                let _ = window.request_animation_frame(cb);
            }
        }
    });

    view! {
        <canvas node_ref=canvas_ref class="balls-canvas" aria-hidden="true"></canvas>
    }
}
