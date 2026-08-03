// 引擎：渲染胶水层（Canvas/状态机驱动）——Orchestrator 角色（架构审查候选 B）
// 纯逻辑（规划/执行/几何）在 sim/ 模块；拖尾渲染在 animation/trail.rs
// 运动风格参数全部来自 config/profile.rs 的 MotionProfile（候选 A）
use crate::animation::trail::{sample_history, TrailRenderer};
use crate::config::params::*;
use crate::config::profile::{NATIVE_PROFILE as P, TrailStyle};
use crate::sim::math::{screen_of, Vec2};
use crate::sim::state::State;
use std::collections::VecDeque;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

pub struct Ball {
    pub offset: f64,
    pub color: &'static str,
}

pub struct BallsEngine {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    balls: [Ball; 3],
    prev_pos: [Vec2; 3],
    state: State,
    /// 当前拖尾风格（来自 profile；模式按钮切换 Solid/Mini）
    pub trail_style: TrailStyle,
    /// 每球位置历史（拖尾点，世界坐标）
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
            state: State::new(anchors),
            trail_style: P.trail,
            history: [VecDeque::new(), VecDeque::new(), VecDeque::new()],
        }
    }

    /// 切换拖尾风格（小拖尾/大拖尾，分别绑定 profile 的 trail_style）
    pub fn toggle_trail_style(&mut self) {
        self.trail_style = match self.trail_style {
            TrailStyle::Solid { frames: _ } => TrailStyle::Mini { frames: 6 },
            TrailStyle::Mini { .. } => P.trail,
        };
    }

    pub fn frame(&mut self, dt: f64) {
        // 法线偏移缓动（共享链阶段按链头模板 offsets 收敛）
        if let Some(offsets) = self.state.template_offsets() {
            for (i, b) in self.balls.iter_mut().enumerate() {
                b.offset += (offsets[i] - b.offset) * WANDER.offset_lerp;
            }
        }
        self.state.step(dt, &mut || rand::random::<f64>());
        self.render();
        // 拖尾历史采样（先算速度再更新 prev_pos——
        // 曾先更新后计算 → 差分恒 0 → 拖尾永远消失，真凶）
        let (frames, max_seg) = match self.trail_style {
            TrailStyle::Solid { frames } => (frames, TRAIL_MAX_SEG),
            TrailStyle::Mini { frames } => (frames, TRAIL_MAX_SEG),
        };
        for s in 0..3 {
            let pos = self.ball_world_pos(s);
            let v = self.ball_velocity(s);
            self.prev_pos[s] = pos;
            let dt_s = (dt / 1000.0).max(1e-9);
            let speed = (v.x * v.x + v.y * v.y).sqrt() / dt_s;
            sample_history(
                &mut self.history[s],
                pos,
                speed,
                dt,
                self.state.is_playing(),
                max_seg,
                frames,
            );
        }
    }

    fn ball_velocity(&self, slot: usize) -> Vec2 {
        let cur = self.ball_world_pos(slot);
        let prev = self.prev_pos[slot];
        Vec2 { x: cur.x - prev.x, y: cur.y - prev.y }
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
            // 拖尾：TrailRenderer（风格由 trail_style 决定）
            let hist = &self.history[color_slot];
            if !hist.is_empty() {
                let color = self.balls[color_slot].color;
                let pts = TrailRenderer::build_points(Vec2 { x: px, y: py }, hist, w, h);
                TrailRenderer::draw(&self.ctx, &pts, radius, color, self.trail_style);
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
