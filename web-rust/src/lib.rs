// 封仓（v1.0.0）：native cargo check 的大量 dead_code 是 wasm 误报
//（代码只被 wasm 侧引用）——统一 allow；unused imports 是真问题（下方清理）
#![allow(dead_code)]

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

/// rAF 循环 holder：closure 自调度引用锚点（RAF 置 None 即失去活跃身份）
#[cfg(target_arch = "wasm32")]
type RafHolder = std::rc::Rc<RefCell<Option<wasm_bindgen::closure::Closure<dyn FnMut()>>>>;

#[cfg(target_arch = "wasm32")]
thread_local! {
    /// 全局动画引擎（wasm 单实例；前端调用 start_balls 初始化）
    static ENGINE: RefCell<Option<crate::animation::engine::BallsEngine>> = RefCell::new(None);
    /// rAF 循环句柄（start_raf 存；pause_balls 置 None 停循环；resume_balls 重建）
    static RAF: RefCell<Option<RafHolder>> = RefCell::new(None);
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

    start_raf();
}

/// 启动/重建 rAF 循环（每次调用新建 holder/closure 并立即调度首帧；
/// closure 自调度：每帧先跑 engine.frame，再检查 RAF 是否仍持有本循环的
/// holder——不是则不再调度：pause 置 None、或 resume 重建后旧残留回调都停）
#[cfg(target_arch = "wasm32")]
fn start_raf() {
    use wasm_bindgen::JsCast;
    let window = web_sys::window().expect("window");
    let performance = window.performance().expect("performance");
    let holder: RafHolder = std::rc::Rc::new(RefCell::new(None));
    let holder_loop = std::rc::Rc::clone(&holder);
    let perf_loop = performance.clone();
    let window_loop = window.clone();
    let mut last = 0.0; // 首帧 dt=16.7（不跳变）；此后为真实帧间隔

    *holder.borrow_mut() = Some(wasm_bindgen::closure::Closure::wrap(Box::new(move || {
        let now = perf_loop.now();
        let dt = if last > 0.0 { now - last } else { 16.7 };
        last = now;
        ENGINE.with(|e| {
            if let Some(eng) = e.borrow_mut().as_mut() {
                eng.frame(dt);
            }
        });
        // 活跃性检查：RAF 仍持有本循环 holder 才继续自我调度
        let keep = RAF.with(|raf| {
            raf.borrow()
                .as_ref()
                .map_or(false, |r| std::rc::Rc::ptr_eq(r, &holder_loop))
        });
        if !keep {
            return;
        }
        let b = holder_loop.borrow();
        let cb = b.as_ref().unwrap().as_ref().unchecked_ref();
        let _ = window_loop.request_animation_frame(cb);
    }) as Box<dyn FnMut()>));

    // holder 存模块级静态——pause_balls 置 None 即停循环（主线程零开销）
    RAF.with(|raf| *raf.borrow_mut() = Some(holder.clone()));

    {
        let b = holder.borrow();
        let cb = b.as_ref().unwrap().as_ref().unchecked_ref();
        let _ = window.request_animation_frame(cb);
    }
}

/// 暂停动画（屏 2 freeze）：停 rAF 循环 + ENGINE 置 paused 双保险。
/// RAF 置 None → 下一次（若残留）回调检测到不活跃 → 不再自我调度 → 循环停。
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn pause_balls() {
    RAF.with(|raf| *raf.borrow_mut() = None);
    ENGINE.with(|e| {
        if let Some(eng) = e.borrow_mut().as_mut() {
            eng.paused = true;
        }
    });
}

/// 恢复动画（回屏 1）：ENGINE 已有不重建——清 paused + 重建 rAF 循环。
/// 新 closure last=0.0 → 首帧 dt=16.7（与 start_balls 首帧同语义，不跳变）。
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn resume_balls() {
    ENGINE.with(|e| {
        if let Some(eng) = e.borrow_mut().as_mut() {
            eng.paused = false;
        }
    });
    start_raf();
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

/// 调试涂层开关（灰色锚点标记——JS 调试模式激活/退出时调用）
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn set_anchor_overlay(on: bool) {
    ENGINE.with(|e| {
        if let Some(eng) = e.borrow_mut().as_mut() {
            eng.set_anchor_overlay(on);
        }
    });
}

/// 锚点世界坐标（JS 复制参数）
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn get_anchors() -> Vec<f64> {
    ENGINE.with(|e| {
        if let Some(eng) = e.borrow().as_ref() {
            eng.anchors().to_vec()
        } else {
            vec![]
        }
    })
}

/// 锚点屏幕像素（JS 画可拖标记）
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn anchor_screens(cw: f64, ch: f64) -> Vec<f64> {
    ENGINE.with(|e| {
        if let Some(eng) = e.borrow().as_ref() {
            eng.anchor_screens(cw, ch).to_vec()
        } else {
            vec![]
        }
    })
}

/// 屏幕像素 → 世界坐标（JS 拖拽换算）
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn screen_to_world(sx: f64, sy: f64, cw: f64, ch: f64) -> Vec<f64> {
    ENGINE.with(|e| {
        if let Some(eng) = e.borrow().as_ref() {
            let (x, y) = eng.screen_to_world(sx, sy, cw, ch);
            vec![x, y]
        } else {
            vec![]
        }
    })
}

/// 调试拖拽更新单个锚点
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn set_anchor(s: usize, x: f64, y: f64) {
    ENGINE.with(|e| {
        if let Some(eng) = e.borrow_mut().as_mut() {
            eng.state_mut().set_anchor(s, x, y);
        }
    });
}
