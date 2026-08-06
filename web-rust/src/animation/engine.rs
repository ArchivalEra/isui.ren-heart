// 引擎：渲染胶水层（Canvas/状态机驱动）
// 纯逻辑（规划/执行/几何）在 sim/ 模块 —— 原生 cargo test 可测
use crate::config::params::*;
use crate::sim::math::{screen_of, Vec2};
use crate::sim::state::{should_track, State};
use std::collections::VecDeque;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

/// 窗口固定坐标系下的活动圆（tayori logo 中心 + 半径）——窗口内 logo 中心
/// + 半径（固定常量，替代原 DOM 实时采样 sample_logo_bounds）
const WINDOW_BOUNDS: crate::sim::planner::CircleBounds = crate::sim::planner::CircleBounds {
    cx: 0.4257,
    cy: 0.3786,
    r: 0.35,
};

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
    /// 上次检测的 canvas CSS 尺寸（px，0 = 尚未检测）——resize 检测基准
    last_cw: f64,
    last_ch: f64,
    last_dpr: f64,
    /// 调试涂层：灰色锚点标记（用户钦定——调试时看小球起始位置，最上层）
    anchor_overlay: bool,
    /// 暂停标志（pause_balls 置 true → frame 开头立即 return；resume_balls 清 false）
    pub paused: bool,
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
        let mut engine = Self {
            canvas,
            ctx,
            balls,
            prev_pos: [Vec2 { x: 0.5, y: 0.5 }; 3],
            state: State::new(anchors),
            mode: RenderMode::Trail,
            history: [VecDeque::new(), VecDeque::new(), VecDeque::new()],
            last_cw: 0.0,
            last_ch: 0.0,
            last_dpr: 0.0,
            anchor_overlay: false,
            paused: false,
        };
        // 固定窗口坐标系：活动圆 = WINDOW_BOUNDS 常量——初始化即注入并重建链
        // （State::new 预生成用 fallback 圆，需覆盖为真圆，否则链围绕错圆心）
        engine.state.set_bounds(WINDOW_BOUNDS);
        engine.state.rebuild_chains(WINDOW_BOUNDS);
        engine.install_keyboard_shortcuts();
        engine
    }

    /// 切换拖尾风格（大拖尾 ↔ 小拖尾）——纯渲染层 mode 翻转，零逻辑副作用。
    /// wasm 导出（前端按钮）+ P 键热切换均复用本方法。
    /// State 可变访问（lib.rs 调试导出用）
    pub fn state_mut(&mut self) -> &mut crate::sim::state::State {
        &mut self.state
    }

    /// 调试涂层开关（JS 在调试模式激活/退出时调用）
    pub fn set_anchor_overlay(&mut self, on: bool) {
        self.anchor_overlay = on;
    }

    /// 锚点世界坐标（JS 复制参数用）
    pub fn anchors(&self) -> [f64; 6] {
        let a = self.state.anchor_positions();
        [
            a[0].x, a[0].y, a[1].x, a[1].y, a[2].x, a[2].y,
        ]
    }

    /// 锚点屏幕像素（JS 画可拖标记用——CSS px，与 render 同坐标系）
    pub fn anchor_screens(&self, cw: f64, ch: f64) -> [f64; 6] {
        let a = self.state.anchor_positions();
        let mut out = [0.0f64; 6];
        for (i, p) in a.iter().enumerate() {
            let (sx, sy, _) = crate::sim::math::screen_of(*p, cw, ch);
            out[i * 2] = sx;
            out[i * 2 + 1] = sy;
        }
        out
    }

    /// 屏幕像素 → 世界坐标（JS 拖拽换算——与 engine 反透视同公式）
    pub fn screen_to_world(&self, sx: f64, sy: f64, cw: f64, ch: f64) -> (f64, f64) {
        if cw <= 0.0 || ch <= 0.0 {
            return (0.5, 0.5);
        }
        let cy = (sy / ch).clamp(0.0, 1.0);
        let depth = 0.55 + 0.45 * cy;
        let wx = ((sx / cw - 0.5) / depth + 0.5).clamp(0.0, 1.0);
        (wx, cy)
    }

    pub fn toggle_trail_style(&mut self) {
        self.mode = match self.mode {
            RenderMode::Trail => RenderMode::TrailMini,
            RenderMode::TrailMini => RenderMode::Trail,
        };
    }

    /// 调试热切换快捷键：P = 小拖尾热切换（RenderMode: Trail ↔ TrailMini）。
    /// 复用 crate::toggle_trail_style → toggle_trail_style()，只翻转渲染层 mode 字段，
    /// 不触任何 sim/state/player 逻辑；切换即时生效，无需重建引擎。
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
                // P = 拖尾 RenderMode 热切换（大拖尾 ↔ 小拖尾）——纯渲染层
                crate::toggle_trail_style();
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
        // ① 暂停（pause_balls 置位）→ 整帧跳过（双保险——rAF 循环本已停止）
        if self.paused {
            return;
        }
        // 防御 clamp：单帧上限 100ms（dt 单位 ms）——resume 后极端大帧不弹飞
        let dt = dt.min(100.0);
        // ② resize 检测：canvas CSS 尺寸变化 >1%（或 0→非 0——首帧亦算）→
        //    重建 State（防御保留——窗口固定坐标系下活动圆是常量，无采样）。
        //    last_cw/last_ch 每帧更新——重建只触发一次，不会每帧重复重建
        let cw = self.canvas.client_width() as f64;
        let ch = self.canvas.client_height() as f64;
        let sized = cw > 0.0 && ch > 0.0;
        let resized = if self.last_cw <= 0.0 || self.last_ch <= 0.0 {
            sized // 首帧（0→实际）也算一次 resize——重建一次无害
        } else {
            (cw - self.last_cw).abs() > self.last_cw * 0.01
                || (ch - self.last_ch).abs() > self.last_ch * 0.01
        };
        self.last_cw = cw;
        self.last_ch = ch;
        if resized {
            self.rebuild_on_resize();
        }
        // 固定窗口坐标系：无 DOM 采样（活动圆 = WINDOW_BOUNDS 常量）——
        // 链在初始化/rebuild 时已按 WINDOW_BOUNDS 预生成，运行期零注入
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
                if h.len() > TRAIL_MAX_POINTS {
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

    /// resize 重建：全新 State + 固定窗口坐标系活动圆注入（防御性保留——
    /// 窗口固定坐标系下活动圆是常量，无采样、无阈值判断；检测到 resize
    /// 仍重建 State 保证自洽）
    fn rebuild_on_resize(&mut self) {
        let anchors = ANCHORS.map(|(x, y)| Vec2 { x, y });
        self.state = State::new(anchors);
        self.state.set_bounds(WINDOW_BOUNDS);
        self.state.rebuild_chains(WINDOW_BOUNDS);
        // 重置差分速度基准 + 拖尾历史——防重建后首帧「旧位置→新位置」大尾迹
        for s in 0..3 {
            self.prev_pos[s] = self.state.ball_pos(s, self.balls[s].offset);
            self.history[s].clear();
        }
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
            .min(RENDER_MAX_DPR);
        let bw = (cw * dpr).round();
        let bh = (ch * dpr).round();
        if (self.canvas.width() as f64 - bw).abs() > 0.5
            || (self.canvas.height() as f64 - bh).abs() > 0.5
        {
            self.canvas.set_width(bw as u32);
            self.canvas.set_height(bh as u32);
        }
        // transform 每帧设置（根治：canvas set_width/set_height 会重置
        // transform——曾只在 dpr 变化时重设 → resize 后 transform 保持恒等
        // → 绘制只覆盖 1/dpr 区域——球被裁掉看不见（用户反馈小球见不着））
        self.ctx.set_transform(dpr, 0.0, 0.0, dpr, 0.0, 0.0).unwrap();
        self.last_dpr = dpr;
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

        // ── 调试涂层：灰色锚点标记（最上层——render 最后画，覆盖球；
        //   用户钦定：调试时看小球起始/回家位置）──
        if self.anchor_overlay {
            for a in self.state.anchor_positions() {
                let (sx, sy, _) = screen_of(a, w, h);
                self.ctx.set_stroke_style_str("rgba(110,110,110,0.8)");
                self.ctx.set_line_width(1.5);
                self.ctx.begin_path();
                self.ctx.move_to(sx - 16.0, sy);
                self.ctx.line_to(sx + 16.0, sy);
                self.ctx.move_to(sx, sy - 16.0);
                self.ctx.line_to(sx, sy + 16.0);
                self.ctx.stroke();
                self.ctx.begin_path();
                self.ctx.set_fill_style_str("rgba(128,128,128,0.6)");
                self.ctx.arc(sx, sy, 7.0, 0.0, std::f64::consts::PI * 2.0).unwrap();
                self.ctx.fill();
            }
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

