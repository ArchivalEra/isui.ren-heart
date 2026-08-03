// 三球队列动画组件：Canvas + rAF 自适应循环 + 拖尾风格切换按钮
use crate::animation::engine::{BallsEngine, RenderMode};
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
            let engine = Rc::new(RefCell::new(BallsEngine::new(canvas.clone())));
            let window = web_sys::window().expect("window");
            let performance = window.performance().expect("performance");

            let holder: Rc<RefCell<Option<Closure<dyn FnMut()>>>> = Rc::new(RefCell::new(None));
            let holder_loop = Rc::clone(&holder);
            let engine_loop = Rc::clone(&engine);
            let perf_loop = performance.clone();

            let mut last = 0.0;
            let window_loop = window.clone();

            // 每帧渲染（rAF vsync 对齐）：跳帧会产生不均匀帧间隔 = 肉眼卡顿
            *holder.borrow_mut() = Some(Closure::wrap(Box::new(move || {
                let now = perf_loop.now();
                let dt = if last > 0.0 { now - last } else { 16.7 };
                last = now;
                engine_loop.borrow_mut().frame(dt);
                let b = holder_loop.borrow();
                let cb = b.as_ref().unwrap().as_ref().unchecked_ref();
                let _ = window_loop.request_animation_frame(cb);
            }) as Box<dyn FnMut()>));

            {
                let b = holder.borrow();
                let cb = b.as_ref().unwrap().as_ref().unchecked_ref();
                let _ = window.request_animation_frame(cb);
            }

            setup_style_toggle(Rc::clone(&engine));
        }
    });

    view! {
        <canvas node_ref=canvas_ref class="balls-canvas" aria-hidden="true"></canvas>
    }
}

// ---------- web_sys 显式访问（绕过 tachys trait 遮蔽） ----------

fn style_of<E: AsRef<web_sys::HtmlElement>>(el: &E) -> web_sys::CssStyleDeclaration {
    el.as_ref().style()
}

fn set_text_of<E: Into<web_sys::Node>>(el: E, text: &str) {
    let n: web_sys::Node = el.into();
    n.set_text_content(Some(text));
}

fn append_node<E: Into<web_sys::Node>>(parent: &web_sys::Node, child: E) {
    let c: web_sys::Node = child.into();
    let _ = parent.append_child(&c);
}

// ---------- 拖尾风格切换（粒子化已删：拖尾 / 小拖尾） ----------

fn setup_style_toggle(engine: Rc<RefCell<BallsEngine>>) {
    let document = web_sys::window().unwrap().document().unwrap();
    let body = document.body().unwrap();

    let btn: web_sys::HtmlButtonElement =
        document.create_element("button").unwrap().dyn_into().unwrap();
    set_text_of(btn.clone(), "模式：粒子");
    let s = style_of(&btn);
    s.set_property("position", "fixed").unwrap();
    s.set_property("right", "16px").unwrap();
    s.set_property("bottom", "16px").unwrap();
    s.set_property("z-index", "9999").unwrap();
    s.set_property("padding", "6px 14px").unwrap();
    s.set_property("border", "1px solid #ccc").unwrap();
    s.set_property("border-radius", "8px").unwrap();
    s.set_property("background", "rgba(255,255,255,.85)").unwrap();
    s.set_property("cursor", "pointer").unwrap();
    append_node(&body, btn.clone());

    let cb = Closure::<dyn FnMut()>::new({
        let engine = Rc::clone(&engine);
        let btn = btn.clone();
        move || {
            let next = match engine.borrow().mode {
                RenderMode::Trail => {
                    set_text_of(btn.clone(), "模式：小拖尾");
                    RenderMode::TrailMini
                }
                RenderMode::TrailMini => {
                    set_text_of(btn.clone(), "模式：实心拖尾");
                    RenderMode::Trail
                }
            };
            engine.borrow_mut().mode = next;
        }
    });
    btn.add_event_listener_with_callback("click", cb.as_ref().unchecked_ref()).unwrap();
    cb.forget();
}
