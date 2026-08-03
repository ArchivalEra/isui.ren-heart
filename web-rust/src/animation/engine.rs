// 动画引擎：入场仪式（AtLogo→Travel→Queue→Play）+ 目标点漫游
// （贝塞尔弧线路径，无循环曲线）+ 精细网格模板偏好 + 排列 + 透视
// + 高速椭圆化 + 动态模糊（无球体阴影）
use crate::config::params::*;
use crate::config::templates::{preferred_template, TEMPLATES};
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

#[derive(Clone, Copy)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

pub struct Ball {
    #[allow(dead_code)] // 配置契约：排列槽位
    pub slot: usize,
    pub target_offset: f64,
    pub offset: f64,
    pub color: &'static str,
}

/// 入场状态机
enum Phase {
    /// 三球停在 logo 锚点（淡入）
    AtLogo { t: f64 },
    /// 飞往随机目标（smoothstep 直线缓动）
    Travel { from: [Vec2; 3], to: [Vec2; 3], t: f64 },
    /// 沿路径中段排队
    Queue { t: f64, leg: Leg },
    /// 漫游玩耍（目标点 → 贝塞尔弧线 → 新目标）
    Play { t: f64, leg: Leg, template_idx: usize },
}

/// 一段漫游路径（from → ctrl → target 二次贝塞尔）
#[derive(Clone, Copy)]
struct Leg {
    from: Vec2,
    ctrl: Vec2,
    target: Vec2,
}

pub struct BallsEngine {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    order: [usize; 3],
    balls: [Ball; 3],
    prev_pos: [Vec2; 3],
    phase: Phase,
    last_cell: usize,
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
            Ball { slot: 0, target_offset: TEMPLATES[0].offsets[0], offset: 0.0, color: BALL_COLORS[0] },
            Ball { slot: 1, target_offset: TEMPLATES[0].offsets[1], offset: 0.0, color: BALL_COLORS[1] },
            Ball { slot: 2, target_offset: TEMPLATES[0].offsets[2], offset: 0.0, color: BALL_COLORS[2] },
        ];
        Self {
            canvas,
            ctx,
            order: ORDERS[0],
            balls,
            prev_pos: [Vec2 { x: 0.5, y: 0.5 }; 3],
            phase: Phase::AtLogo { t: 0.0 },
            last_cell: usize::MAX,
        }
    }

    /// 每帧（dt: 距上帧真实毫秒）
    pub fn frame(&mut self, dt: f64) {
        self.step(dt);
        self.render();
        for s in 0..3 {
            self.prev_pos[s] = self.ball_world_pos(s);
        }
    }

    fn ball_velocity(&self, slot: usize) -> Vec2 {
        let cur = self.ball_world_pos(slot);
        let prev = self.prev_pos[slot];
        Vec2 { x: cur.x - prev.x, y: cur.y - prev.y }
    }

    // ---------- 逻辑 ----------

    fn step(&mut self, dt: f64) {
        let dt_norm = dt / 16.7;
        let mut queue_done: Option<Leg> = None;
        let mut region_event: Option<(usize, usize, Leg, f64)> = None;

        match &mut self.phase {
            Phase::AtLogo { t } => {
                *t += dt;
                if *t >= AT_LOGO_MS {
                    let from = anchors_for(self.order);
                    let to = random_trio_targets();
                    self.phase = Phase::Travel { from, to, t: 0.0 };
                }
            }
            Phase::Travel { to, t, .. } => {
                *t += dt;
                if *t >= TRAVEL_MS {
                    let leg = bend_leg(
                        Leg { from: to[0], ctrl: to[0], target: random_screen_point() },
                        0.0,
                    );
                    self.phase = Phase::Queue { t: 0.0, leg };
                }
            }
            Phase::Queue { t, leg } => {
                *t += dt;
                if *t >= QUEUE_MS {
                    queue_done = Some(*leg);
                }
            }
            Phase::Play { t, leg, template_idx } => {
                let template = &TEMPLATES[*template_idx];
                *t += WANDER.base_speed * template.speed * dt_norm;
                if *t >= 1.0 {
                    let new_leg = bend_leg(
                        Leg { from: leg.target, ctrl: leg.target, target: random_screen_point() },
                        template.curvature,
                    );
                    *t = 0.0;
                    *leg = new_leg;
                } else {
                    for (i, b) in self.balls.iter_mut().enumerate() {
                        b.offset += (template.offsets[i] - b.offset) * WANDER.offset_lerp;
                    }
                }
                let center = quad_bezier(leg.from, leg.ctrl, leg.target, *t);
                let gx = ((center.x * GRID_COLS as f64) as usize).min(GRID_COLS - 1);
                let gy = ((center.y * GRID_ROWS as f64) as usize).min(GRID_ROWS - 1);
                let cell = gy * GRID_COLS + gx;
                if self.last_cell != cell {
                    self.last_cell = cell;
                    region_event = Some((cell, *template_idx, *leg, *t));
                }
            }
        }

        // 阶段转换（match 外，避免借用冲突）
        if let Some(leg) = queue_done {
            self.phase = Phase::Play { t: 0.5, leg, template_idx: 0 };
        }
        if let Some((cell, template_idx, leg, t)) = region_event {
            self.on_region_enter(cell, template_idx, leg, t);
        }
    }

    fn on_region_enter(&mut self, cell: usize, template_idx: usize, leg: Leg, t: f64) {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        // 精细网格决定运动模式：进格以概率切到该格偏好模板
        if rng.gen::<f64>() < PROB.switch_template {
            let idx = preferred_template(cell);
            if idx != template_idx {
                let curved = bend_leg(leg, TEMPLATES[idx].curvature);
                self.set_template_offsets(idx);
                self.phase = Phase::Play { t, leg: curved, template_idx: idx };
                return;
            }
        }
        if rng.gen::<f64>() < PROB.switch_order {
            let next = ORDERS[rng.gen_range(0..ORDERS.len())];
            if next != self.order {
                self.order = next;
            }
        }
    }

    fn set_template_offsets(&mut self, idx: usize) {
        let tpl = &TEMPLATES[idx];
        for (i, b) in self.balls.iter_mut().enumerate() {
            b.target_offset = tpl.offsets[i];
        }
    }

    /// 球位置（按阶段）
    fn ball_world_pos(&self, slot: usize) -> Vec2 {
        match &self.phase {
            Phase::AtLogo { .. } => anchors_for(self.order)[slot],
            Phase::Travel { from, to, t } => {
                let k = smoothstep((t / TRAVEL_MS).min(1.0));
                lerp(from[slot], to[slot], k)
            }
            Phase::Queue { leg, .. } => {
                let ti = (0.5 + slot as f64 * WANDER.phase_gap).min(1.0);
                self.on_leg(leg, ti, slot)
            }
            Phase::Play { t, leg, .. } => {
                let ti = (*t + slot as f64 * WANDER.phase_gap).min(1.0);
                self.on_leg(leg, ti, slot)
            }
        }
    }

    /// 贝塞尔路径上的球位 + 法线偏移（后球弧度大/小）
    fn on_leg(&self, leg: &Leg, ti: f64, slot: usize) -> Vec2 {
        let p = quad_bezier(leg.from, leg.ctrl, leg.target, ti);
        let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, ti);
        let n = normal_of(tan);
        let off = self.balls[slot].offset * WANDER.offset_range;
        Vec2 { x: p.x + n.x * off, y: p.y + n.y * off }
    }

    fn fade_alpha(&self) -> f64 {
        match &self.phase {
            Phase::AtLogo { t } => (t / 800.0).min(1.0),
            _ => 1.0,
        }
    }

    // ---------- 渲染（透视 + 椭圆化 + 尾迹，无阴影） ----------

    #[allow(deprecated)] // CanvasGradient 无 *_str 版 API
    fn render(&mut self) {
        let cw = self.canvas.client_width() as f64;
        let ch = self.canvas.client_height() as f64;
        if cw == 0.0 || ch == 0.0 {
            return;
        }
        // 分辨率自适应（resize/旋转/缩放）
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

        let to_screen = |p: Vec2| -> (f64, f64, f64) {
            let d = depth_scale(p.y);
            ((p.x - 0.5) * w * d + w / 2.0, p.y * h, d)
        };
        let pts: Vec<(f64, f64, f64)> =
            (0..3).map(|s| to_screen(self.ball_world_pos(self.order[s]))).collect();

        // 按深度排序（远的先画）
        let mut order: Vec<usize> = (0..3).collect();
        order.sort_by(|a, b| pts[*a].1.partial_cmp(&pts[*b].1).unwrap());

        for i in order {
            let slot = self.order[i];
            let (px, py, d) = pts[i];
            let radius = BALL_RADIUS * d * (w.min(h) / 700.0).clamp(0.6, 1.0);
            let v = self.ball_velocity(slot);
            let vx = v.x * w;
            let vy = v.y * h;
            let speed = (vx * vx + vy * vy).sqrt();

            // 高速椭圆化
            let ratio = 1.0 + (speed / (ELLIPSE.speed_base * w)).min(ELLIPSE.max_ratio - 1.0);
            let angle = vy.atan2(vx);
            let rx = radius * ratio;
            let ry = radius / ratio;

            // 动态模糊尾迹
            if speed > 1.0 && fade > 0.9 {
                let trail = MOTION_BLUR.trail_len * radius;
                let (tx, ty) = (px - vx / speed * trail, py - vy / speed * trail);
                let (r, g, b) = hex_to_rgb(self.balls[slot].color);
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

            // 纯色球体（无渐变无阴影）
            self.ctx.save();
            self.ctx.set_global_alpha(fade);
            self.ctx.begin_path();
            self.ctx.ellipse(px, py, rx, ry, angle, 0.0, std::f64::consts::PI * 2.0).unwrap();
            self.ctx.set_fill_style(&wasm_bindgen::JsValue::from(self.balls[slot].color));
            self.ctx.fill();
            self.ctx.restore();
        }
    }
}

// ---------- 几何工具 ----------

fn quad_bezier(a: Vec2, c: Vec2, b: Vec2, t: f64) -> Vec2 {
    let u = 1.0 - t;
    Vec2 {
        x: u * u * a.x + 2.0 * u * t * c.x + t * t * b.x,
        y: u * u * a.y + 2.0 * u * t * c.y + t * t * b.y,
    }
}

fn bezier_tangent(a: Vec2, c: Vec2, b: Vec2, t: f64) -> Vec2 {
    let u = 1.0 - t;
    Vec2 {
        x: 2.0 * u * (c.x - a.x) + 2.0 * t * (b.x - c.x),
        y: 2.0 * u * (c.y - a.y) + 2.0 * t * (b.y - c.y),
    }
}

fn normal_of(tan: Vec2) -> Vec2 {
    let len = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
    Vec2 { x: tan.y / len, y: -tan.x / len }
}

/// 按曲率弯曲一段路径（控制点 = 中点 + 法线偏移 × 距离 × 曲率）
fn bend_leg(leg: Leg, curvature: f64) -> Leg {
    let dx = leg.target.x - leg.from.x;
    let dy = leg.target.y - leg.from.y;
    let dist = (dx * dx + dy * dy).sqrt().max(1e-9);
    let mid = Vec2 { x: (leg.from.x + leg.target.x) / 2.0, y: (leg.from.y + leg.target.y) / 2.0 };
    // 法线方向（左侧）
    let nx = -dy / dist;
    let ny = dx / dist;
    let ctrl = Vec2 { x: mid.x + nx * dist * curvature, y: mid.y + ny * dist * curvature };
    Leg { from: leg.from, ctrl, target: leg.target }
}

/// 全屏随机点（含边边角角，0..1 全域）
fn random_screen_point() -> Vec2 {
    Vec2 { x: rand::random::<f64>(), y: rand::random::<f64>() }
}

/// 三球旅行目标（随机点 + 队列偏移）
fn random_trio_targets() -> [Vec2; 3] {
    let c = random_screen_point();
    let mut tos = [c; 3];
    for i in 1..3 {
        let off = WANDER.phase_gap * i as f64;
        tos[i] = Vec2 { x: (c.x + off).clamp(0.0, 1.0), y: c.y };
    }
    tos
}

fn anchors_for(order: [usize; 3]) -> [Vec2; 3] {
    let mut out = [Vec2 { x: 0.0, y: 0.0 }; 3];
    for (i, slot) in order.iter().enumerate() {
        let (ax, ay) = ANCHORS[*slot];
        out[i] = Vec2 { x: ax, y: ay };
    }
    out
}

fn smoothstep(k: f64) -> f64 {
    k * k * (3.0 - 2.0 * k)
}

fn lerp(a: Vec2, b: Vec2, k: f64) -> Vec2 {
    Vec2 { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
}

fn hex_to_rgb(hex: &str) -> (u8, u8, u8) {
    let h = hex.trim_start_matches('#');
    (
        u8::from_str_radix(&h[0..2], 16).unwrap_or(0),
        u8::from_str_radix(&h[2..4], 16).unwrap_or(0),
        u8::from_str_radix(&h[4..6], 16).unwrap_or(0),
    )
}
