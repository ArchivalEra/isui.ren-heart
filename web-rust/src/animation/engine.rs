// 动画引擎：主曲线 + 法线偏移 + 分块概率 + 排列弹性 + 自然俯视透视渲染
use crate::config::params::*;
use crate::config::templates::{random_template, CurveId, TEMPLATES};
use crate::animation::curves::{curve_of, normal_at, CurveFn, Vec2};
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

pub struct Ball {
    #[allow(dead_code)] // 配置契约：排列槽位，管理工具/调试用
    pub slot: usize,
    pub target_offset: f64,
    pub offset: f64,
    pub color: &'static str,
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
    /// 上一帧世界坐标（动态模糊速度向量用）
    prev_pos: [Vec2; 3],
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
        }
    }

    /// 每帧调用（由组件层 rAF 驱动）
    pub fn frame(&mut self) {
        self.step();
        self.render();
        // 记录本帧位置，供下帧动态模糊速度向量
        for s in 0..3 {
            self.prev_pos[s] = self.ball_world_pos(s);
        }
    }

    /// 每球速度向量（世界坐标，供动态模糊）
    fn ball_velocity(&self, slot: usize) -> Vec2 {
        let cur = self.ball_world_pos(slot);
        let prev = self.prev_pos[slot];
        Vec2 { x: cur.x - prev.x, y: cur.y - prev.y }
    }

    // ---------- 逻辑 ----------

    fn step(&mut self) {
        self.t += SPEED.tps;

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

    fn on_region_enter(&mut self) {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        if rng.gen::<f64>() < PROB.switch_template {
            let (idx, template) = random_template(self.template_curve_id());
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

    fn template_curve_id(&self) -> CurveId {
        TEMPLATES[self.template_idx].curve
    }

    fn ball_world_pos(&self, slot: usize) -> Vec2 {
        let yo = (self.t * SPEED.yo_yo_freq).sin() * SPEED.yo_yo_amp;
        let phase = self.t + slot as f64 * (SPEED.phase_gap + yo);
        let p = (self.curve)(phase);
        let n = normal_at(self.curve, phase);
        let ball = &self.balls[slot];
        let off = ball.offset * SPEED.offset_range;
        Vec2 { x: p.x + n.x * off, y: p.y + n.y * off }
    }

    // ---------- 渲染（自然俯视透视 + 质量分级 + 动态模糊） ----------
    // CanvasGradient 无 *_str 版 API，旧 set_*_style 已弃用但为唯一途径
    #[allow(deprecated)]
    fn render(&mut self) {
        let w = self.canvas.client_width() as f64;
        let h = self.canvas.client_height() as f64;
        if w == 0.0 || h == 0.0 {
            return;
        }
        // 质量分级（240p→8K）：Low 无尾迹/浅阴影，Ultra 全效果
        let (shadow_alpha, blur_mul, use_trail) = match quality_of(w, h) {
            Quality::Low => (0.03, 0.4, false),
            Quality::Medium => (0.05, 0.7, false),
            Quality::High => (0.07, 1.0, true),
            Quality::Ultra => (0.09, 1.2, true),
        };
        self.ctx.clear_rect(0.0, 0.0, w, h);

        // 透视投影
        let to_screen = |p: Vec2| -> (f64, f64, f64) {
            let d = depth_scale(p.y);
            ((p.x - 0.5) * w * d + w / 2.0, p.y * h, d)
        };
        let pts: Vec<(f64, f64, f64)> = (0..3).map(|s| to_screen(self.ball_world_pos(self.order[s]))).collect();

        // 地面连接线
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

        // 按深度排序（远的先画）
        let mut order: Vec<usize> = (0..3).collect();
        order.sort_by(|a, b| pts[*a].1.partial_cmp(&pts[*b].1).unwrap());

        for i in order {
            let slot = self.order[i];
            let (px, py, d) = pts[i];
            let radius = BALL_RADIUS * d * (w.min(h) / 700.0).clamp(0.6, 1.0);

            // 动态模糊：沿速度方向的渐变尾迹（High/Ultra 级）
            if use_trail {
                let v = self.ball_velocity(slot);
                let vx = v.x * w;
                let vy = v.y * h;
                let speed = (vx * vx + vy * vy).sqrt();
                if speed > 1.0 {
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
            }

            // 地面阴影（随深度缩放；低质量级更浅更糊）
            self.ctx.save();
            self.ctx.begin_path();
            self.ctx.ellipse(px, py + radius * 0.85, radius * 1.15, radius * 0.32, 0.0, 0.0, std::f64::consts::PI * 2.0).unwrap();
            self.ctx.set_fill_style_str(&format!("rgba(17,17,17,{})", shadow_alpha * d + 0.02));
            self.ctx.set_filter(&format!("blur({}px)", (2.0 + (1.0 - d) * 3.0) * blur_mul));
            self.ctx.fill();
            self.ctx.restore();

            // 3D 球体：径向渐变
            self.ctx.save();
            let grad = self.ctx.create_radial_gradient(
                px - radius * 0.35,
                py - radius * 0.35,
                radius * 0.1,
                px,
                py,
                radius * 1.1,
            ).unwrap();
            grad.add_color_stop(0.0, &lighten(self.balls[slot].color, 0.55)).unwrap();
            grad.add_color_stop(0.45, self.balls[slot].color).unwrap();
            grad.add_color_stop(1.0, &darken(self.balls[slot].color, 0.35)).unwrap();
            self.ctx.begin_path();
            self.ctx.arc(px, py, radius, 0.0, std::f64::consts::PI * 2.0).unwrap();
            self.ctx.set_fill_style(&grad.into());
            self.ctx.set_shadow_color(AMBIENT.shadow_color);
            self.ctx.set_shadow_blur(AMBIENT.shadow_blur * d * blur_mul);
            self.ctx.set_shadow_offset_y(8.0 * d);
            self.ctx.fill();
            self.ctx.restore();
        }
    }
}

// ---------- 颜色工具 ----------

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
