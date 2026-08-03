// 三球队列动画组件：Canvas + rAF 自适应循环 + 图形化调试面板
// 调试面板：拖拽 logo 位置（left/top 百分比），复制 CSS 参数
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
            let engine = Rc::new(RefCell::new(BallsEngine::new(canvas.clone())));
            let window = web_sys::window().expect("window");
            let performance = window.performance().expect("performance");

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
                if acc >= FRAME_BUDGET_MS || skip >= MAX_SKIP {
                    engine_loop.borrow_mut().frame(acc);
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

            setup_debug_panel();
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

// ---------- 图形化调试面板（拖 logo 定位） ----------

fn setup_debug_panel() {
    let document = web_sys::window().unwrap().document().unwrap();
    let body = document.body().unwrap();

    // logo 元素（页面里的 .heart-logo）
    let logo_raw = document
        .query_selector(".heart-logo")
        .ok()
        .flatten()
        .expect("heart-logo 元素应存在");
    let logo: web_sys::HtmlElement = logo_raw.dyn_into().expect("logo 应为元素");

    // 开关按钮（右下角）
    let btn: web_sys::HtmlButtonElement =
        document.create_element("button").unwrap().dyn_into().unwrap();
    set_text_of(btn.clone(), "定位 logo");
    let s = style_of(&btn);
    s.set_property("position", "fixed").unwrap();
    s.set_property("right", "16px").unwrap();
    s.set_property("bottom", "16px").unwrap();
    s.set_property("z-index", "9999").unwrap();
    s.set_property("padding", "6px 14px").unwrap();
    s.set_property("border", "1px solid #ccc").unwrap();
    s.set_property("border-radius", "8px").unwrap();
    s.set_property("background", "#fff").unwrap();
    s.set_property("cursor", "pointer").unwrap();
    append_node(&body, btn.clone());

    // 面板
    let panel: web_sys::HtmlDivElement = document.create_element("div").unwrap().dyn_into().unwrap();
    let ps = style_of(&panel);
    ps.set_property("position", "fixed").unwrap();
    ps.set_property("right", "16px").unwrap();
    ps.set_property("bottom", "56px").unwrap();
    ps.set_property("z-index", "9999").unwrap();
    ps.set_property("background", "#fff").unwrap();
    ps.set_property("border", "1px solid #ccc").unwrap();
    ps.set_property("border-radius", "10px").unwrap();
    ps.set_property("padding", "12px").unwrap();
    ps.set_property("font-size", "12px").unwrap();
    ps.set_property("display", "none").unwrap();
    ps.set_property("max-width", "300px").unwrap();
    ps.set_property("box-shadow", "0 8px 24px rgba(0,0,0,.15)").unwrap();
    append_node(&body, panel.clone());

    let title = document.create_element("div").unwrap();
    set_text_of(title.clone(), "拖拽 logo 到满意位置，点复制参数");
    append_node(&panel, title);

    // 坐标显示
    let pos_label = document.create_element("div").unwrap();
    append_node(&panel, pos_label.clone());

    let copy_btn: web_sys::HtmlButtonElement =
        document.create_element("button").unwrap().dyn_into().unwrap();
    set_text_of(copy_btn.clone(), "复制参数");
    append_node(&panel, copy_btn.clone());

    let out: web_sys::HtmlTextAreaElement =
        document.create_element("textarea").unwrap().dyn_into().unwrap();
    let os = style_of(&out);
    os.set_property("width", "100%").unwrap();
    os.set_property("height", "80px").unwrap();
    os.set_property("margin-top", "6px").unwrap();
    os.set_property("font-size", "10px").unwrap();
    append_node(&panel, out.clone());

    // 当前 logo 位置（%）
    fn read_pos(logo: &web_sys::HtmlElement) -> (f64, f64) {
        let st = logo.style();
        let left = st.get_property_value("left").unwrap_or_default();
        let top = st.get_property_value("top").unwrap_or_default();
        let l = left.trim_end_matches('%').parse::<f64>().unwrap_or(50.0);
        let t = top.trim_end_matches('%').parse::<f64>().unwrap_or(50.0);
        (l, t)
    }
    fn set_pos(logo: &web_sys::HtmlElement, l: f64, t: f64) {
        let st = logo.style();
        let _ = st.set_property("left", &format!("{l:.2}%"));
        let _ = st.set_property("top", &format!("{t:.2}%"));
    }

    // 拖拽状态
    let dragging: Rc<RefCell<bool>> = Rc::new(RefCell::new(false));
    let offset: Rc<RefCell<(f64, f64)>> = Rc::new(RefCell::new((0.0, 0.0)));

    // toggle 按钮
    let btn_cb = Closure::<dyn FnMut()>::new({
        let panel = panel.clone();
        let pos_label = pos_label.clone();
        let logo = logo.clone();
        move || {
            let show = style_of(&panel).get_property_value("display").unwrap_or_default() == "none";
            style_of(&panel)
                .set_property("display", if show { "block" } else { "none" })
                .unwrap();
            if show {
                let (l, t) = read_pos(&logo);
                set_text_of(
                    pos_label.clone(),
                    &format!("left: {l:.2}%  top: {t:.2}%"),
                );
            }
        }
    });
    btn.add_event_listener_with_callback("click", btn_cb.as_ref().unchecked_ref()).unwrap();
    btn_cb.forget();

    // pointerdown：记录拖拽起点
    let down_cb = Closure::<dyn FnMut(web_sys::PointerEvent)>::new({
        let dragging = Rc::clone(&dragging);
        let offset = Rc::clone(&offset);
        let logo = logo.clone();
        move |e: web_sys::PointerEvent| {
            *dragging.borrow_mut() = true;
            let rect = logo.get_bounding_client_rect();
            let (l, t) = read_pos(&logo);
            // 鼠标相对 logo 原点的偏移（百分比的近似：按视口换算）
            let vw = web_sys::window()
                .unwrap()
                .inner_width()
                .ok()
                .and_then(|v| v.as_f64())
                .unwrap_or(800.0);
            let vh = web_sys::window()
                .unwrap()
                .inner_height()
                .ok()
                .and_then(|v| v.as_f64())
                .unwrap_or(600.0);
            let off_x = e.client_x() as f64 - rect.left() - l / 100.0 * vw;
            let off_y = e.client_y() as f64 - rect.top() - t / 100.0 * vh;
            *offset.borrow_mut() = (off_x, off_y);
            let _ = logo.set_attribute("data-dragging", "1");
            style_of(&logo).set_property("pointer-events", "auto").unwrap();
        }
    });
    logo.add_event_listener_with_callback("pointerdown", down_cb.as_ref().unchecked_ref())
        .unwrap();
    down_cb.forget();

    // pointermove：拖拽移动（以视口百分比更新 left/top）
    let window = web_sys::window().unwrap();
    let win_loop = window.clone();
    let move_cb = Closure::<dyn FnMut(web_sys::PointerEvent)>::new({
        let dragging = Rc::clone(&dragging);
        let offset = Rc::clone(&offset);
        let pos_label = pos_label.clone();
        let logo = logo.clone();
        move |e: web_sys::PointerEvent| {
            if *dragging.borrow() {
                let vw = win_loop.inner_width().ok().and_then(|v| v.as_f64()).unwrap_or(800.0);
                let vh = win_loop.inner_height().ok().and_then(|v| v.as_f64()).unwrap_or(600.0);
                let (off_x, off_y) = *offset.borrow();
                let l = ((e.client_x() as f64 - off_x) / vw * 100.0).clamp(0.0, 100.0);
                let t = ((e.client_y() as f64 - off_y) / vh * 100.0).clamp(0.0, 100.0);
                set_pos(&logo, l, t);
                set_text_of(pos_label.clone(), &format!("left: {l:.2}%  top: {t:.2}%"));
            }
        }
    });
    window
        .add_event_listener_with_callback("pointermove", move_cb.as_ref().unchecked_ref())
        .unwrap();
    move_cb.forget();

    let up_cb = Closure::<dyn FnMut(web_sys::PointerEvent)>::new({
        let dragging = Rc::clone(&dragging);
        move |_e: web_sys::PointerEvent| {
            *dragging.borrow_mut() = false;
        }
    });
    window
        .add_event_listener_with_callback("pointerup", up_cb.as_ref().unchecked_ref())
        .unwrap();
    up_cb.forget();

    // 复制参数：CSS 定位（覆盖 styles.css 默认 50%/50%）
    let copy_cb = Closure::<dyn FnMut()>::new({
        let logo = logo.clone();
        let out = out.clone();
        move || {
            let (l, t) = read_pos(&logo);
            let text = format!(
                "/* 调试面板导出：覆盖 styles.css 的 logo 定位 */\n\
                 .heart-logo {{\n  left: {l:.2}%;\n  top: {t:.2}%;\n  transform: translate(-50%, -50%);\n}}\n"
            );
            out.set_value(&text);
            let _ = out.select();
        }
    });
    copy_btn
        .add_event_listener_with_callback("click", copy_cb.as_ref().unchecked_ref())
        .unwrap();
    copy_cb.forget();
}
