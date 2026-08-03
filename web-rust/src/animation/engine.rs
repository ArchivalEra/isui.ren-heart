// 动画引擎：入场仪式（AtLogo→Travel→Queue→Play）+ 主曲线 + 法线偏移
// + 分块概率 + 排列弹性 + 透视渲染 + 高速椭圆化 + 动态模糊
use crate::animation::curves::{curve_of, normal_at, CurveFn, Vec2};
use crate::config::params::*;
use crate::config::templates::{random_template, TEMPLATES};
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

pub struct Ball {
    #[allow(dead_code)] // 配置契约：排列槽位，管理工具/调试用
    pub slot: usize,
    pub target_offset: f64,
    pub offset: f64,
    pub color: &'static str,
}

/// 入场状态机
enum Phase {
    /// 三球停在 logo 锚点（淡入）
    AtLogo { t: f64 },
    /// 飞往随机区域（贝塞尔缓动）
    Travel { from: [Vec2; 3], to: [Vec2; 3], t: f64 },
    /// 沿曲线随机排队
    Queue { t: f64, t_base: f64 },
    /// 正常玩耍
    Play,
}

pub struct BallsEngine {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    template_idx: usize,
    curve: CurveFn,
    order: [usize; 3],
    balls: [Ball; 3],
    t: f64,
    last_grid: String,
    prev_pos: [Vec2; 3],
    phase: Phase,
}

impl BallsEngine {
    pub fn new(canvas: HtmlCanvasElement) -> Self {
        let ctx = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()
            .unwrap();
        let template = &TEMPLATES[0];
        let balls = [
            Ball { slot: 0, target_offset: template.offsets[0], offset: 0.0, color: BALL_COLORS[0] },
            Ball { slot: 1, target_offset: template.offsets[1], offset: 0.0, color: BALL_COLORS[1] },
            Ball { slot: 2, target_offset: template.offsets[2], offset: 0.0, color: BALL_COLORS[2] },
        ];
        Self {
            canvas,
            ctx,
            template_idx: 0,
            curve: curve_of(TEMPLATES[0].curve),
            order: ORDERS[0],
            balls,
            t: 0.0,
            last_grid: String::new(),
            prev_pos: [Vec2 { x: 0.5, y: 0.5 }; 3],
            phase: Phase::AtLogo { t: 0.0 },
        }
    }

    /// 每帧调用（dt: 距上帧真实毫秒，由 rAF 循环传入）
    pub fn frame(&mut self, dt: f64) {
        self.step(dt);
        self.render();
        for s in 0..3 {
            self.prev_pos[s] = self.ball_world_pos(s);
        }
    }

    /// 每球速度向量（世界坐标）
    fn ball_velocity(&self, slot: usize) -> Vec2 {
        let cur = self.ball_world_pos(slot);
        let prev = self.prev_pos[slot];
        Vec2 { x: cur.x - prev.x, y: cur.y - prev.y }
    }

    // ---------- 逻辑 ----------

    fn step(&mut self, dt: f64) {
        let dt_norm = dt / 16.7; // 归一化到 60fps 基准（帧率无关）

        match &mut self.phase {
            Phase::AtLogo { t } => {
                *t += dt;
                if *t >= AT_LOGO_MS {
                    let from = anchors_for(self.order);
                    let to = self.random_targets();
                    self.phase = Phase::Travel { from, to, t: 0.0 };
                }
            }
            Phase::Travel { t, .. } => {
                *t += dt;
                if *t >= TRAVEL_MS {
                    let t_base = rand::random::<f64>();
                    self.phase = Phase::Queue { t: 0.0, t_base };
                }
            }
            Phase::Queue { t, t_base } => {
                *t += dt;
                if *t >= QUEUE_MS {
                    self.t = *t_base;
                    self.phase = Phase::Play;
                }
            }
            Phase::Play => {
                self.t += SPEED.tps * dt_norm;
                // 法线偏移缓动
                for b in self.balls.iter_mut() {
                    b.offset += (b.target_offset - b.offset) * SPEED.offset_lerp;
                }
                // 区域检测：队首球位置
                let lead = self.ball_world_pos(self.order[0]);
                let gx = ((lead.x * GRID_COLS as f64).floor() as usize).min(GRID_COLS - 1);
                let gy = ((lead.y * GRID_ROWS as f64).floor() as usize).min(GRID_ROWS - 1);
                let key = format!("{gx},{gy}");
                if key != self.last_grid {
                    self.last_grid = key;
                    self.on_region_enter();
                }
            }
        }
    }

    fn on_region_enter(&mut self) {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        if rng.gen::<f64>() < PROB.switch_template {
            let (idx, template) = random_template(TEMPLATES[self.template_idx].curve);
            self.template_idx = idx;
            self.curve = curve_of(template.curve);
            for (i, b) in self.balls.iter_mut().enumerate() {
                b.target_offset = template.offsets[i];
            }
        }
        if rng.gen::<f64>() < PROB.switch_order {
            let next = ORDERS[rng.gen_range(0..ORDERS.len())];
            if next != self.order {
                self.order = next;
            }
        }
    }

    /// 随机目标：随机网格区域中心 + 队列偏移
    fn random_targets(&self) -> [Vec2; 3] {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let gx = rng.gen_range(0..GRID_COLS) as f64;
        let gy = rng.gen_range(0..GRID_ROWS) as f64;
        let c = Vec2 { x: (gx + 0.5) / GRID_COLS as f64, y: (gy + 0.5) / GRID_ROWS as f64 };
        let mut tos = [c; 3];
        for i in 1..3 {
            let p = (self.curve)(SPEED.phase_gap * i as f64);
            tos[i] = Vec2 { x: c.x + (p.x - 0.5) * 0.14, y: c.y + (p.y - 0.5) * 0.14 };
        }
        tos
    }

    fn ball_world_pos(&self, slot: usize) -> Vec2 {
        match &self.phase {
            Phase::AtLogo { .. } => anchors_for(self.order)[slot],
            Phase::Travel { from, to, t } => {
                let k = smoothstep((t / TRAVEL_MS).min(1.0));
                lerp(from[slot], to[slot], k)
            }
            Phase::Queue { t_base, .. } => {
                let phase = t_base + slot as f64 * SPEED.phase_gap;
                (self.curve)(phase)
            }
            Phase::Play => {
                let yo = (self.t * SPEED.yo_yo_freq).sin() * SPEED.yo_yo_amp;
                let phase = self.t + slot as f64 * (SPEED.phase_gap + yo);
                let p = (self.curve)(phase);
                let n = normal_at(self.curve, phase);
                let off = self.balls[slot].offset * SPEED.offset_range;
                Vec2 { x: p.x + n.x * off, y: p.y + n.y * off }
            }
        }
    }

    /// 入场淡入系数
    fn fade_alpha(&self) -> f64 {
        match &self.phase {
            Phase::AtLogo { t } => (t / 800.0).min(1.0),
            _ => 1.0,
        }
    }

    // ---------- 渲染（透视 + 高速椭圆化 + 动态模糊） ----------

    #[allow(deprecated)] // CanvasGradient 无 *_str 版 API
    fn render(&mut self) {
        // 分辨率自适应：resize/旋转/缩放后位图随之更新（避免拉伸模糊）
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
        if (self.canvas.width() as f64 - bw).abs() > 0.5 || (self.canvas.height() as f64 - bh).abs() > 0.5 {
            self.canvas.set_width(bw as u32);
            self.canvas.set_height(bh as u32);
            self.ctx.set_transform(dpr, 0.0, 0.0, dpr, 0.0, 0.0).unwrap();
        }
        let w = cw;
        let h = ch;
        let fade = self.fade_alpha();
        self.ctx.clear_rect(0.0, 0.0, w, h);

        let to_screen = |p: Vec2| -> (f64, f64, f64) {
            let d = depth_scale(p.y);
            ((p.x - 0.5) * w * d + w / 2.0, p.y * h, d)
        };
        let pts: Vec<(f64, f64, f64)> =
            (0..3).map(|s| to_screen(self.ball_world_pos(self.order[s]))).collect();

        // 地面连接线（Play 阶段才画，入场阶段无意义）
        if matches!(self.phase, Phase::Play) {
            self.ctx.set_stroke_style_str(AMBIENT.shadow_color);
            self.ctx.set_line_width(1.5);
            self.ctx.begin_path();
            for (i, (x, y, _)) in pts.iter().enumerate() {
                if i == 0 {
                    self.ctx.move_to(*x, *y);
                } else {
                    self.ctx.line_to(*x, *y);
                }
            }
            self.ctx.stroke();
        }

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

            // 高速椭圆化：沿速度方向拉长（静止=圆）
            let ratio = 1.0 + (speed / (ELLIPSE.speed_base * w)).min(ELLIPSE.max_ratio - 1.0);
            let angle = vy.atan2(vx);
            let rx = radius * ratio;
            let ry = radius / ratio;

            // 动态模糊尾迹（运动时）
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

            // 地面阴影
            self.ctx.save();
            self.ctx.begin_path();
            self.ctx.ellipse(px, py + radius * 0.85, rx * 1.15, ry * 0.32, 0.0, 0.0, std::f64::consts::PI * 2.0).unwrap();
            self.ctx.set_fill_style_str(&format!("rgba(17,17,17,{})", (0.07 * d + 0.02) * fade));
            self.ctx.set_filter(&format!("blur({}px)", 2.0 + (1.0 - d) * 3.0));
            self.ctx.fill();
            self.ctx.restore();

            // 椭圆化 3D 球体：径向渐变（高光沿主轴偏移）
            self.ctx.save();
            self.ctx.set_global_alpha(fade);
            let hx = px - rx * 0.35 * angle.cos();
            let hy = py - rx * 0.35 * angle.sin();
            let grad = self.ctx.create_radial_gradient(hx, hy, rx * 0.1, px, py, rx * 1.1).unwrap();
            grad.add_color_stop(0.0, &lighten(self.balls[slot].color, 0.55)).unwrap();
            grad.add_color_stop(0.45, self.balls[slot].color).unwrap();
            grad.add_color_stop(1.0, &darken(self.balls[slot].color, 0.35)).unwrap();
            self.ctx.begin_path();
            self.ctx.ellipse(px, py, rx, ry, angle, 0.0, std::f64::consts::PI * 2.0).unwrap();
            self.ctx.set_fill_style(&grad.into());
            self.ctx.set_shadow_color(AMBIENT.shadow_color);
            self.ctx.set_shadow_blur(AMBIENT.shadow_blur * d);
            self.ctx.set_shadow_offset_y(8.0 * d);
            self.ctx.fill();
            self.ctx.restore();
        }
    }
}

// ---------- 工具 ----------

/// 锚点按当前排列顺序映射（球 slot 取 ANCHORS[slot]）
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

fn mix(hex: &str, to: (u8, u8, u8), amt: f64) -> String {
    let a = hex_to_rgb(hex);
    let c = (
        (a.0 as f64 + (to.0 as f64 - a.0 as f64) * amt) as u8,
        (a.1 as f64 + (to.1 as f64 - a.1 as f64) * amt) as u8,
        (a.2 as f64 + (to.2 as f64 - a.2 as f64) * amt) as u8,
    );
    format!("rgb({},{},{})", c.0, c.1, c.2)
}

fn lighten(hex: &str, amt: f64) -> String {
    mix(hex, (255, 255, 255), amt)
}

fn darken(hex: &str, amt: f64) -> String {
    mix(hex, (0, 0, 0), amt)
}
