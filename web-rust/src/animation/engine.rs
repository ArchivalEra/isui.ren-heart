// 引擎：渲染胶水层（Canvas/状态机驱动）
// 纯逻辑（规划/执行/几何）在 sim/ 模块 —— 原生 cargo test 可测
use crate::config::params::*;
use crate::sim::math::{screen_of, Vec2};
use crate::sim::state::{should_track, State};
use std::collections::VecDeque;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

pub struct Ball {
    pub offset: f64,
    pub color: &'static str,
}

/// 拖尾风格：Solid（连续实心，全宽 2r）vs Mini（小拖尾，半透明渐变≈动态模糊）
#[derive(Clone, Copy, PartialEq)]
pub enum RenderMode {
    Trail,
    TrailMini,
}

pub struct BallsEngine {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    balls: [Ball; 3],
    prev_pos: [Vec2; 3],
    state: State,

    pub mode: RenderMode,
    /// 每球位置历史（实心拖尾用，Trail 模式）
    history: [VecDeque<(f64, f64)>; 3],
    /// 活动圈边界（tayori 标志中心圆，实时采样）
    logo_bounds: crate::sim::planner::CircleBounds,
    /// 采样计数（每 30 帧采样一次 logo 位置——getBoundingClientRect 有 layout 成本）
    logo_tick: u32,
}

impl BallsEngine {
    pub fn new(canvas: HtmlCanvasElement) -> Self {
        let ctx = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()
            .unwrap();
        let balls = [
            Ball { offset: 0.0, color: BALL_COLORS[0] },
            Ball { offset: 0.0, color: BALL_COLORS[1] },
            Ball { offset: 0.0, color: BALL_COLORS[2] },
        ];
        let anchors = ANCHORS.map(|(x, y)| Vec2 { x, y });
        let engine = Self {
            canvas,
            ctx,
            balls,
            prev_pos: [Vec2 { x: 0.5, y: 0.5 }; 3],
            state: State::new(anchors),
            mode: RenderMode::Trail,
            history: [VecDeque::new(), VecDeque::new(), VecDeque::new()],
            logo_bounds: crate::sim::planner::CircleBounds::fallback(),
            logo_tick: 0,
        };
        engine.install_keyboard_shortcuts();
        engine
    }

    /// 切换拖尾风格（大拖尾 ↔ 小拖尾）——wasm 导出，前端按钮调用
    pub fn toggle_trail_style(&mut self) {
        self.mode = match self.mode {
            RenderMode::Trail => RenderMode::TrailMini,
            RenderMode::TrailMini => RenderMode::Trail,
        };
    }

    /// 调试热切换快捷键：P = 切换运动风格（native 去 EMA ↔ cloud EMA）。
    /// 只翻转 profile::ACTIVE_IDX（toggle_active），Player 每帧 active() 读——
    /// 切换即时生效，无需重建 Player。
    /// 用 js_sys::Reflect 直接调 addEventListener（避免新增 web-sys
    /// KeyboardEvent/EventTarget features）——js-sys 默认启用 Reflect。
    fn install_keyboard_shortcuts(&self) {
        use wasm_bindgen::closure::Closure;
        let window = web_sys::window().expect("window");
        let cb = Closure::<dyn FnMut(wasm_bindgen::JsValue)>::wrap(Box::new(move |ev| {
            // event.key 字符串判断（物理键值，不随输入法/布局翻译）
            let key = js_sys::Reflect::get(&ev, &wasm_bindgen::JsValue::from_str("key"))
                .ok()
                .and_then(|k| k.as_string());
            if key.as_deref() == Some("p") || key.as_deref() == Some("P") {
                crate::config::profile::toggle_active();
            }
        }));
        let this = wasm_bindgen::JsValue::from(window);
        let add = js_sys::Reflect::get(&this, &wasm_bindgen::JsValue::from_str("addEventListener"))
            .expect("window.addEventListener 不存在");
        let add_fn: js_sys::Function = add
            .dyn_into()
            .expect("window.addEventListener 不是函数");
        let _ = add_fn.call2(&this, &wasm_bindgen::JsValue::from_str("keydown"), cb.as_ref());
        cb.forget(); // 防闭包被 drop（否则监听失效）
    }

    pub fn frame(&mut self, dt: f64) {
        // 大事情定稿：实时采样 tayori 标志位置（不同设备排版差异——
        // getBoundingClientRect 每 30 帧一次，活动圈随 logo 实际位置更新）
        self.logo_tick += 1;
        if self.logo_tick % 30 == 0 {
            self.logo_bounds = self.sample_logo_bounds();
        }
        self.state.set_bounds(self.logo_bounds);
        self.step(dt);
        self.render();
        for s in 0..3 {
            let pos = self.ball_world_pos(s);
            // ⚠️ 先算速度（基于上帧 prev_pos）再更新 prev_pos——
            // 曾先更新后计算 → 差分恒 0 → 拖尾永远消失（真凶）
            let v = self.ball_velocity(s);
            self.prev_pos[s] = pos;
            if self.state.is_playing() {
                let dt_s = (dt / 1000.0).max(1e-9);
                let speed = (v.x * v.x + v.y * v.y).sqrt() / dt_s;
                let h = &mut self.history[s];
                if !should_track(speed) {
                    h.clear();
                    continue;
                }
                // 间距截断：与最新点距离过大（高速/交叉）→ 重建，防大长条（f525e40 移植）
                if let Some(&(lx, ly)) = h.back() {
                    let d = ((pos.x - lx).powi(2) + (pos.y - ly).powi(2)).sqrt();
                    if d > TRAIL_MAX_SEG {
                        h.clear();
                    }
                }
                h.push_back((pos.x, pos.y));
                if h.len() > 8 {
                    h.pop_front();
                }
            } else {
                self.history[s].clear();
            }
        }
    }

    fn ball_velocity(&self, slot: usize) -> Vec2 {
        let cur = self.ball_world_pos(slot);
        let prev = self.prev_pos[slot];
        Vec2 { x: cur.x - prev.x, y: cur.y - prev.y }
    }

    /// 采样 .heart-logo 的实际位置 → 活动圈（圆心 = logo 中心，
    /// 半径 = 圆心到四边最窄距离——横竖边取最小，圆永不越界）
    fn sample_logo_bounds(&self) -> crate::sim::planner::CircleBounds {
        use crate::sim::planner::CircleBounds;
        let el = web_sys::window()
            .and_then(|w| w.document())
            .and_then(|d| d.query_selector(".heart-logo").ok().flatten())
            .and_then(|e| e.dyn_into::<web_sys::HtmlElement>().ok());
        if let Some(el) = el {
            let rect = el.get_bounding_client_rect();
            let cw = self.canvas.client_width() as f64;
            let ch = self.canvas.client_height() as f64;
            if cw > 0.0 && ch > 0.0 {
                let cx = (rect.left() + rect.width() / 2.0) / cw;
                let cy = (rect.top() + rect.height() / 2.0) / ch;
                // 活动圆放大（满屏跑）但 clamp 屏内——放大后仍超屏会让
                // 补段链出屏幕（第二个循环重启后没有小圆预渲染保护）
                let r = ((cx.min(1.0 - cx).min(cy).min(1.0 - cy)) * 1.25)
                    .min(cx)
                    .min(1.0 - cx)
                    .min(cy)
                    .min(1.0 - cy);
                return CircleBounds { cx, cy, r: r.max(0.08) };
            }
        }
        CircleBounds::fallback()
    }

    fn step(&mut self, dt: f64) {
        // 云中心 Frenet 偏移已在 Player tick 中完成（渲染层不再叠加偏移）
        self.state.step(dt, &mut || rand::random::<f64>());
    }

    fn ball_world_pos(&self, color_slot: usize) -> Vec2 {
        self.state.ball_pos(color_slot, self.balls[color_slot].offset)
    }

    fn fade_alpha(&self) -> f64 {
        self.state.fade()
    }

    #[allow(deprecated)] // set_fill_style(&JsValue) 旧 API
    fn render(&mut self) {
        let cw = self.canvas.client_width() as f64;
        let ch = self.canvas.client_height() as f64;
        if cw == 0.0 || ch == 0.0 {
            return;
        }
        let dpr = web_sys::window()
            .map(|w| w.device_pixel_ratio())
            .unwrap_or(1.0)
            .min(2.0);
        let bw = (cw * dpr).round();
        let bh = (ch * dpr).round();
        if (self.canvas.width() as f64 - bw).abs() > 0.5
            || (self.canvas.height() as f64 - bh).abs() > 0.5
        {
            self.canvas.set_width(bw as u32);
            self.canvas.set_height(bh as u32);
            self.ctx.set_transform(dpr, 0.0, 0.0, dpr, 0.0, 0.0).unwrap();
        }
        let (w, h) = (cw, ch);
        let fade = self.fade_alpha();
        self.ctx.clear_rect(0.0, 0.0, w, h);

        let to_screen = |p: Vec2| screen_of(p, w, h);
        let order = self.state.order();
        let pts: Vec<(f64, f64, f64)> =
            (0..3).map(|s| to_screen(self.ball_world_pos(order[s]))).collect();

        let mut depth_order: Vec<usize> = (0..3).collect();
        depth_order.sort_by(|a, b| pts[*a].1.partial_cmp(&pts[*b].1).unwrap());

        for i in depth_order {
            let color_slot = order[i];
            let (px, py, d) = pts[i];
            let radius = BALL_RADIUS * d * (w.min(h) / 700.0).clamp(0.6, 1.0);
            // 拖尾风格（Particle 已删除）
            match self.mode {
                RenderMode::Trail => {
                    // 连续实心拖尾：头部从球身延伸（消除间隙），历史点按距离采样，
                    // Catmull-Rom 过点样条（无折角/珠链），全宽 2r
                    let hist = &self.history[color_slot];
                    if !hist.is_empty() {
                        let color = self.balls[color_slot].color;
                        // pts[0] = 球当前位置（头部延伸），历史点最新→最旧
                        let mut pts: Vec<Vec2> = Vec::with_capacity(hist.len() + 1);
                        pts.push(Vec2 { x: px, y: py });
                        for (hx, hy) in hist.iter().rev() {
                            let (sx, sy, _) = screen_of(Vec2 { x: *hx, y: *hy }, w, h);
                            pts.push(Vec2 { x: sx, y: sy });
                        }
                        self.ctx.set_line_cap("round");
                        self.ctx.set_line_join("round");
                        self.ctx.set_stroke_style(&wasm_bindgen::JsValue::from(color));
                        self.ctx.set_line_width(radius * 2.0);
                        self.ctx.begin_path();
                        for k in 0..pts.len() - 1 {
                            let p0 = if k == 0 { pts[0] } else { pts[k - 1] };
                            let p1 = pts[k];
                            let p2 = pts[k + 1];
                            let p3 = if k + 2 < pts.len() { pts[k + 2] } else { pts[pts.len() - 1] };
                            for s in 0..4 {
                                let t = s as f64 / 4.0;
                                let q = crate::sim::math::catmull_rom(p0, p1, p2, p3, t);
                                if k == 0 && s == 0 {
                                    self.ctx.move_to(q.x, q.y);
                                } else {
                                    self.ctx.line_to(q.x, q.y);
                                }
                            }
                        }
                        self.ctx.stroke();
                    }
                }
                RenderMode::TrailMini => {
                    // 小拖尾（动态模糊风）：短历史、宽度 0.6r、半透明渐变
                    // 头 alpha 0.45 → 尾 0（emphasized-decelerate 渐隐）
                    let hist = &self.history[color_slot];
                    if !hist.is_empty() {
                        let (r, g, b) = hex_to_rgb(self.balls[color_slot].color);
                        let mut pts: Vec<Vec2> = Vec::with_capacity(hist.len() + 1);
                        pts.push(Vec2 { x: px, y: py });
                        for (hx, hy) in hist.iter().rev() {
                            let (sx, sy, _) = screen_of(Vec2 { x: *hx, y: *hy }, w, h);
                            pts.push(Vec2 { x: sx, y: sy });
                        }
                        self.ctx.set_line_cap("round");
                        self.ctx.set_line_join("round");
                        for k in 0..pts.len() - 1 {
                            let frac = k as f64 / (pts.len() - 1) as f64; // 0=球身
                            let alpha = 0.45 * (1.0 - frac);
                            let lw = radius * 2.0 * (0.6 - 0.4 * frac);
                            self.ctx.set_stroke_style(&wasm_bindgen::JsValue::from(format!(
                                "rgba({r},{g},{b},{alpha:.3})"
                            )));
                            self.ctx.set_line_width(lw.max(0.5));
                            let p0 = if k == 0 { pts[0] } else { pts[k - 1] };
                            let p1 = pts[k];
                            let p2 = pts[k + 1];
                            let p3 = if k + 2 < pts.len() { pts[k + 2] } else { pts[pts.len() - 1] };
                            self.ctx.begin_path();
                            for s in 0..4 {
                                let t = s as f64 / 4.0;
                                let q = crate::sim::math::catmull_rom(p0, p1, p2, p3, t);
                                if s == 0 {
                                    self.ctx.move_to(q.x, q.y);
                                } else {
                                    self.ctx.line_to(q.x, q.y);
                                }
                            }
                            self.ctx.stroke();
                        }
                    }
                }
            }

            self.ctx.save();
            self.ctx.set_global_alpha(fade);
            self.ctx.begin_path();
            self.ctx.arc(px, py, radius, 0.0, std::f64::consts::PI * 2.0).unwrap();
            self.ctx.set_fill_style(&wasm_bindgen::JsValue::from(self.balls[color_slot].color));
            self.ctx.fill();
            self.ctx.restore();
        }
    }
}

fn hex_to_rgb(hex: &str) -> (u8, u8, u8) {
    let h = hex.trim_start_matches('#');
    (
        u8::from_str_radix(&h[0..2], 16).unwrap_or(0),
        u8::from_str_radix(&h[2..4], 16).unwrap_or(0),
        u8::from_str_radix(&h[4..6], 16).unwrap_or(0),
    )
}

