// 入口：动画核心 wasm 模块（纯 CSR，零服务端开销）
// 前端（web-ui/Preact）通过 wasm-bindgen 导出的 API 挂载三球动画：
//   start_balls(canvas_id)    启动动画
//   toggle_trail_style()      切换拖尾风格（大/小）
// config/sim 不挂 wasm cfg —— 原生 cargo test 可测
mod config;
mod sim;

#[cfg(target_arch = "wasm32")]
mod animation;

#[cfg(target_arch = "wasm32")]
use std::cell::RefCell;

#[cfg(target_arch = "wasm32")]
thread_local! {
    /// 全局动画引擎（wasm 单实例；前端调用 start_balls 初始化）
    static ENGINE: RefCell<Option<crate::animation::engine::BallsEngine>> = RefCell::new(None);
}

/// 启动三球动画：在指定 canvas 上创建引擎并跑 rAF 循环
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn start_balls(canvas_id: &str) {
    console_error_panic_hook::set_once();
    use wasm_bindgen::JsCast;
    let document = web_sys::window()
        .expect("window")
        .document()
        .expect("document");
    let canvas = document
        .get_element_by_id(canvas_id)
        .unwrap_or_else(|| panic!("canvas #{canvas_id} 不存在"));
    let canvas: web_sys::HtmlCanvasElement = canvas.dyn_into().expect("元素应为 canvas");
    let engine = crate::animation::engine::BallsEngine::new(canvas.clone());

    ENGINE.with(|e| *e.borrow_mut() = Some(engine));

    // rAF 循环（与 vsync 对齐；跳帧产生不均匀帧间隔 = 肉眼卡顿）
    let window = web_sys::window().expect("window");
    let performance = window.performance().expect("performance");
    let holder: std::rc::Rc<std::cell::RefCell<Option<wasm_bindgen::closure::Closure<dyn FnMut()>>>> =
        std::rc::Rc::new(std::cell::RefCell::new(None));
    let holder_loop = std::rc::Rc::clone(&holder);
    let perf_loop = performance.clone();
    let window_loop = window.clone();
    let mut last = 0.0;

    *holder.borrow_mut() = Some(wasm_bindgen::closure::Closure::wrap(Box::new(move || {
        let now = perf_loop.now();
        let dt = if last > 0.0 { now - last } else { 16.7 };
        last = now;
        ENGINE.with(|e| {
            if let Some(eng) = e.borrow_mut().as_mut() {
                eng.frame(dt);
            }
        });
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

/// 切换拖尾风格（大拖尾 ↔ 小拖尾）——前端按钮调用
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn toggle_trail_style() {
    ENGINE.with(|e| {
        if let Some(eng) = e.borrow_mut().as_mut() {
            eng.toggle_trail_style();
        }
    });
}
