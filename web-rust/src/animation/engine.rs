// 动画引擎 v3：规划/执行双进程解耦
// 规划器：每 15s 预计算未来 60s 的运动曲线（目标/模板/排列，段间切线连续）
// 执行器：只沿预计算曲线采样（零决策 → 无闪现、轨迹连贯）
// 入场仪式保留：AtLogo → Travel → Queue → Play(规划-执行)
use crate::config::params::*;
use crate::config::templates::{preferred_template, TEMPLATES};
use std::collections::VecDeque;
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
    pub offset: f64,
    pub color: &'static str,
}

/// 一段漫游路径（from → ctrl → target 二次贝塞尔）
#[derive(Clone, Copy)]
struct Leg {
    from: Vec2,
    ctrl: Vec2,
    target: Vec2,
}

/// 规划段（执行器的最小消费单位）
struct PlannedLeg {
    leg: Leg,
    template_idx: usize,
    dur_ms: f64,
}

/// 执行器（播放器）：只消费预规划曲线
struct Player {
    legs: VecDeque<PlannedLeg>,
    cur: PlannedLeg,
    t: f64,
    now_ms: f64,
    planned_ms: f64,
    order: [usize; 3],
}

enum Phase {
    AtLogo { t: f64 },
    Travel { from: [Vec2; 3], to: [Vec2; 3], t: f64 },
    Queue { t: f64, leg: Leg },
    Play(Player),
}

pub struct BallsEngine {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    balls: [Ball; 3],
    prev_pos: [Vec2; 3],
    phase: Phase,
    inited: bool,
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
            Ball { slot: 0, offset: 0.0, color: BALL_COLORS[0] },
            Ball { slot: 1, offset: 0.0, color: BALL_COLORS[1] },
            Ball { slot: 2, offset: 0.0, color: BALL_COLORS[2] },
        ];
        Self {
            canvas,
            ctx,
            balls,
            prev_pos: [Vec2 { x: 0.5, y: 0.5 }; 3],
            phase: Phase::AtLogo { t: 0.0 },
            inited: false,
        }
    }

    pub fn frame(&mut self, dt: f64) {
        self.step(dt);
        self.render();
        // prev_pos 首帧初始化（避免第一帧假速度导致椭圆/尾迹闪现）
        if !self.inited {
            for s in 0..3 {
                self.prev_pos[s] = self.ball_world_pos(s);
            }
            self.inited = true;
        }
        for s in 0..3 {
            self.prev_pos[s] = self.ball_world_pos(s);
        }
    }

    fn ball_velocity(&self, slot: usize) -> Vec2 {
        let cur = self.ball_world_pos(slot);
        let prev = self.prev_pos[slot];
        Vec2 { x: cur.x - prev.x, y: cur.y - prev.y }
    }

    // ---------- 状态机 ----------

    fn step(&mut self, dt: f64) {
        let mut queue_done: Option<Leg> = None;

        match &mut self.phase {
            Phase::AtLogo { t } => {
                *t += dt;
                if *t >= AT_LOGO_MS {
                    let from = anchors_for(self.order_of_phase());
                    let to = random_trio_targets();
                    self.phase = Phase::Travel { from, to, t: 0.0 };
                }
            }
            Phase::Travel { to, t, .. } => {
                *t += dt;
                if *t >= TRAVEL_MS {
                    let leg = Leg { from: to[0], ctrl: to[0], target: random_screen_point() };
                    self.phase = Phase::Queue { t: 0.0, leg };
                }
            }
            Phase::Queue { t, leg } => {
                *t += dt;
                if *t >= QUEUE_MS {
                    queue_done = Some(*leg);
                }
            }
            Phase::Play(player) => {
                // 法线偏移缓动（引擎层持有球状态，按当前规划段模板）
                let tpl = &TEMPLATES[player.cur.template_idx];
                for (i, b) in self.balls.iter_mut().enumerate() {
                    b.offset += (tpl.offsets[i] - b.offset) * WANDER.offset_lerp;
                }
                player.tick(dt);
            }
        }

        if let Some(leg) = queue_done {
            // 进入规划-执行模式：首段从排队位置出发
            let mut player = Player::new(leg);
            player.ensure_horizon();
            self.phase = Phase::Play(player);
        }
    }

    fn order_of_phase(&self) -> [usize; 3] {
        match &self.phase {
            Phase::Play(p) => p.order,
            _ => ORDERS[0],
        }
    }

    /// 球位置（按阶段）
    fn ball_world_pos(&self, slot: usize) -> Vec2 {
        match &self.phase {
            Phase::AtLogo { .. } => anchors_for(self.order_of_phase())[slot],
            Phase::Travel { from, to, t } => {
                let k = smoothstep((t / TRAVEL_MS).min(1.0));
                lerp(from[slot], to[slot], k)
            }
            Phase::Queue { leg, .. } => {
                let ti = (slot as f64 * WANDER.phase_gap).min(1.0);
                self.on_leg(leg, ti, slot)
            }
            Phase::Play(player) => {
                let ti = (player.t + slot as f64 * WANDER.phase_gap).min(1.0);
                let leg = &player.cur.leg;
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

    // ---------- 渲染（纯色球 + 椭圆化阈值 + 尾迹） ----------

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

        let to_screen = |p: Vec2| -> (f64, f64, f64) {
            let d = depth_scale(p.y);
            ((p.x - 0.5) * w * d + w / 2.0, p.y * h, d)
        };
        let pts: Vec<(f64, f64, f64)> =
            (0..3).map(|s| to_screen(self.ball_world_pos(self.order_of_phase()[s]))).collect();

        let mut order: Vec<usize> = (0..3).collect();
        order.sort_by(|a, b| pts[*a].1.partial_cmp(&pts[*b].1).unwrap());

        for i in order {
            let slot = self.order_of_phase()[i];
            let (px, py, d) = pts[i];
            let radius = BALL_RADIUS * d * (w.min(h) / 700.0).clamp(0.6, 1.0);
            let v = self.ball_velocity(slot);
            let vx = v.x * w;
            let vy = v.y * h;
            let speed = (vx * vx + vy * vy).sqrt();

            // 高速椭圆化：阈值 + 平滑压缩曲线（只有非常快才压扁）
            let sn = (speed / (ELLIPSE.speed_base * w)).clamp(0.0, 1.5);
            let k = smoothstep(((sn - ELLIPSE.threshold) / (1.5 - ELLIPSE.threshold)).clamp(0.0, 1.0));
            let ratio = 1.0 + k * (ELLIPSE.max_ratio - 1.0);
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

            // 纯色球
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

// ---------- 执行器（Player） ----------

impl Player {
    fn new(leg: Leg) -> Self {
        let dur = leg_duration_ms(&TEMPLATES[0]);
        let cur = PlannedLeg { leg, template_idx: 0, dur_ms: dur };
        let p = Player {
            legs: VecDeque::new(),
            cur,
            t: 0.0,
            now_ms: 0.0,
            planned_ms: dur,
            order: ORDERS[0],
        };
        p
    }

    fn tick(&mut self, dt: f64) {
        self.now_ms += dt;
        self.t += dt / self.cur.dur_ms;
        while self.t >= 1.0 {
            if let Some(next) = self.legs.pop_front() {
                self.cur = next;
                self.t = 0.0;
            } else {
                // 规划断层（不应发生，兜底：原地等）
                self.t = 1.0;
                break;
            }
        }
        self.ensure_horizon();
    }

    /// 保证规划窗口：提前 15s 补足到 60s（预计算时间上限 1 分钟）
    fn ensure_horizon(&mut self) {
        while self.planned_ms < self.now_ms + PLAN.horizon_ms - PLAN.step_ms {
            let next = self.plan_next();
            self.planned_ms += next.dur_ms;
            self.legs.push_back(next);
        }
    }

    /// 规划下一段：切线连续（ctrl 沿上一段终点切线方向）+ 网格偏好模板 + 概率换排列
    fn plan_next(&mut self) -> PlannedLeg {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        let from = self.cur.leg.target;
        let target = random_screen_point();
        let dx = target.x - from.x;
        let dy = target.y - from.y;
        let dist = (dx * dx + dy * dy).sqrt().max(1e-6);

        // 模板：目标所在精细网格的偏好（概率见 PROB）/ 保留当前
        let cell = grid_cell(target);
        let template_idx = if rng.gen::<f64>() < PROB.switch_template {
            preferred_template(cell)
        } else {
            self.cur.template_idx
        };
        let template = &TEMPLATES[template_idx];

        // 切线连续：ctrl = from + 上一段终点切线方向 × dist/2 + 法线小弯曲
        let (last_dir, last_norm) = if self.cur.leg.target.x == self.cur.leg.from.x
            && self.cur.leg.target.y == self.cur.leg.from.y
        {
            (Vec2 { x: dx / dist, y: dy / dist }, Vec2 { x: -dy / dist, y: dx / dist })
        } else {
            let tan = bezier_tangent(self.cur.leg.from, self.cur.leg.ctrl, self.cur.leg.target, 1.0);
            let tl = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            let dir = Vec2 { x: tan.x / tl, y: tan.y / tl };
            (dir, Vec2 { x: -dir.y, y: dir.x })
        };
        let ctrl = Vec2 {
            x: from.x + last_dir.x * (dist * 0.5) + last_norm.x * dist * template.curvature * 0.6,
            y: from.y + last_dir.y * (dist * 0.5) + last_norm.y * dist * template.curvature * 0.6,
        };

        // 排列：8% 概率切换（规划时决定，执行时不变 → 无闪现）
        if rng.gen::<f64>() < PROB.switch_order {
            let next = ORDERS[rng.gen_range(0..ORDERS.len())];
            if next != self.order {
                self.order = next;
            }
        }

        PlannedLeg {
            leg: Leg { from, ctrl, target },
            template_idx,
            dur_ms: leg_duration_ms(template),
        }
    }
}

// ---------- 工具 ----------

fn leg_duration_ms(template: &crate::config::templates::Template) -> f64 {
    // t 从 0→1 所需毫秒：1 / (base_speed * speed) 帧 × 16.7ms
    16.7 / (WANDER.base_speed * template.speed)
}

fn grid_cell(p: Vec2) -> usize {
    let gx = ((p.x * GRID_COLS as f64) as usize).min(GRID_COLS - 1);
    let gy = ((p.y * GRID_ROWS as f64) as usize).min(GRID_ROWS - 1);
    gy * GRID_COLS + gx
}

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

fn random_screen_point() -> Vec2 {
    Vec2 { x: rand::random::<f64>(), y: rand::random::<f64>() }
}

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
