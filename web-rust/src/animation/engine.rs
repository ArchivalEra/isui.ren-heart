// 引擎：渲染胶水层（Canvas/状态机驱动）
// 纯逻辑（规划/执行/几何）在 sim/ 模块 —— 原生 cargo test 可测
use crate::config::params::*;
use crate::config::templates::TEMPLATES;
use crate::sim::math::{screen_of, smoothstep, Vec2};
use crate::sim::planner::{Phase, Player};
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
            mode: RenderMode::Trail,
            history: [VecDeque::new(), VecDeque::new(), VecDeque::new()],
        }
    }

    pub fn set_anchor(&mut self, i: usize, v: Vec2) {
        if i < 3 {
            self.anchors[i] = v;
        }
    }

    pub fn anchor(&self, i: usize) -> Vec2 {
        self.anchors[i.min(2)]
    }

    /// 进入调试：三球归位到锚点（键盘移动选中球）
    pub fn enter_debug(&mut self) {
        self.phase = Phase::AtLogo { t: 0.0 };
        self.debug = true;
    }

    pub fn exit_debug(&mut self) {
        self.debug = false;
        if matches!(self.phase, Phase::AtLogo { .. }) {
            // 重新走入场仪式
            self.phase = Phase::AtLogo { t: 0.0 };
        }
    }

    pub fn frame(&mut self, dt: f64) {
        self.step(dt);
        self.render();
        for s in 0..3 {
            let pos = self.ball_world_pos(s);
            self.prev_pos[s] = pos;
            // 位置历史（实心拖尾；上限 8）
            let playing = matches!(
                self.phase,
                Phase::Free { .. } | Phase::Queueing { .. } | Phase::Formation { .. }
            );
            if playing {
                let h = &mut self.history[s];
                // 间距截断：与最新点距离过大（高速/交叉）→ 重建，防大长条/五角星复杂
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

    fn step(&mut self, dt: f64) {
        // 调试模式：锁定状态机（球停在锚点，键盘方向键可移动）
        if self.debug {
            if !matches!(self.phase, Phase::AtLogo { .. }) {
                self.phase = Phase::AtLogo { t: 0.0 };
            }
            return;
        }
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let mut next: Option<Phase> = None;
        match &mut self.phase {
            Phase::AtLogo { t } => {
                *t += dt;
                if *t >= AT_LOGO_MS {
                    // 入场：三球各自独立链，起点 = 锚点（无排队仪式、无闪电）
                    let players = [
                        Player::new(self.anchors[0], Self::random_dir()),
                        Player::new(self.anchors[1], Self::random_dir()),
                        Player::new(self.anchors[2], Self::random_dir()),
                    ];
                    next = Some(Phase::Free { players, check_t: 0.0 });
                }
            }
            Phase::Free { players, check_t } => {
                *check_t += dt;
                for p in players.iter_mut() {
                    p.tick(dt);
                }
                // 每 5 秒判定：30% 概率触发自然排队
                if *check_t >= FREE_CHECK_MS {
                    *check_t = 0.0;
                    if rng.gen::<f64>() < QUEUE_PROB {
                        // 固定粉蓝绿顺序：粉（球0）当队首，蓝、绿依次落后（站主钦定美的顺序）
                        let dir = Self::random_dir();
                        let anchor = players[0].ball_center(0);
                        let slots = Player::entry_points(anchor, dir);
                        let players_arr = [
                            players[0].clone_for_blend(),
                            players[1].clone_for_blend(),
                            players[2].clone_for_blend(),
                        ];
                        next = Some(Phase::Queueing { t: 0.0, players: players_arr, anchor, dir, slots });
                    }
                }
            }
            Phase::Queueing { t, players, anchor, dir, slots } => {
                *t += dt;
                // 过渡期间三球继续各自的自由运动
                for p in players.iter_mut() {
                    p.tick(dt);
                }
                if *t >= QUEUE_MS {
                    // 过渡完成 → 共享链排队跑（槽位 = 链上布局点，无跳变）
                    next = Some(Phase::Formation {
                        player: Player::new(*anchor, *dir),
                        hold_t: 0.0,
                        hold_ms: FORMATION_HOLD_MIN_MS
                            + rng.gen::<f64>() * (FORMATION_HOLD_MAX_MS - FORMATION_HOLD_MIN_MS),
                    });
                }
                let _ = slots;
            }
            Phase::Formation { player, hold_t, hold_ms } => {
                *hold_t += dt;
                // 法线偏移缓动
                for (i, b) in self.balls.iter_mut().enumerate() {
                    let tpl = &TEMPLATES[player.template_idx(i)];
                    b.offset += (tpl.offsets[i] - b.offset) * WANDER.offset_lerp;
                }
                player.tick(dt);
                if *hold_t >= *hold_ms {
                    // 自然解散：三球各自独立链（起点=当前位置，方向=链切线）
                    let players = [
                        {
                            let (pos, dir) = player.pos_and_dir(0);
                            Player::new(pos, dir)
                        },
                        {
                            let (pos, dir) = player.pos_and_dir(1);
                            Player::new(pos, dir)
                        },
                        {
                            let (pos, dir) = player.pos_and_dir(2);
                            Player::new(pos, dir)
                        },
                    ];
                    next = Some(Phase::Free { players, check_t: 0.0 });
                }
            }
        }
        if let Some(p) = next {
            self.phase = p;
        }
    }

    /// 随机单位方向
    fn random_dir() -> Vec2 {
        let angle = rand::random::<f64>() * std::f64::consts::PI * 2.0;
        Vec2 { x: angle.cos(), y: angle.sin() }
    }

    /// 调试：三球实际渲染坐标（含偏移）
    pub fn balls_world_pos(&self) -> [Vec2; 3] {
        [self.ball_world_pos(0), self.ball_world_pos(1), self.ball_world_pos(2)]
    }

    fn ball_world_pos(&self, color_slot: usize) -> Vec2 {
        match &self.phase {
            Phase::AtLogo { .. } => self.anchors[color_slot],
            Phase::Free { players, .. } => players[color_slot].world_pos(color_slot, self.balls[color_slot].offset),
            Phase::Queueing { t, players, slots, .. } => {
                let k = smoothstep(*t / QUEUE_MS);
                let free = players[color_slot].world_pos(color_slot, self.balls[color_slot].offset);
                crate::sim::math::lerp(free, slots[color_slot], k)
            }
            Phase::Formation { player, .. } => player.world_pos(color_slot, self.balls[color_slot].offset),
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
            if let Phase::Formation { player, .. } = &self.phase {
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
            Phase::Free { .. } => [0, 1, 2],
            Phase::Queueing { .. } => [0, 1, 2],
            Phase::Formation { player, .. } => player.order,
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
                    // 实心拖尾：向心 Catmull–Rom 过点样条（无折点光栅错误）
                    // 历史点全部穿过，曲线 C1 连续；宽度恒 2r（完整球宽）
                    let hist = &self.history[color_slot];
                    if hist.len() >= 2 {
                        let n = hist.len();
                        let color = self.balls[color_slot].color;
                        let mut pts: Vec<Vec2> = Vec::with_capacity(n);
                        for (hx, hy) in hist.iter() {
                            let (sx, sy, _) = screen_of(Vec2 { x: *hx, y: *hy }, w, h);
                            pts.push(Vec2 { x: sx, y: sy });
                        }
                        self.ctx.set_line_cap("round");
                        self.ctx.set_line_join("round");
                        self.ctx.set_stroke_style(&wasm_bindgen::JsValue::from(color));
                        self.ctx.set_line_width(radius * 2.0); // 完整球宽（直径）
                        self.ctx.begin_path();
                        if n == 2 {
                            self.ctx.move_to(pts[0].x, pts[0].y);
                            self.ctx.line_to(pts[1].x, pts[1].y);
                        } else {
                            // 相邻点对间细分 4 段（Catmull-Rom 需要前后邻居）
                            let sub = 4;
                            for k in 0..n - 1 {
                                let p0 = if k == 0 { pts[0] } else { pts[k - 1] };
                                let p1 = pts[k];
                                let p2 = pts[k + 1];
                                let p3 = if k + 2 < n { pts[k + 2] } else { pts[n - 1] };
                                for s in 0..sub {
                                    let t = s as f64 / sub as f64;
                                    let q = crate::sim::math::catmull_rom(p0, p1, p2, p3, t);
                                    if k == 0 && s == 0 {
                                        self.ctx.move_to(q.x, q.y);
                                    } else {
                                        self.ctx.line_to(q.x, q.y);
                                    }
                                }
                            }
                        }
                        self.ctx.stroke();
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

