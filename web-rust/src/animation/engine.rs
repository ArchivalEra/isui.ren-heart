// 动画引擎 v4：三球独立轨迹（分开算、分开商量）
// - 每球独立规划队列（各自目标/模板/段间连续）
// - 目标去重（商量）：新目标与其它球保持最小距离 → 不重叠
// - 入场仪式保留：AtLogo → Travel → Queue（沿路径排队）→ Play（独立漫游）
use crate::config::params::*;
use crate::config::templates::{preferred_template, TEMPLATES};
use std::collections::VecDeque;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

#[derive(Clone, Copy, Debug)]
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

#[derive(Clone, Copy)]
struct Leg {
    from: Vec2,
    ctrl: Vec2,
    target: Vec2,
}

struct PlannedLeg {
    leg: Leg,
    template_idx: usize,
    dur_ms: f64,
}

/// 单球规划（每球独立）
struct BallPlan {
    legs: VecDeque<PlannedLeg>,
    cur: PlannedLeg,
    t: f64,
}

impl BallPlan {
    fn new(leg: Leg, template_idx: usize) -> Self {
        let dur = leg_duration_ms(&TEMPLATES[template_idx]);
        BallPlan { legs: VecDeque::new(), cur: PlannedLeg { leg, template_idx, dur_ms: dur }, t: 0.0 }
    }

    fn tick(&mut self, dt: f64) {
        self.t += dt / self.cur.dur_ms;
        while self.t >= 1.0 {
            match self.legs.pop_front() {
                Some(next) => {
                    self.cur = next;
                    self.t = 0.0;
                }
                None => {
                    self.t = 1.0;
                    break;
                }
            }
        }
    }
}

/// 执行器：三球独立消费
struct Player {
    plans: [BallPlan; 3],
    now_ms: f64,
    planned_ms: [f64; 3],
    order: [usize; 3],
}

impl Player {
    /// 从排队位置出发：每球 from = 队形上的自己的点，各自随机目标（去重）
    fn new(leg: Leg) -> Self {
        // 队形点（沿首段路径错开）
        let mut spots = [Vec2 { x: 0.0, y: 0.0 }; 3];
        let mut dirs = [Vec2 { x: 1.0, y: 0.0 }; 3];
        for i in 0..3 {
            let ti = i as f64 * WANDER.phase_gap;
            spots[i] = quad_bezier(leg.from, leg.ctrl, leg.target, ti);
            let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, ti);
            let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            dirs[i] = Vec2 { x: tan.x / l, y: tan.y / l };
        }
        let mut plans_buf: [Option<BallPlan>; 3] = [None, None, None];
        let mut planned: [f64; 3] = [0.0; 3];
        // 先算目标（互相去重：以队形点作为其它球的"当前位置"）
        let mut targets = [Vec2 { x: 0.5, y: 0.5 }; 3];
        for i in 0..3 {
            let others = [spots[(i + 1) % 3], spots[(i + 2) % 3]];
            targets[i] = random_target_apart(&others, 0.3);
        }
        for i in 0..3 {
            let dx = targets[i].x - spots[i].x;
            let dy = targets[i].y - spots[i].y;
            let dist = (dx * dx + dy * dy).sqrt().max(1e-6);
            let ctrl = Vec2 {
                x: (spots[i].x + dirs[i].x * dist * 0.5).clamp(0.0, 1.0),
                y: (spots[i].y + dirs[i].y * dist * 0.5).clamp(0.0, 1.0),
            };
            let leg = Leg { from: spots[i], ctrl, target: targets[i] };
            plans_buf[i] = Some(BallPlan::new(leg, 0));
            planned[i] = leg_duration_ms(&TEMPLATES[0]);
        }
        let plans = plans_buf.map(|p| p.expect("plan initialized"));
        Player { plans, now_ms: 0.0, planned_ms: planned, order: ORDERS[0] }
    }

    fn tick(&mut self, dt: f64) {
        self.now_ms += dt;
        for p in self.plans.iter_mut() {
            p.tick(dt);
        }
        self.ensure_horizon();
    }

    fn ensure_horizon(&mut self) {
        for i in 0..3 {
            while self.planned_ms[i] < self.now_ms + PLAN.horizon_ms - PLAN.step_ms {
                let next = self.plan_next(i);
                self.planned_ms[i] += next.dur_ms;
                self.plans[i].legs.push_back(next);
            }
        }
    }

    /// 单球规划下一段：from = 自己的终点（连续），目标与其它球商量（去重）
    fn plan_next(&mut self, i: usize) -> PlannedLeg {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        let from = self.plans[i].cur.leg.target;
        // 商量：与其它两球当前目标保持最小距离
        let others = [
            self.plans[(i + 1) % 3].cur.leg.target,
            self.plans[(i + 2) % 3].cur.leg.target,
        ];
        let target = random_target_apart(&others, 0.3);
        let dx = target.x - from.x;
        let dy = target.y - from.y;
        let dist = (dx * dx + dy * dy).sqrt().max(1e-6);

        // 模板（每球独立 roll）：网格偏好 / 随机 / 保留
        let cell = grid_cell(target);
        let roll = rng.gen::<f64>();
        let template_idx = if roll < PROB.switch_template {
            preferred_template(cell)
        } else if roll < PROB.switch_template + PROB.random_template {
            rng.gen_range(0..TEMPLATES.len())
        } else {
            self.plans[i].cur.template_idx
        };
        let template = &TEMPLATES[template_idx];

        // 切线连续 + 屏内控制点（含模板曲率小弯）
        let tan = bezier_tangent(
            self.plans[i].cur.leg.from,
            self.plans[i].cur.leg.ctrl,
            self.plans[i].cur.leg.target,
            1.0,
        );
        let tl = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
        let dir = Vec2 { x: tan.x / tl, y: tan.y / tl };
        let norm = Vec2 { x: -dir.y, y: dir.x };
        let ctrl = Vec2 {
            x: (from.x + dir.x * (dist * 0.5) + norm.x * dist * template.curvature * 0.35)
                .clamp(0.0, 1.0),
            y: (from.y + dir.y * (dist * 0.5) + norm.y * dist * template.curvature * 0.35)
                .clamp(0.0, 1.0),
        };

        // 排列（渲染顺序）8% 轮换
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

    fn ball_pos(&self, color_slot: usize) -> Vec2 {
        let plan = &self.plans[color_slot];
        let te = smoothstep(plan.t.clamp(0.0, 1.0));
        let leg = &plan.cur.leg;
        let p = quad_bezier(leg.from, leg.ctrl, leg.target, te);
        let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, te);
        let n = normal_of(tan);
        let off = 0.0; // 法线偏移由引擎层缓动注入
        Vec2 { x: p.x + n.x * off, y: p.y + n.y * off }
    }
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
    /// 调试模式：显示锚点/轨迹圈
    pub debug: bool,
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
            debug: false,
        }
    }

    pub fn frame(&mut self, dt: f64) {
        self.step(dt);
        self.render();
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
                // 法线偏移缓动（每球按自己当前段模板）
                for (i, b) in self.balls.iter_mut().enumerate() {
                    let tpl = &TEMPLATES[player.plans[i].cur.template_idx];
                    b.offset += (tpl.offsets[i] - b.offset) * WANDER.offset_lerp;
                }
                player.tick(dt);
            }
        }
        if let Some(leg) = queue_done {
            let player = Player::new(leg);
            self.phase = Phase::Play(player);
        }
    }

    fn order_of_phase(&self) -> [usize; 3] {
        match &self.phase {
            Phase::Play(p) => p.order,
            _ => ORDERS[0],
        }
    }

    fn ball_world_pos(&self, color_slot: usize) -> Vec2 {
        match &self.phase {
            Phase::AtLogo { .. } => anchors_for(self.order_of_phase())[color_slot],
            Phase::Travel { from, to, t } => {
                let k = smoothstep((t / TRAVEL_MS).min(1.0));
                lerp(from[color_slot], to[color_slot], k)
            }
            Phase::Queue { leg, .. } => {
                let ti = (color_slot as f64 * WANDER.phase_gap).min(1.0);
                self.on_leg(leg, ti, color_slot)
            }
            Phase::Play(player) => {
                let mut p = player.ball_pos(color_slot);
                // 法线偏移（缓动后的分离量）叠加
                let plan = &player.plans[color_slot];
                let leg = &plan.cur.leg;
                let te = smoothstep(plan.t.clamp(0.0, 1.0));
                let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, te);
                let norm = normal_of(tan);
                let off = self.balls[color_slot].offset * WANDER.offset_range;
                p.x += norm.x * off;
                p.y += norm.y * off;
                p
            }
        }
    }

    fn on_leg(&self, leg: &Leg, ti: f64, slot: usize) -> Vec2 {
        let te = smoothstep(ti.clamp(0.0, 1.0));
        let p = quad_bezier(leg.from, leg.ctrl, leg.target, te);
        let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, te);
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

    #[allow(deprecated)]
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

        // 调试：画锚点/队形参考
        if self.debug {
            self.ctx.set_fill_style_str("rgba(17,17,17,0.25)");
            for (ax, ay) in ANCHORS {
                let (sx, sy, d) = screen_of(Vec2 { x: ax, y: ay }, w, h);
                let r = 4.0 * d;
                self.ctx.begin_path();
                self.ctx.arc(sx, sy, r, 0.0, std::f64::consts::PI * 2.0).unwrap();
                self.ctx.fill();
            }
        }

        let to_screen = |p: Vec2| screen_of(p, w, h);
        let pts: Vec<(f64, f64, f64)> = (0..3)
            .map(|s| to_screen(self.ball_world_pos(self.order_of_phase()[s])))
            .collect();

        let mut order: Vec<usize> = (0..3).collect();
        order.sort_by(|a, b| pts[*a].1.partial_cmp(&pts[*b].1).unwrap());

        for i in order {
            let color_slot = self.order_of_phase()[i];
            let (px, py, d) = pts[i];
            let radius = BALL_RADIUS * d * (w.min(h) / 700.0).clamp(0.6, 1.0);
            let v = self.ball_velocity(color_slot);
            let vx = v.x * w;
            let vy = v.y * h;
            let speed = (vx * vx + vy * vy).sqrt();

            let sn = (speed / (ELLIPSE.speed_base * w)).clamp(0.0, 1.5);
            let k = smoothstep(((sn - ELLIPSE.threshold) / (1.5 - ELLIPSE.threshold)).clamp(0.0, 1.0));
            let ratio = 1.0 + k * (ELLIPSE.max_ratio - 1.0);
            let angle = vy.atan2(vx);
            let rx = radius * ratio;
            let ry = radius / ratio;

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

// ---------- 工具 ----------

fn screen_of(p: Vec2, w: f64, h: f64) -> (f64, f64, f64) {
    let d = depth_scale(p.y);
    ((p.x - 0.5) * w * d + w / 2.0, p.y * h, d)
}

fn leg_duration_ms(template: &crate::config::templates::Template) -> f64 {
    16.7 / (WANDER.base_speed * template.speed)
}

fn grid_cell(p: Vec2) -> usize {
    let gx = ((p.x * GRID_COLS as f64) as usize).min(GRID_COLS - 1);
    let gy = ((p.y * GRID_ROWS as f64) as usize).min(GRID_ROWS - 1);
    gy * GRID_COLS + gx
}

/// 商量：随机目标但与其它球保持最小距离（尝试 10 次）
fn random_target_apart(others: &[Vec2; 2], min_dist: f64) -> Vec2 {
    let md2 = min_dist * min_dist;
    for _ in 0..10 {
        let p = random_screen_point();
        let ok = others
            .iter()
            .all(|o| (o.x - p.x) * (o.x - p.x) + (o.y - p.y) * (o.y - p.y) >= md2);
        if ok {
            return p;
        }
    }
    random_screen_point()
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
