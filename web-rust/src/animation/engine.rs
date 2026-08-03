// 引擎：渲染胶水层（Canvas/状态机驱动）
// 纯逻辑（规划/执行/几何）在 sim/ 模块 —— 原生 cargo test 可测
use crate::config::params::*;
use crate::config::templates::TEMPLATES;
use crate::sim::math::{screen_of, smoothstep, Vec2};
use crate::sim::planner::{Phase, Player};
use crate::sim::target::random_trio_targets;
use std::collections::VecDeque;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

pub struct Ball {
    pub offset: f64,
    pub color: &'static str,
}

/// 渲染模式：粒子化（椭圆拉伸）vs 拖尾化（纯圆 + 长实体拖尾，Google pixel 风格）
#[derive(Clone, Copy, PartialEq)]
pub enum RenderMode {
    Particle,
    Trail,
}

pub struct BallsEngine {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    balls: [Ball; 3],
    prev_pos: [Vec2; 3],
    phase: Phase,
    /// 锚点（可被调试面板拖拽，初始 = ANCHORS 契约）
    pub anchors: [Vec2; 3],
    pub debug: bool,
    pub mode: RenderMode,
    /// 每球位置历史（实心拖尾用，Trail 模式）
    history: [VecDeque<(f64, f64)>; 3],
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
        Self {
            canvas,
            ctx,
            balls,
            prev_pos: [Vec2 { x: 0.5, y: 0.5 }; 3],
            phase: Phase::AtLogo { t: 0.0 },
            anchors,
            debug: false,
            mode: RenderMode::Particle,
            history: [VecDeque::new(), VecDeque::new(), VecDeque::new()],
        }
    }

    pub fn frame(&mut self, dt: f64) {
        self.step(dt);
        self.render();
        for s in 0..3 {
            let pos = self.ball_world_pos(s);
            self.prev_pos[s] = pos;
            // 位置历史（实心拖尾；上限 8）
            if matches!(self.phase, Phase::Play(_)) {
                let h = &mut self.history[s];
                h.push_back((pos.x, pos.y));
                if h.len() > 8 {
                    h.pop_front();
                }
            }
        }
    }

    fn ball_velocity(&self, slot: usize) -> Vec2 {
        let cur = self.ball_world_pos(slot);
        let prev = self.prev_pos[slot];
        Vec2 { x: cur.x - prev.x, y: cur.y - prev.y }
    }

    fn step(&mut self, dt: f64) {
        let mut queue_done = None;
        match &mut self.phase {
            Phase::AtLogo { t } => {
                *t += dt;
                if *t >= AT_LOGO_MS {
                    let from = self.anchors;
                    let to = random_trio_targets();
                    self.phase = Phase::Travel { from, to, t: 0.0 };
                }
            }
            Phase::Travel { to, t, .. } => {
                *t += dt;
                if *t >= TRAVEL_MS {
                    self.phase = Phase::Queue { t: 0.0, spots: *to };
                }
            }
            Phase::Queue { t, spots } => {
                *t += dt;
                if *t >= QUEUE_MS {
                    queue_done = Some(*spots);
                }
            }
            Phase::Play(player) => {
                // 法线偏移缓动（每球按自己当前段模板）
                for (i, b) in self.balls.iter_mut().enumerate() {
                    let tpl = &TEMPLATES[player.template_idx(i)];
                    b.offset += (tpl.offsets[i] - b.offset) * WANDER.offset_lerp;
                }
                player.tick(dt);
            }
        }
        if let Some(spots) = queue_done {
            self.phase = Phase::Play(Player::new(spots));
        }
    }

    fn ball_world_pos(&self, color_slot: usize) -> Vec2 {
        match &self.phase {
            Phase::AtLogo { .. } => self.anchors[color_slot],
            Phase::Travel { from, to, t } => {
                let k = smoothstep(*t / TRAVEL_MS);
                crate::sim::math::lerp(from[color_slot], to[color_slot], k)
            }
            Phase::Queue { spots, .. } => spots[color_slot],
            Phase::Play(player) => player.world_pos(color_slot, self.balls[color_slot].offset),
        }
    }

    fn fade_alpha(&self) -> f64 {
        match &self.phase {
            Phase::AtLogo { t } => smoothstep(*t / FADE_IN_MS),
            _ => 1.0,
        }
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

        // 调试：锚点圈 + 目标点 + 当前路径
        if self.debug {
            self.ctx.set_fill_style_str("rgba(17,17,17,0.28)");
            for a in self.anchors {
                let (sx, sy, d) = screen_of(a, w, h);
                self.ctx.begin_path();
                self.ctx.arc(sx, sy, 5.0 * d, 0.0, std::f64::consts::PI * 2.0).unwrap();
                self.ctx.fill();
            }
            if let Phase::Play(player) = &self.phase {
                // 目标点
                self.ctx.set_fill_style_str("rgba(17,17,17,0.4)");
                for s in 0..3 {
                    let (sx, sy, d) = screen_of(player.target_of(s), w, h);
                    self.ctx.begin_path();
                    self.ctx.arc(sx, sy, 3.0 * d, 0.0, std::f64::consts::PI * 2.0).unwrap();
                    self.ctx.fill();
                }

            }
        }

        let to_screen = |p: Vec2| screen_of(p, w, h);
        let order = match &self.phase {
            Phase::Play(p) => p.order,
            _ => ORDERS[0],
        };
        let pts: Vec<(f64, f64, f64)> =
            (0..3).map(|s| to_screen(self.ball_world_pos(order[s]))).collect();

        let mut depth_order: Vec<usize> = (0..3).collect();
        depth_order.sort_by(|a, b| pts[*a].1.partial_cmp(&pts[*b].1).unwrap());

        for i in depth_order {
            let color_slot = order[i];
            let (px, py, d) = pts[i];
            let radius = BALL_RADIUS * d * (w.min(h) / 700.0).clamp(0.6, 1.0);
            let v = self.ball_velocity(color_slot);
            let vx = v.x * w;
            let vy = v.y * h;
            let speed = (vx * vx + vy * vy).sqrt();

            // 模式分支：粒子化（椭圆拉伸）vs 拖尾化（纯圆 + 长实体拖尾）
            let (rx, ry, angle) = match self.mode {
                RenderMode::Particle => {
                    let sn = (speed / (ELLIPSE.speed_base * w)).clamp(0.0, 1.5);
                    let k = smoothstep((sn - ELLIPSE.threshold) / (1.5 - ELLIPSE.threshold));
                    let ratio = 1.0 + k * (ELLIPSE.max_ratio - 1.0);
                    (radius * ratio, radius / ratio, vy.atan2(vx))
                }
                RenderMode::Trail => (radius, radius, 0.0),
            };

            // 尾迹（粒子=短渐变线；拖尾=实心圆序列，Google 风格）
            match self.mode {
                RenderMode::Particle => {
                    if speed > 1.0 && fade > 0.9 {
                        let trail = MOTION_BLUR.trail_len * radius;
                        let (tx, ty) = (px - vx / speed * trail, py - vy / speed * trail);
                        let (r, g, b) = hex_to_rgb(self.balls[color_slot].color);
                        let lg = self.ctx.create_linear_gradient(tx, ty, px, py);
                        lg.add_color_stop(0.0, &format!("rgba({r},{g},{b},0)")).unwrap();
                        lg.add_color_stop(1.0, &format!("rgba({r},{g},{b},{})", MOTION_BLUR.trail_alpha)).unwrap();
                        self.ctx.begin_path();
                        self.ctx.move_to(tx, ty);
                        self.ctx.line_to(px, py);
                        self.ctx.set_stroke_style(&lg.into());
                        self.ctx.set_line_width(radius * 0.7);
                        self.ctx.stroke();
                    }
                }
                RenderMode::Trail => {
                    // 实心圆序列：纯色不透明，半径递减（无渐变花活）
                    let hist = &self.history[color_slot];
                    if hist.len() > 1 {
                        let n = hist.len();
                        for (k, (hx, hy)) in hist.iter().enumerate() {
                            let frac = k as f64 / (n as f64 - 1.0); // 0=最新
                            if frac > 0.75 {
                                continue; // 太老的忽略
                            }
                            let (sx, sy, _) = screen_of(Vec2 { x: *hx, y: *hy }, w, h);
                            let r = radius * (1.0 - frac * 0.65);
                            self.ctx.begin_path();
                            self.ctx.arc(sx, sy, r, 0.0, std::f64::consts::PI * 2.0).unwrap();
                            self.ctx.set_fill_style(&wasm_bindgen::JsValue::from(self.balls[color_slot].color));
                            self.ctx.fill();
                        }
                    }
                }
            }

            self.ctx.save();
            self.ctx.set_global_alpha(fade);
            self.ctx.begin_path();
            self.ctx.ellipse(px, py, rx, ry, angle, 0.0, std::f64::consts::PI * 2.0).unwrap();
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

