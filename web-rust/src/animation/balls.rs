// 三球队列动画组件：Canvas + rAF 自适应循环 + 图形化调试面板
// 调试面板：拖拽三球锚点、拖拽 logo 位置、复制参数（解决「图片位置不对」的反馈循环）
use crate::animation::engine::{screen_to_world, BallsEngine};
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

            // rAF 自引用循环
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

            setup_debug_panel(Rc::clone(&engine), canvas.clone());
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

fn rect_of(el: &web_sys::HtmlCanvasElement) -> (f64, f64) {
    let el: web_sys::Element = el.clone().into();
    let r = el.get_bounding_client_rect();
    (r.left(), r.top())
}

// ---------- 图形化调试面板 ----------

fn setup_debug_panel(engine: Rc<RefCell<BallsEngine>>, canvas: web_sys::HtmlCanvasElement) {
    let document = web_sys::window().unwrap().document().unwrap();

    // 开关按钮（右下角）
    let btn: web_sys::HtmlButtonElement = document
        .create_element("button")
        .unwrap()
        .dyn_into()
        .unwrap();
    set_text_of(btn.clone(), "调试");
    let style = style_of(&btn);
    style.set_property("position", "fixed").unwrap();
    style.set_property("right", "16px").unwrap();
    style.set_property("bottom", "16px").unwrap();
    style.set_property("z-index", "9999").unwrap();
    style.set_property("padding", "6px 14px").unwrap();
    style.set_property("border", "1px solid #ccc").unwrap();
    style.set_property("border-radius", "8px").unwrap();
    style.set_property("background", "#fff").unwrap();
    style.set_property("cursor", "pointer").unwrap();
    append_node(&document.body().unwrap(), btn.clone());

    // 面板容器
    let panel: web_sys::HtmlDivElement = document.create_element("div").unwrap().dyn_into().unwrap();
    let pstyle = style_of(&panel);
    pstyle.set_property("position", "fixed").unwrap();
    pstyle.set_property("right", "16px").unwrap();
    pstyle.set_property("bottom", "56px").unwrap();
    pstyle.set_property("z-index", "9999").unwrap();
    pstyle.set_property("background", "#fff").unwrap();
    pstyle.set_property("border", "1px solid #ccc").unwrap();
    pstyle.set_property("border-radius", "10px").unwrap();
    pstyle.set_property("padding", "12px").unwrap();
    pstyle.set_property("font-size", "12px").unwrap();
    pstyle.set_property("display", "none").unwrap();
    pstyle.set_property("max-width", "320px").unwrap();
    pstyle.set_property("box-shadow", "0 8px 24px rgba(0,0,0,.15)").unwrap();
    append_node(&document.body().unwrap(), panel.clone());

    // 标题
    let title = document.create_element("div").unwrap();
    set_text_of(title.clone(), "调试面板：拖拽锚点(圈)，调完点复制参数");
    append_node(&panel, title);

    // 锚点输入（6 个数字框）+ 复制按钮 + 输出区
    let inputs: Vec<web_sys::HtmlInputElement> = (0..6)
        .map(|_| {
            let inp: web_sys::HtmlInputElement =
                document.create_element("input").unwrap().dyn_into().unwrap();
            let s = style_of(&inp);
            s.set_property("width", "52px").unwrap();
            s.set_property("margin", "2px").unwrap();
            append_node(&panel, inp.clone());
            inp
        })
        .collect();

    let copy_btn: web_sys::HtmlButtonElement =
        document.create_element("button").unwrap().dyn_into().unwrap();
    set_text_of(copy_btn.clone(), "复制参数");
    append_node(&panel, copy_btn.clone());

    let out: web_sys::HtmlTextAreaElement =
        document.create_element("textarea").unwrap().dyn_into().unwrap();
    let ostr = style_of(&out);
    ostr.set_property("width", "100%").unwrap();
    ostr.set_property("height", "90px").unwrap();
    ostr.set_property("margin-top", "6px").unwrap();
    ostr.set_property("font-size", "10px").unwrap();
    append_node(&panel, out.clone());

    // 拖拽状态：当前拖的锚点索引
    let dragging: Rc<RefCell<Option<usize>>> = Rc::new(RefCell::new(None));

    // 同步输入框 ← 引擎锚点
    fn sync_inputs(engine: &Rc<RefCell<BallsEngine>>, inputs: &[web_sys::HtmlInputElement]) {
        let e = engine.borrow();
        for i in 0..3 {
            let a = e.anchor(i);
            inputs[i * 2].set_value(&format!("{:.3}", a.x));
            inputs[i * 2 + 1].set_value(&format!("{:.3}", a.y));
        }
    }
    sync_inputs(&engine, &inputs);

    // 按钮：toggle 面板 + 调试模式
    let btn_cb = Closure::<dyn FnMut()>::new({
        let panel = panel.clone();
        let engine = Rc::clone(&engine);
        let inputs = inputs.clone();
        move || {
            let show = style_of(&panel).get_property_value("display").unwrap_or_default() == "none";
            style_of(&panel).set_property("display", if show { "block" } else { "none" }).unwrap();
            engine.borrow_mut().debug = show;
            if show {
                sync_inputs(&engine, &inputs);
            }
        }
    });
    btn.add_event_listener_with_callback("click", btn_cb.as_ref().unchecked_ref()).unwrap();
    btn_cb.forget();

    // 锚点拖拽：canvas pointerdown → 命中检测
    let down_cb = Closure::<dyn FnMut(web_sys::PointerEvent)>::new({
        let engine = Rc::clone(&engine);
        let dragging = Rc::clone(&dragging);
        let canvas = canvas.clone();
        move |e: web_sys::PointerEvent| {
            if !engine.borrow().debug {
                return;
            }
            let w = canvas.client_width() as f64;
            let h = canvas.client_height() as f64;
            let (cx, cy) = (e.client_x() as f64, e.client_y() as f64);
            let rect = rect_of(&canvas);
            let (sx, sy) = (cx - rect.0, cy - rect.1);
            let e2 = engine.borrow();
            for i in 0..3 {
                let a = e2.anchor(i);
                let (ax, ay, _) = crate::sim::math::screen_of(a, w, h);
                if ((ax - sx).powi(2) + (ay - sy).powi(2)).sqrt() < 24.0 {
                    *dragging.borrow_mut() = Some(i);
                    canvas.set_style_cursor("grabbing");
                    break;
                }
            }
        }
    });
    canvas
        .add_event_listener_with_callback("pointerdown", down_cb.as_ref().unchecked_ref())
        .unwrap();
    down_cb.forget();

    // 拖动中：window pointermove
    let move_cb = Closure::<dyn FnMut(web_sys::PointerEvent)>::new({
        let engine = Rc::clone(&engine);
        let dragging = Rc::clone(&dragging);
        let inputs = inputs.clone();
        let canvas = canvas.clone();
        move |e: web_sys::PointerEvent| {
            if let Some(i) = *dragging.borrow() {
                let w = canvas.client_width() as f64;
                let h = canvas.client_height() as f64;
                let rect = rect_of(&canvas);
                let (sx, sy) = (e.client_x() as f64 - rect.0, e.client_y() as f64 - rect.1);
                let world = screen_to_world(sx, sy, w, h);
                engine.borrow_mut().set_anchor(i, world);
                let a = engine.borrow().anchor(i);
                inputs[i * 2].set_value(&format!("{:.3}", a.x));
                inputs[i * 2 + 1].set_value(&format!("{:.3}", a.y));
            }
        }
    });
    let window = web_sys::window().unwrap();
    window
        .add_event_listener_with_callback("pointermove", move_cb.as_ref().unchecked_ref())
        .unwrap();
    move_cb.forget();

    let up_cb = Closure::<dyn FnMut(web_sys::PointerEvent)>::new({
        let dragging = Rc::clone(&dragging);
        move |_e: web_sys::PointerEvent| {
            *dragging.borrow_mut() = None;
        }
    });
    window
        .add_event_listener_with_callback("pointerup", up_cb.as_ref().unchecked_ref())
        .unwrap();
    up_cb.forget();

    // 复制参数：生成 ANCHORS 常量 + logo 位置
    let copy_cb = Closure::<dyn FnMut()>::new({
        let engine = Rc::clone(&engine);
        let out = out.clone();
        let inputs = inputs.clone();
        move || {
            sync_inputs(&engine, &inputs);
            let e = engine.borrow();
            let mut s = String::from("/* 调试面板导出 */\npub const ANCHORS: [(f64, f64); 3] = [\n");
            for i in 0..3 {
                let a = e.anchor(i);
                let name = ["粉", "水蓝", "薄荷绿"][i];
                s.push_str(&format!("    ({:.3}, {:.3}), // {name}\n", a.x, a.y));
            }
            s.push_str("];\n");
            out.set_value(&s);
            let _ = out.select();
        }
    });
    copy_btn
        .add_event_listener_with_callback("click", copy_cb.as_ref().unchecked_ref())
        .unwrap();
    copy_cb.forget();
}

trait CanvasCursor {
    fn set_style_cursor(&self, c: &str);
}

impl CanvasCursor for web_sys::HtmlCanvasElement {
    fn set_style_cursor(&self, c: &str) {
        style_of(self).set_property("cursor", c).unwrap();
    }
}
