// 规划器 + 执行器（纯 Rust，可单测）
// 弧长共享链模型：三球成群结对沿同一链跑，弧长错开（一个接一个）
// - 链 = 连续路径段队列（段间 from=上段 target，切线继承）
// - 队首弧长 s_lead 推进；球 i 弧长 = s_lead - i×GAP（沿链错开）
// - 球 i 未上链（s<0）时停在起点（= Travel 到达点，链起点后方）→ 自然滑上链，无排队仪式
// - PD spring 追踪链上目标（丝滑：位置+速度双目标）
use crate::config::params::*;
use crate::config::templates::TEMPLATES;

/// 曲线生成 profile：以后新增曲线策略就加一个变体（如 EulerBlend 已备）
/// 自研 = 单段贝塞尔（默认）；EulerBlend = 段内曲率渐变（make_blend_leg）
#[derive(Clone, Copy, PartialEq)]
pub enum CurveProfile {
    #[allow(dead_code)] // Native 随时可切回（自研单段贝塞尔）
    Native,
    EulerBlend,
}
use crate::sim::math::*;
use std::collections::VecDeque;

/// 活动圈边界（大事情定稿）：以 tayori 标志为中心的最大内切圆——
/// 圆心 = logo 实时采样位置，半径 = 圆心到四边（横/竖）最窄距离。
/// 三球所有轨迹点都必须在这个圆内。
#[derive(Clone, Copy, Debug)]
pub struct CircleBounds {
    pub cx: f64,
    pub cy: f64,
    pub r: f64,
}

impl CircleBounds {
    /// 无 logo 时的兜底（屏幕中央偏上）
    pub fn fallback() -> Self {
        CircleBounds { cx: 0.5, cy: 0.42, r: 0.35 }
    }

    /// 点是否在圆内（含小余量——球半径视觉缓冲）
    pub fn contains(&self, p: Vec2) -> bool {
        let dx = p.x - self.cx;
        let dy = p.y - self.cy;
        (dx * dx + dy * dy).sqrt() <= self.r * 0.92
    }

    /// 圆内随机点（极坐标均匀分布，半径 ≤ 0.75r 留转弯余地）
    pub fn random_point(&self, rng: &mut rand::rngs::ThreadRng) -> Vec2 {
        use rand::Rng;
        let ang = rng.gen::<f64>() * std::f64::consts::PI * 2.0;
        let rr = rng.gen::<f64>().sqrt() * self.r * 0.75;
        Vec2 {
            x: self.cx + ang.cos() * rr,
            y: self.cy + ang.sin() * rr,
        }
    }

    /// 朝圆心收缩（clamp 用）
    pub fn toward_center(&self, from: Vec2, target: Vec2, k: f64) -> Vec2 {
        Vec2 {
            x: from.x + (target.x - from.x) * k,
            y: from.y + (target.y - from.y) * k,
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Leg {
    pub from: Vec2,
    pub ctrl: Vec2,
    pub target: Vec2,
}

#[derive(Clone)]
pub struct PlannedLeg {
    /// 5 子段（Euler spiral 离散近似：子段间曲率线性插值，段内模板渐变 A→B→C）
    pub legs: [Leg; 5],
    pub template_idx: usize,
    /// 段级速度倍率（独立于曲线，来自 SPEED_BANDS）
    pub speed: f64,
    /// 有效曲率（小圈滤波后）：供未来 profile（如曲率感知速度）使用
    #[allow(dead_code)]
    pub curv_eff: f64,
    pub dur_ms: f64,
    /// 折线弧长（from→ctrl→target）
    pub arc: f64,
}

/// 每球物理状态（PD spring 追踪）
#[derive(Clone, Copy)]
struct BallState {
    pos: Vec2,
    vel: Vec2,
    /// 沿链速率（平滑中，向段理想速率收敛）
    rate: f64,
}

/// 执行器：弧长共享链 + 三球 spring 物理
#[derive(Clone)]
pub struct Player {
    chain: VecDeque<PlannedLeg>,
    /// 队首（球0）弧长
    s_lead: f64,
    states: [BallState; 3],
    /// 每球沿链错开弧长（0, GAP, 2×GAP）
    gaps: [f64; 3],
    /// 云中心跟随目标的 EMA 状态（时序滤波，套在云中心输出后面）
    ema_targets: [Vec2; 3],
    /// 活动圈边界（tayori 标志中心圆——实时采样更新）
    bounds: CircleBounds,
    /// 跟随风格（来自 ACTIVE_PROFILE：Chain 自研 / CloudEma 云中心）
    follow: crate::config::profile::FollowStyle,
    /// 云中心偏移幅度（FORMATION_OFFSETS[s] × offset_scale）
    offset_scale: f64,
    /// EMA 系数（1.0 = 无滤波）
    ema_alpha: f64,
    /// 调速器开关
    tune_speeds: bool,
    pub order: [usize; 3],
}

impl Player {
    /// 更新活动圈（engine 实时采样 logo 后调用）
    pub fn set_bounds(&mut self, b: CircleBounds) {
        self.bounds = b;
    }
}

impl Player {
    /// 上链点：球 i 到达点 = 链起点后方 i×GAP 弧长（沿 -dir）
    /// 到达即 Play：队首在链起点，其余在后方错开，s_lead 前进自然滑上链
    pub fn entry_points(anchor: Vec2, dir: Vec2) -> [Vec2; 3] {
        let mut pts = [anchor; 3];
        for i in 1..3 {
            pts[i] = Vec2 {
                x: (anchor.x - dir.x * i as f64 * CHAIN_GAP).clamp(0.10, 0.90),
                y: (anchor.y - dir.y * i as f64 * CHAIN_GAP).clamp(0.10, 0.90),
            };
        }
        pts
    }

    pub fn new(anchor: Vec2, dir: Vec2) -> Self {
        let spots = Self::entry_points(anchor, dir);
        // 首段：链起点 = 球0（anchor），方向 = 入口 dir（与 entry_points 槽位方向一致，
        // 保证等待上链的球在解散/转移时位置连续——曾因随机 target 方向导致蓝绿闪现）
        let target = {
            let r = 0.3 + rand::random::<f64>() * 0.3;
            Vec2 {
                x: (anchor.x + dir.x * r).clamp(0.12, 0.88),
                y: (anchor.y + dir.y * r).clamp(0.12, 0.88),
            }
        };
        let speed = roll_speed();
        let fb = CircleBounds::fallback();
        let mut pl = make_planned_leg(anchor, dir, 0, target, speed);
        if !leg_in_bounds(&pl, &fb) {
            let safe = clamp_target_in_bounds(anchor, dir, 0, target, speed, &fb);
            pl = make_planned_leg(anchor, dir, 0, safe, speed);
        }
        let mut chain = VecDeque::new();
        chain.push_back(pl);

        let states = [
            BallState { pos: spots[0], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED },
            BallState { pos: spots[1], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED },
            BallState { pos: spots[2], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED },
        ];

        let pr = crate::config::profile::ACTIVE_PROFILE;
        let mut p = Player {
            chain,
            s_lead: 0.0,
            states,
            gaps: [0.0, CHAIN_GAP, 2.0 * CHAIN_GAP],
            ema_targets: spots,
            bounds: CircleBounds::fallback(),
            follow: pr.follow,
            offset_scale: pr.offset_scale,
            ema_alpha: pr.ema_alpha,
            tune_speeds: pr.tune_speeds,
            order: ORDERS[0],
        };
        p.ensure_chain();
        p
    }

    pub fn tick(&mut self, dt: f64) {
        let dt_s = dt / 1000.0;
        // 队首弧长推进：速度 profile（段内温和加速/减速，段间连续——预渲染衔接）
        let (_, _, seg0, u0) = chain_pos_and_tangent(&self.chain, self.s_lead);
        self.s_lead += self.profile_speed(seg0, u0) * dt_s;
        self.ensure_chain();

        let k = SPRING.stiffness;
        let c_damp = SPRING.damping * 2.0 * k.sqrt();
        // 低通：球速紧贴链速（阻尼项全功率制动，见下方力模型）——
        // 低通过大 → 链速已降球速仍高 → 冲过头被 spring 拉回 = 冲刺回弹
        let rate_lerp = (dt_s / 0.12).min(1.0);

        for s in 0..3 {
            // 球 i 弧长 = 队首 - 错开；未上链（<0）→ 目标 = 起点（链起点后方）
            let s_i = self.s_lead - self.gaps[s];
            let (target, seg_i, u_i) = if s_i >= 0.0 {
                match self.follow {
                    crate::config::profile::FollowStyle::Chain => {
                        // 自研：直接追链上弧长点（spring 物理）
                        let (p, _, seg, u) = chain_pos_and_tangent(&self.chain, s_i);
                        (p, seg, u)
                    }
                    crate::config::profile::FollowStyle::CloudEma => {
                        // 云中心：Frenet 法线偏移 + EMA 时序滤波——
                        // 转弯三球走同一条曲线的偏移轨迹 → 同弧、无多段线
                        let d = FORMATION_OFFSETS[s] * self.offset_scale;
                        let (raw, _) = crate::sim::cloud::follower_target(&self.chain, s_i, d);
                        let (_, _, seg, u) = chain_pos_and_tangent(&self.chain, s_i);
                        let ema =
                            crate::sim::cloud::ema_step(self.ema_targets[s], raw, self.ema_alpha);
                        self.ema_targets[s] = ema;
                        (ema, seg, u)
                    }
                }
            } else {
                let leg0 = &self.chain.front().unwrap().legs[0];
                let d = dir_of(leg0.from, leg0.target);
                let pos = Vec2 {
                    x: (leg0.from.x - d.x * self.gaps[s]).clamp(0.05, 0.95),
                    y: (leg0.from.y - d.y * self.gaps[s]).clamp(0.05, 0.95),
                };
                match self.follow {
                    crate::config::profile::FollowStyle::Chain => (pos, 0usize, 0.0),
                    crate::config::profile::FollowStyle::CloudEma => {
                        let ema = crate::sim::cloud::ema_step(self.ema_targets[s], pos, self.ema_alpha);
                        self.ema_targets[s] = ema;
                        (ema, 0usize, 0.0)
                    }
                }
            };

            let r_ideal = self.profile_speed(seg_i, u_i);
            let stv = self.states[s];
            let rate_now = stv.rate;
            // 智能匀速：队列速度统一 = 队首速度——跟随者不再有自己的速度
            // profile 波动（慢速段走走停停 = 蓝绿按自己链上位置的段级速度
            // 忽快忽慢；统一后像火车——相对位置恒定、无走走停停）
            let (_, _, seg_lead, u_lead) =
                chain_pos_and_tangent(&self.chain, self.s_lead);
            let lead_speed = self.profile_speed(seg_lead, u_lead) * WORLD_SPEED;
            // 前瞻：tvel 方向用「未来弧长处」切线——链要转向时球提前反应；
            // 速度大小统一 lead_speed（温和加减速由队首 profile 的 smoothstep 保证）
            let lookahead_arc = rate_now * WORLD_SPEED * LOOKAHEAD_SECONDS;
            let (_, tan_f, _, _) =
                chain_pos_and_tangent(&self.chain, (s_i + lookahead_arc).max(0.0));
            let tl_f = (tan_f.x * tan_f.x + tan_f.y * tan_f.y).sqrt().max(1e-9);
            let tvel = Vec2 {
                x: tan_f.x / tl_f * lead_speed,
                y: tan_f.y / tl_f * lead_speed,
            };
            // 方向低通：tvel 方向每秒最多转 MAX_TURN_RATE——防链几何切线
            // 退化/跳变导致的瞬间掉头（球沿旧方向平滑弧线转向新方向）
            let tv_mag = (tvel.x * tvel.x + tvel.y * tvel.y).sqrt();
            let v_mag = (stv.vel.x * stv.vel.x + stv.vel.y * stv.vel.y).sqrt();
            let tvel = if tv_mag > 1e-6 && v_mag > 1e-6 {
                let cross = stv.vel.x * tvel.y - stv.vel.y * tvel.x;
                let dot = (stv.vel.x * tvel.x + stv.vel.y * tvel.y) / (v_mag * tv_mag);
                let ang = dot.clamp(-1.0, 1.0).acos();
                let max_turn = MAX_TURN_RATE * dt_s;
                if ang > max_turn {
                    // 把 tvel 方向旋转到「当前速度方向 + max_turn」（沿最小旋转侧）
                    let dir = if cross >= 0.0 { 1.0 } else { -1.0 };
                    let s = dir * max_turn.sin();
                    let c = max_turn.cos();
                    let ux = stv.vel.x / v_mag;
                    let uy = stv.vel.y / v_mag;
                    Vec2 {
                        x: (ux * c - uy * s) * tv_mag,
                        y: (ux * s + uy * c) * tv_mag,
                    }
                } else {
                    tvel
                }
            } else {
                tvel
            };
            let st = &mut self.states[s];
            st.rate += (r_ideal - st.rate) * rate_lerp;
            // 力模型：位置项（弹簧）+ 阻尼项（速度追踪）分离钳制
            // —— 位置项按法向/切向分解：法向（纠偏离链）全强度，
            //    切向（纠弧长错位 = 冲刺回弹感之源）只留 TANGENTIAL_GAIN 柔和纠偏；
            //    阻尼项全功率（高速→低速制动不足 = 惯性超前 = 回弹）
            let rel = Vec2 { x: target.x - st.pos.x, y: target.y - st.pos.y };
            let tl_n = (tan_f.x * tan_f.x + tan_f.y * tan_f.y).sqrt().max(1e-9);
            let un = Vec2 { x: tan_f.x / tl_n, y: tan_f.y / tl_n };
            let along = rel.x * un.x + rel.y * un.y;
            let perp_x = rel.x - un.x * along;
            let perp_y = rel.y - un.y * along;
            let px = (perp_x + un.x * along * TANGENTIAL_GAIN) * k;
            let py = (perp_y + un.y * along * TANGENTIAL_GAIN) * k;
            let p_mag = (px * px + py * py).sqrt();
            let (px, py) = if p_mag > MAX_ACCEL {
                (px / p_mag * MAX_ACCEL, py / p_mag * MAX_ACCEL)
            } else {
                (px, py)
            };
            // 巡航贴链：偏差小（<0.035）时位置直接参数化贴链上点
            // （速度 = 切线×链速）——spring 追弧必切弯（弦<弧 → 球超前被拉回 = 回弹），
            // 参数化跟随物理上零偏差；spring 只用于过渡（入场/汇入/偏差大）
            // 上链即贴链：位置直接 = EMA 平滑后的链上点（云中心时序滤波——
            // 链上点段边界跳变被 EMA 消化，无需 lerp 追赶；直接贴 = 零抖动
            // 零回弹），速度 = 切线×链速（与链完全同步）。spring 只用于
            // 未上链（入场滑向等待点）。
            if s_i >= 0.0 {
                st.pos = target;
                st.vel = tvel;
            } else {
                let ax = px + c_damp * (tvel.x - st.vel.x);
                let ay = py + c_damp * (tvel.y - st.vel.y);
                st.vel.x += ax * dt_s;
                st.vel.y += ay * dt_s;
                st.pos.x = (st.pos.x + st.vel.x * dt_s).clamp(0.03, 0.97);
                st.pos.y = (st.pos.y + st.vel.y * dt_s).clamp(0.03, 0.97);
            }
        }
    }

    /// 速度 profile：段内从「本段全速」温和过渡到「下段全速」，
    /// smoothstep 保证段内加速/减速平滑；段间速率连续（段尾速 = 下段头速）
    /// 巡航 = 模板全速（不再减半，去蠕动感）
    fn profile_speed(&self, seg_idx: usize, u: f64) -> f64 {
        let seg = &self.chain[seg_idx];
        let v_i = seg.speed;
        let v_next = match self.chain.get(seg_idx + 1) {
            Some(next) => next.speed,
            None => v_i,
        };
        let ramp = smoothstep(u.clamp(0.0, 1.0));
        // 温和变速 = 段内 smoothstep 过渡 + 段间速率连续（回滚曲率感知因子——
        // 段级因子跳变导致球速段间突变，跳跳球抖动）
        WORLD_SPEED * (v_i + (v_next - v_i) * ramp)
    }

    /// 链增长：总弧长保持 ≥ s_lead + 余量（无限轨迹）
    fn ensure_chain(&mut self) {
        self.ensure_chain_to(CHAIN_GAP * 3.0 + 0.5);
    }

    /// 批量补链到「队首前方 ahead 弧长」。入场预生成风暴用：一次性补几分钟的链，
    /// 运行期 ensure_chain 静默（零规划抖动，帧率确定）
    /// 区域规划：每隔 LOGO_EVERY_ARC 弧长插一个「logo 游走段」（三球回 logo 附近）
    pub fn ensure_chain_to(&mut self, ahead: f64) {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let mut next_logo_arc = self.chain.iter().map(|x| x.arc).sum::<f64>() + LOGO_EVERY_ARC;
        let need = self.s_lead + ahead;
        while self.chain.iter().map(|x| x.arc).sum::<f64>() < need {
            let tail = self.chain.back().expect("chain non-empty");
            let tail_last = tail.legs[4];
            let from = tail_last.target;
            let dir = if tail_last.from == tail_last.target {
                Vec2 { x: 1.0, y: 0.0 }
            } else {
                let tan = bezier_tangent(tail_last.from, tail_last.ctrl, tail_last.target, 1.0);
                let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
                Vec2 { x: tan.x / l, y: tan.y / l }
            };
            let roll = rng.gen::<f64>();
            // 段级运动参数：速度档（含高速批准制）
            let speed = roll_speed();
            if rng.gen::<f64>() < PROB.switch_order {
                let next = ORDERS[rng.gen_range(0..ORDERS.len())];
                if next != self.order {
                    self.order = next;
                }
            }
            // 目标生成（大事情定稿）：全部在活动圈内随机——
            // 普通段 = 圆内随机点（极坐标均匀，0.75r 留转弯余地）；
            // logo 游走段 = 圆心附近小范围（LOGO_RADIUS×0.4，三球回标志旁）
            let chain_arc_now = self.chain.iter().map(|x| x.arc).sum::<f64>();
            let b = self.bounds;
            // 到活动圆边界的距离（沿当前方向）——边界检测：贴边时强制大曲率弯回
            let to_edge = {
                let ocx = b.cx - from.x;
                let ocy = b.cy - from.y;
                let proj = ocx * dir.x + ocy * dir.y;
                let disc = proj * proj - (ocx * ocx + ocy * ocy - b.r * b.r);
                if disc > 0.0 {
                    (proj + disc.sqrt()).max(0.0)
                } else {
                    f64::MAX
                }
            };
            let near_edge = to_edge < 0.15;
            // 曲线选择：曲率连续性（形状只管几何）；贴边时强制大曲率模板快速弯回
            let old_curv = TEMPLATES[tail.template_idx].curvature;
            let template_idx = if near_edge {
                // 边界弯回：中等曲率（0.25-0.7）——大曲率 ctrl 偏移 > 段长时
                // 段尾切线反转（180° 跳变 = 回弹之源）
                let mut idx = tail.template_idx;
                for _ in 0..8 {
                    let cand = rng.gen_range(0..TEMPLATES.len());
                    let cc = TEMPLATES[cand].curvature.abs();
                    if (0.25..=0.7).contains(&cc) {
                        idx = cand;
                        break;
                    }
                }
                idx
            } else if roll < PROB.switch_template {
                let mut idx = tail.template_idx;
                for _ in 0..6 {
                    let cand = rng.gen_range(0..TEMPLATES.len());
                    if (TEMPLATES[cand].curvature - old_curv).abs() <= TEMPLATE_CURV_STEP {
                        idx = cand;
                        break;
                    }
                }
                idx
            } else {
                tail.template_idx
            };
            let dist = 0.3 + rng.gen::<f64>() * 0.3;
            let target = if chain_arc_now >= next_logo_arc {
                // logo 游走段：方向 = 当前方向与 logo 圆心方向的混合（渐进转向，
                // 多段累积到达 logo——不一步 180° 掉头 = U 形段 = 回弹之源）
                next_logo_arc += LOGO_EVERY_ARC;
                let to_c = Vec2 { x: b.cx - from.x, y: b.cy - from.y };
                let d = (to_c.x * to_c.x + to_c.y * to_c.y).sqrt().max(1e-9);
                let mx = (dir.x * 0.6 + to_c.x / d * 0.4)
                    .hypot(dir.y * 0.6 + to_c.y / d * 0.4)
                    .max(1e-9);
                let mix = Vec2 {
                    x: (dir.x * 0.6 + to_c.x / d * 0.4) / mx,
                    y: (dir.y * 0.6 + to_c.y / d * 0.4) / mx,
                };
                let ang = rng.gen::<f64>() * std::f64::consts::PI * 2.0;
                let rr = rng.gen::<f64>().sqrt() * b.r * LOGO_RADIUS;
                let logo_p = Vec2 {
                    x: b.cx + ang.cos() * rr,
                    y: b.cy + ang.sin() * rr,
                };
                // 目标 = mix 方向、logo 圆半径处（渐进接近 logo）
                let dist_eff = dist.min((logo_p.x - from.x).hypot(logo_p.y - from.y)).max(0.2);
                let tg = Vec2 {
                    x: from.x + mix.x * dist_eff,
                    y: from.y + mix.y * dist_eff,
                };
                // clamp 屏内（logo 段 mix 方向可能朝外——曾推出屏幕）
                Vec2 { x: tg.x.clamp(0.05, 0.95), y: tg.y.clamp(0.05, 0.95) }
            } else {
                // 段长自适应：dist 取「随机段长」与「圆内可用空间」的较小者——
                // 贴边时自然缩短，永不越界（越界跳点 = 方向突变 = 回弹之源）
                let tg = if near_edge {
                    // 边界弯回：方向 = 当前方向与圆心方向的混合——权重按越界深度
                    // 自适应（圆内渐进 ~19°/段；越往外 to_c 权重越大，圆外纯朝圆心——
                    // 否则链在圆外恶性循环，出屏）
                    let to_c = Vec2 { x: b.cx - from.x, y: b.cy - from.y };
                    let d = (to_c.x * to_c.x + to_c.y * to_c.y).sqrt().max(1e-9);
                    let w = ((d - b.r * 0.8) / (b.r * 0.2).max(1e-9)).clamp(0.0, 1.0);
                    let fwd = 0.65 * (1.0 - w);
                    let tow = 0.35 + 0.65 * w;
                    let mx = (dir.x * fwd + to_c.x / d * tow)
                        .hypot(dir.y * fwd + to_c.y / d * tow)
                        .max(1e-9);
                    let mix = Vec2 {
                        x: (dir.x * fwd + to_c.x / d * tow) / mx,
                        y: (dir.y * fwd + to_c.y / d * tow) / mx,
                    };
                    let dist_eff = dist.min(to_edge * 0.7).max(0.12);
                    Vec2 {
                        x: from.x + mix.x * dist_eff,
                        y: from.y + mix.y * dist_eff,
                    }
                } else {
                    // 段长自适应：dist 取「随机段长」与「圆内可用空间」的较小者
                    let dist_eff = dist.min(to_edge * 0.8).max(0.05);
                    Vec2 {
                        x: from.x + dir.x * dist_eff,
                        y: from.y + dir.y * dist_eff,
                    }
                };
                // 兜底（防御）：仍越界则沿 dir 截断到圆边界（方向连续）
                let tg = if b.contains(tg) {
                    tg
                } else {
                    let ray = to_edge.min(0.3).max(0.05);
                    Vec2 {
                        x: from.x + dir.x * ray,
                        y: from.y + dir.y * ray,
                    }
                };
                // 终极防御：目标 clamp 屏内（球永远不出屏幕）
                Vec2 { x: tg.x.clamp(0.05, 0.95), y: tg.y.clamp(0.05, 0.95) }
            };
            // 曲线 profile：Native=自研单段；EulerBlend=段内曲率渐变（默认关闭）
            let mut pl = if CURVE_PROFILE == CurveProfile::EulerBlend && rng.gen::<f64>() < BLEND_PROB {
                // 上一段实际段尾曲率（EulerBlend 段尾曲率 = curv_eff——严格连续）
                let old_curv2 = tail.curv_eff;
                let d = (target.x - from.x).hypot(target.y - from.y).max(1e-6);
                let ang_from = dir.y.atan2(dir.x);
                let ang_to = (target.y - from.y).atan2(target.x - from.x);
                let mut theta = ang_to - ang_from;
                while theta > std::f64::consts::PI {
                    theta -= std::f64::consts::PI * 2.0;
                }
                while theta < -std::f64::consts::PI {
                    theta += std::f64::consts::PI * 2.0;
                }
                // curv_b 带符号选择：优先弯向 target（θ 符号匹配）——C 反推压力小、
                // leg_in_bounds 失败率低（补段不收缩——性能）
                let sign = if theta >= 0.0 { 1.0 } else { -1.0 };
                let mut curv_b = old_curv2;
                for _ in 0..6 {
                    let c = rng.gen_range(0..TEMPLATES.len());
                    let cc = TEMPLATES[c].curvature;
                    if (cc - old_curv2).abs() <= TEMPLATE_CURV_STEP && cc.signum() == sign {
                        curv_b = cc;
                        break;
                    }
                }
                // 拟合助手：C 由 target 方向反推——贝塞尔子段转角 ≈ 1.4·curv
                // （与段长无关）——5 子段 Σ ≈ 1.4×(1.2A+2.4B+1.2C)：
                let curv_c =
                    ((theta / 1.4 - 1.2 * old_curv2 - 2.4 * curv_b) / 1.2).clamp(-1.1, 1.1);
                make_blend_leg(
                    from, dir, [old_curv2, curv_b, curv_c], target, d,
                    template_idx, speed,
                )
            } else {
                make_planned_leg(from, dir, template_idx, target, speed)
            };
            if !leg_in_bounds(&pl, &self.bounds) {
                let safe = clamp_target_in_bounds(from, dir, template_idx, target, speed, &self.bounds);
                pl = if rng.gen::<f64>() < BLEND_PROB {
                    let d = (safe.x - from.x).hypot(safe.y - from.y).max(1e-6);
                    make_blend_leg(from, dir, [0.0, 0.0, 0.0], safe, d, template_idx, speed)
                } else {
                    make_planned_leg(from, dir, template_idx, safe, speed)
                };
            }
            if pl.arc < 0.05 {
                // 死循环防护：零长度段（收缩失败）强制拉一段——朝屏中心方向，必在屏内
                let dx = 0.5 - from.x;
                let dy = 0.5 - from.y;
                let dl = (dx * dx + dy * dy).sqrt().max(1e-9);
                let forced = Vec2 {
                    x: from.x + dx / dl * 0.3,
                    y: from.y + dy / dl * 0.3,
                };
                pl = make_planned_leg(from, dir, template_idx, forced, speed);
                self.chain.push_back(clamp_dur_to_chain(pl, tail.dur_ms));
                break; // 本帧补段到此为止（保底段保证链增长）
            }
            self.chain.push_back(clamp_dur_to_chain(pl, tail.dur_ms));
        }
        // 调速师傅：补链后审核尾部段的速度序列（savgol 平滑 + 加速度钳制）
        if self.tune_speeds {
            self.tune_tail(9);
        }
    }

    /// 调速器：对链尾部 n 段做速度审核——消除速度钝点（非常大加速/减速）
    /// savgol5 平滑 + 相邻段加速度钳制 → 重写 speed/dur_ms
    fn tune_tail(&mut self, n: usize) {
        let len = self.chain.len();
        let start = len.saturating_sub(n);
        if len - start < 3 {
            return;
        }
        let tail: Vec<PlannedLeg> = self.chain.iter().skip(start).cloned().collect();
        let (speeds, durs) = crate::sim::velo::tune(&tail, WORLD_SPEED, true);
        for (i, pl) in self.chain.iter_mut().skip(start).enumerate() {
            pl.speed = speeds[i];
            pl.dur_ms = durs[i];
        }
    }

    /// 链上弧长 s 处：位置 + 切线 + 段索引 + 段内 u（速度 profile 用）
    /// 链 = 段 × 5 子段：定位时先找段，再在段内 5 子段中定位


    /// 球位：spring 物理状态（云中心 Frenet 偏移已在 tick 目标中完成）
    pub fn world_pos(&self, color_slot: usize, _offset: f64) -> Vec2 {
        let st = &self.states[color_slot];
        st.pos
    }

    /// 球 i 所在链位置的切线（归一化）——回家拟合助手：
    /// 回家弧线起点方向 = 巡航切线，C1 连续平滑接出
    pub fn lead_tangent(&self, color_slot: usize) -> Vec2 {
        let s_i = self.s_lead - self.gaps[color_slot];
        if s_i >= 0.0 {
            let (_, tan, _, _) = chain_pos_and_tangent(&self.chain, s_i);
            let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            Vec2 { x: tan.x / l, y: tan.y / l }
        } else {
            // 未上链（等待期）：朝链起点方向
            let leg0 = &self.chain.front().unwrap().legs[0];
            let d = Vec2 {
                x: leg0.target.x - leg0.from.x,
                y: leg0.target.y - leg0.from.y,
            };
            let l = (d.x * d.x + d.y * d.y).sqrt().max(1e-9);
            Vec2 { x: d.x / l, y: d.y / l }
        }
    }

    #[allow(dead_code)] // 测试用
    pub fn chain_len(&self) -> usize {
        self.chain.len()
    }
}

/// 链上弧长 s 处的点与切线（自由函数：Player 与 cloud 模块共用）
/// 返回 (pos, tangent, seg_idx, seg_u)
pub fn chain_pos_and_tangent(
    chain: &VecDeque<PlannedLeg>,
    s: f64,
) -> (Vec2, Vec2, usize, f64) {
    let mut acc = 0.0;
    for (idx, pl) in chain.iter().enumerate() {
        if acc + pl.arc >= s {
            let s_in = (s - acc).clamp(0.0, pl.arc);
            let sub_arc = pl.arc / 5.0;
            let sub_idx = ((s_in / sub_arc.max(1e-9)) as usize).min(4);
            let u = ((s_in - sub_idx as f64 * sub_arc) / sub_arc.max(1e-9)).clamp(0.0, 1.0);
            let leg = &pl.legs[sub_idx];
            let p = quad_bezier(leg.from, leg.ctrl, leg.target, u);
            let mut tan = bezier_tangent(leg.from, leg.ctrl, leg.target, u);
            // 退化切线（|tan| 极小——ctrl≈端点）：归一化后方向是浮点噪声，
            // tvel 被噪声方向猛拉 = 回弹之源——用段整体方向（from→target）替代
            if tan.x * tan.x + tan.y * tan.y < 0.06 * 0.06 {
                tan = Vec2 {
                    x: leg.target.x - leg.from.x,
                    y: leg.target.y - leg.from.y,
                };
            }
            return (p, tan, idx, u);
        }
        acc += pl.arc;
    }
    // 超出链尾：用链尾
    let last = chain.back().expect("chain non-empty");
    let tail = last.legs[4];
    (tail.target, Vec2 { x: 1.0, y: 0.0 }, chain.len() - 1, 1.0)
}

/// 段速度：随机档位；高速档（>1.2）40% 批准，不批准回落巡航档（重新生成新路径）
fn roll_speed() -> f64 {
    let idx = rand::random::<usize>() % SPEED_BANDS.len();
    let (lo, hi) = SPEED_BANDS[idx];
    let v = lo + rand::random::<f64>() * (hi - lo);
    if v > SPEED_THRESHOLD && rand::random::<f64>() >= SPEED_APPROVE_PROB {
        let (lo, hi) = SPEED_BANDS[1];
        lo + rand::random::<f64>() * (hi - lo)
    } else {
        v
    }
}

/// 造段（几何纯函数）：切线连续 + 段级 speed（wave 已彻底删除）
pub fn make_planned_leg(
    from: Vec2,
    dir: Vec2,
    template_idx: usize,
    target: Vec2,
    speed: f64,
) -> PlannedLeg {
    let dx = target.x - from.x;
    let dy = target.y - from.y;
    let dist = (dx * dx + dy * dy).sqrt().max(1e-6);
    let template = &TEMPLATES[template_idx];
    // 小圈圈滤波：段长低于 MIN_LEG_LEN 时曲率按比例衰减（短段配小弯，防哆嗦）
    let curv_eff = template.curvature * (dist / MIN_LEG_LEN).min(1.0);
    // 拟合助手：C 由 target 方向反推（段尾方向 ≈ target 方向——方向控制不丢；
    // A=B=模板曲率保持形状，后 40% 渐变到 C 拟合方向——曲率连续无折角）
    let ang_from = dir.y.atan2(dir.x);
    let ang_to = (target.y - from.y).atan2(target.x - from.x);
    let mut theta = ang_to - ang_from;
    while theta > std::f64::consts::PI {
        theta -= std::f64::consts::PI * 2.0;
    }
    while theta < -std::f64::consts::PI {
        theta += std::f64::consts::PI * 2.0;
    }
    // 贝塞尔子段转角 ≈ 2·atan(0.7·curv) ≈ 1.4·curv（小曲率线性近似，与段长无关）——
    // 5 子段 Σ ≈ 1.4×(1.2A+2.4B+1.2C)——C 反推：
    let curv_c = ((theta / 1.4 - 1.2 * curv_eff - 2.4 * curv_eff) / 1.2).clamp(-1.1, 1.1);
    make_blend_leg(from, dir, [curv_eff, curv_eff, curv_c], target, dist, template_idx, speed)
}

/// 混合模板段：一整段内曲率从 A 渐变到 B 再到 C（Euler spiral 离散近似）
/// 5 子段：前 2 段 lerp(A→B)、第 3 段 B、后 2 段 lerp(B→C)——段内模板渐变，
/// 子段间切线继承（C1 连续）+ 曲率阶梯采样（≈ 线性变化，无折角）
pub fn make_blend_leg(
    from: Vec2,
    dir: Vec2,
    curvs: [f64; 3],
    _target: Vec2,
    dist: f64,
    template_idx: usize,
    speed: f64,
) -> PlannedLeg {
    let sub_len = dist / 5.0;
    let mut legs = [Leg {
        from: Vec2 { x: 0.0, y: 0.0 },
        ctrl: Vec2 { x: 0.0, y: 0.0 },
        target: Vec2 { x: 0.0, y: 0.0 },
    }; 5];
    let mut cur = from;
    let mut d = dir;
    let mut arc = 0.0;
    for i in 0..5 {
        // 子段曲率：A→B 前半，B 中段，B→C 后半（Euler spiral 采样）
        let u = (i as f64 + 0.5) / 5.0;
        let curv = if u < 0.5 {
            curvs[0] + (curvs[1] - curvs[0]) * (u / 0.5)
        } else {
            curvs[1] + (curvs[2] - curvs[1]) * ((u - 0.5) / 0.5)
        };
        // 全部 5 子段按曲率渐变自然推进（曾第 5 子段「精确命中 target」——
        // target 方向与段头方向差大时，末子段极短 + 92° 急转 = 折角；
        // 自然推进 = 段尾连续、方向连续，链几何无折角）
        let sub_target = {
            let st = Vec2 {
                x: cur.x + d.x * sub_len,
                y: cur.y + d.y * sub_len,
            };
            Vec2 { x: st.x.clamp(0.04, 0.96), y: st.y.clamp(0.04, 0.96) }
        };
        let norm = Vec2 { x: -d.y, y: d.x };
        let mut ctrl = Vec2 {
            x: cur.x + d.x * (sub_len * 0.5) + norm.x * sub_len * curv * 0.35,
            y: cur.y + d.y * (sub_len * 0.5) + norm.y * sub_len * curv * 0.35,
        };
        // ctrl clamp 屏内：贝塞尔最凸点（u≈0.5）——8 点采样曾漏检极值，
        // 曲线中途出屏（第二个循环/边缘布局时球跑出屏幕）
        ctrl.x = ctrl.x.clamp(0.04, 0.96);
        ctrl.y = ctrl.y.clamp(0.04, 0.96);
        legs[i] = Leg { from: cur, ctrl, target: sub_target };
        arc += ((ctrl.x - cur.x).powi(2) + (ctrl.y - cur.y).powi(2)).sqrt()
            + ((sub_target.x - ctrl.x).powi(2) + (sub_target.y - ctrl.y).powi(2)).sqrt();
        // 下子段方向 = 本子段切线（C1 连续）
        let tan = bezier_tangent(cur, ctrl, sub_target, 1.0);
        let tl = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
        d = Vec2 { x: tan.x / tl, y: tan.y / tl };
        cur = sub_target;
    }
    // 段尾曲率（下段的连续性锚点——曲率严格连续，不用平均）
    let curv_eff = curvs[2];
    let dur_ms = (arc / (WORLD_SPEED * speed) * 1000.0).max(200.0);
    PlannedLeg {
        legs,
        template_idx,
        speed,
        curv_eff,
        dur_ms,
        arc,
    }
}

fn dir_of(from: Vec2, to: Vec2) -> Vec2 {
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    let l = (dx * dx + dy * dy).sqrt().max(1e-9);
    Vec2 { x: dx / l, y: dy / l }
}

pub fn leg_in_bounds(pl: &PlannedLeg, bounds: &CircleBounds) -> bool {
    // 大事情定稿：段全程须在活动圈内（每个子段 8 点采样，含曲线中途）
    for leg in pl.legs.iter() {
        if !bounds.contains(leg.from) {
            return false;
        }
        for i in 0..=8 {
            let u = i as f64 / 8.0;
            let p = quad_bezier(leg.from, leg.ctrl, leg.target, u);
            if !bounds.contains(p) {
                return false;
            }
        }
    }
    true
}

fn clamp_target_in_bounds(
    from: Vec2,
    dir: Vec2,
    template_idx: usize,
    mut target: Vec2,
    speed: f64,
    bounds: &CircleBounds,
) -> Vec2 {
    for _ in 0..24 {
        let pl = make_planned_leg(from, dir, template_idx, target, speed);
        if leg_in_bounds(&pl, bounds) {
            return target;
        }
        // 朝圆心收缩（活动圈内）
        target = bounds.toward_center(from, target, 0.82);
    }
    from
}

fn clamp_dur_to_chain(mut pl: PlannedLeg, tail_dur: f64) -> PlannedLeg {
    let ratio = pl.dur_ms / tail_dur.max(1.0);
    if ratio > crate::config::params::MAX_DUR_RATIO {
        pl.dur_ms = tail_dur * crate::config::params::MAX_DUR_RATIO;
    } else if ratio < 1.0 / crate::config::params::MAX_DUR_RATIO {
        pl.dur_ms = tail_dur / crate::config::params::MAX_DUR_RATIO;
    }
    pl
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn circle_bounds_contains_and_random() {
        let b = CircleBounds { cx: 0.5, cy: 0.4, r: 0.3 };
        assert!(b.contains(Vec2 { x: 0.5, y: 0.4 }), "圆心在圈内");
        assert!(b.contains(Vec2 { x: 0.5, y: 0.65 }), "下缘在圈内");
        assert!(!b.contains(Vec2 { x: 0.5, y: 0.75 }), "超出半径在圈外");
        assert!(!b.contains(Vec2 { x: 0.9, y: 0.4 }), "横向超界在圈外");
        // 随机点 200 次全在圈内
        use rand::Rng;
        let mut rng = rand::thread_rng();
        for _ in 0..200 {
            let p = b.random_point(&mut rng);
            assert!(b.contains(p), "随机点应在圈内: {p:?}");
        }
        // 收缩：朝圆心方向目标必收敛
        let t2 = b.toward_center(Vec2 { x: 0.1, y: 0.9 }, Vec2 { x: 0.9, y: 0.0 }, 0.5);
        assert!(b.contains(t2));
    }

    #[test]
    fn make_leg_keeps_endpoints() {
        // 真实场景：target 与 dir 夹角 ~18°（曲率连续约束下方向渐变——不极端）
        let from = Vec2 { x: 0.1, y: 0.2 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let target = Vec2 { x: 0.75, y: 0.4 };
        let pl = make_planned_leg(from, dir, 0, target, 1.0);
        assert_eq!(pl.legs[0].from, from);
        // 拟合助手：段尾方向 ≈ target 方向（C 由 target 反推——曲率渐变无折角；
        // 位置近似命中——不再精确命中 = 末子段方向跳变 = 折角）
        let tail = pl.legs[4].target;
        let dev = (tail.x - target.x).abs() + (tail.y - target.y).abs();
        assert!(dev < 0.3, "拟合段尾偏离 target 过大：{dev:.3}");
        // 段尾切线方向 vs target 方向夹角（方向拟合精度）
        let tt = bezier_tangent(pl.legs[4].from, pl.legs[4].ctrl, pl.legs[4].target, 1.0);
        let ang_tail = tt.y.atan2(tt.x);
        let ang_tgt = (target.y - from.y).atan2(target.x - from.x);
        let mut diff = (ang_tail - ang_tgt).abs();
        if diff > std::f64::consts::PI {
            diff = std::f64::consts::PI * 2.0 - diff;
        }
        assert!(diff < 0.6, "段尾方向偏离 target 方向过大：{diff:.3} rad");
        assert!(pl.dur_ms > 0.0);
        assert!(pl.arc > 0.0);
    }

    #[test]
    fn entry_points_staggered() {
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let pts = Player::entry_points(anchor, dir);
        assert!(pts[0].x > pts[1].x && pts[1].x > pts[2].x, "沿 -dir 错开");
    }

    #[test]
    fn balls_stay_in_screen_forever() {
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 0.8, y: 0.6 };
        let mut p = Player::new(anchor, dir);
        for _ in 0..120 * 60 {
            p.tick(16.7);
        }
        for s in 0..3 {
            let pos = p.world_pos(s, 0.0);
            assert!(
                (0.0..=1.0).contains(&pos.x) && (0.0..=1.0).contains(&pos.y),
                "球{s} 出屏: {:?}",
                pos
            );
        }
    }

    #[test]
    fn player_never_stops() {
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 0.8, y: 0.6 };
        let mut p = Player::new(anchor, dir);
        let mut last = [Vec2 { x: 0.0, y: 0.0 }; 3];
        for s in 0..3 {
            last[s] = p.world_pos(s, 0.0);
        }
        let mut moved = false;
        for i in 0..120 * 60 {
            p.tick(16.7);
            if i % 60 == 0 {
                for s in 0..3 {
                    let cur = p.world_pos(s, 0.0);
                    let d = ((cur.x - last[s].x).powi(2) + (cur.y - last[s].y).powi(2)).sqrt();
                    if d > 1e-9 {
                        moved = true;
                    }
                    last[s] = cur;
                }
            }
        }
        assert!(moved, "球应持续运动（无限轨迹）");
    }

    #[test]
    fn group_moves_together() {
        // 成群结对：三球沿链错开（两两弧长差 ≈ CHAIN_GAP）
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 0.8, y: 0.6 };
        let mut p = Player::new(anchor, dir);
        for _ in 0..60 * 60 {
            p.tick(16.7);
        }
        // 弧长差恒定 = 编队；实际位置互相接近（同链）
        let s0 = p.s_lead - p.gaps[0];
        let s1 = p.s_lead - p.gaps[1];
        let s2 = p.s_lead - p.gaps[2];
        assert!(s0 > s1 && s1 > s2, "弧长应错开: {s0} {s1} {s2}");
        for s in 0..3 {
            let pos = p.world_pos(s, 0.0);
            for o in (s + 1)..3 {
                let p2 = p.world_pos(o, 0.0);
                let d = ((pos.x - p2.x).powi(2) + (pos.y - p2.y).powi(2)).sqrt();
                assert!(d < 0.6, "球{s}/{o} 应成群（同链）: {d}");
            }
        }
    }

    #[test]
    fn chain_grows_forever() {
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 0.8, y: 0.6 };
        let mut p = Player::new(anchor, dir);
        let len0 = p.chain_len();
        for _ in 0..60 * 60 {
            p.tick(16.7);
        }
        assert!(p.chain_len() > len0, "链应持续增长（无限轨迹）");
    }

    #[test]
    fn blend_leg_curvature_gradates_a_to_c() {
        // Euler spiral 离散近似：曲率 A→B→C 渐变——首子段弯度 ∝ A，末子段 ∝ C
        let from = Vec2 { x: 0.2, y: 0.5 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let target = Vec2 { x: 0.8, y: 0.5 };
        let pl = make_blend_leg(from, dir, [1.0, 0.5, 0.0], target, 0.6, 0, 1.0);
        // 方向拟合由调用方（make_planned_leg/ensure_chain 的 C 反推）负责——
        // 本测试只验证曲率渐变结构（下方 sides 递减）与段尾自然推进
        // 曲率递减验证：各子段相对「自身起点方向」的法线侧偏（cross(dir, ctrl-from)）
        let mut prev_dir = dir;
        let mut sides = [0.0f64; 5];
        for i in 0..5 {
            let f = pl.legs[i].from;
            let c = pl.legs[i].ctrl;
            sides[i] = ((c.x - f.x) * (-prev_dir.y) + (c.y - f.y) * prev_dir.x).abs();
            let t2 = pl.legs[i].target;
            let dl = ((t2.x - f.x).powi(2) + (t2.y - f.y).powi(2)).sqrt().max(1e-9);
            prev_dir = Vec2 { x: (t2.x - f.x) / dl, y: (t2.y - f.y) / dl };
        }
        assert!(
            sides[0] > sides[4] * 2.0,
            "曲率应从 A(1.0) 渐变到 C(0.0): sides={sides:?}"
        );
        assert!(sides[0] > 0.0, "首子段应有显著弯曲");
        // 段内切线继承（C1 连续）：子段 i 起点 = 子段 i-1 终点
        for i in 1..5 {
            assert_eq!(pl.legs[i].from, pl.legs[i - 1].target, "子段 {i} 起点应接上段终点");
        }
        // 弧长为正
        assert!(pl.arc > 0.0);
    }

    #[test]
    fn duration_scales_with_path_length() {
        let from = Vec2 { x: 0.1, y: 0.5 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let short = make_planned_leg(from, dir, 0, Vec2 { x: 0.3, y: 0.5 }, 1.0);
        let long = make_planned_leg(from, dir, 0, Vec2 { x: 0.95, y: 0.5 }, 1.0);
        assert!(long.dur_ms > short.dur_ms * 2.0);
    }
}

#[test]
fn no_recoil_after_sprint() {
    // 冲刺回弹回归测试：高速段(1.6) → 低速段(0.55) 切换时，
    // 球不得先越过目标再被 spring 拉回（阻尼项被 MAX_ACCEL 钳制时的典型症状）
    let mk_leg = |y0: f64, y1: f64, speed: f64| -> PlannedLeg {
        let from = Vec2 { x: 0.5, y: y0 };
        let target = Vec2 { x: 0.5, y: y1 };
        let ctrl = Vec2 { x: 0.5, y: (y0 + y1) / 2.0 };
        let sub = (y1 - y0) / 5.0;
        let mut legs = [Leg { from, ctrl, target }; 5];
        for (i, leg) in legs.iter_mut().enumerate() {
            let f = y0 + sub * i as f64;
            leg.from = Vec2 { x: 0.5, y: f };
            leg.target = Vec2 { x: 0.5, y: f + sub };
            leg.ctrl = Vec2 { x: 0.5, y: f + sub / 2.0 };
        }
        PlannedLeg {
            legs,
            template_idx: 0,
            speed,
            curv_eff: 0.0,
            dur_ms: (y1 - y0) / (WORLD_SPEED * speed) * 1000.0,
            arc: y1 - y0,
        }
    };

    // 高速段 0.70 世界（y 轴 0.15→0.85）：让球充分加速到全速 0.35，再进低速段
    let mut p = Player::new(Vec2 { x: 0.5, y: 0.5 }, Vec2 { x: 1.0, y: 0.0 });
    // 测试用大活动圆（0.6）覆盖测试链全程——fallback 圆(0.35)会让测试链出圆
    p.bounds = CircleBounds { cx: 0.5, cy: 0.5, r: 0.6 };
    p.chain = VecDeque::from([mk_leg(0.15, 0.85, 1.6), mk_leg(0.85, 0.96, 0.55)]);
    p.s_lead = 0.17;

    // 热身：先跑 300 帧确保球贴链（dev<0.025，真实巡航状态）
    let mut dev0 = f64::MAX;
    for _ in 0..300 {
        p.tick(16.0);
        let (tg, _, _, _) = chain_pos_and_tangent(&p.chain, p.s_lead - p.gaps[0]);
        dev0 = ((tg.x - p.states[0].pos.x).powi(2) + (tg.y - p.states[0].pos.y).powi(2)).sqrt();
    }
    eprintln!(
        "warm done: s_lead={:.3} pos.y={:.3} vel.y={:.3} dev={dev0:.4}",
        p.s_lead, p.states[0].pos.y, p.states[0].vel.y
    );
    assert!(dev0 < 0.025, "热身未贴链：dev={dev0:.4}");
    // 先跑 30 帧消化贴链收敛瞬态；再监测 300 帧（覆盖跨入低速段窗口）：
    // 回弹 = 球超前目标（ahead>0.02）且正在后退（retreat>0.02，沿 -tan 运动）——
    // 贴链调整（dev 波动、收敛）不超调不后退，不算回弹
    for _ in 0..30 {
        p.tick(16.0);
    }
    for _ in 0..300 {
        p.tick(16.0);
        let (tgt, tan, _, _) = chain_pos_and_tangent(&p.chain, p.s_lead - p.gaps[0]);
        let v = p.states[0].vel;
        let tm = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
        let ahead = ((p.states[0].pos.x - tgt.x) * tan.x + (p.states[0].pos.y - tgt.y) * tan.y) / tm;
        let retreat = -(v.x * tan.x + v.y * tan.y) / tm;
        assert!(
            ahead < 0.02 || retreat < 0.02,
            "冲刺后回弹！ahead={ahead:.4} retreat={retreat:.4} pos=({:.3},{:.3}) target=({:.3},{:.3})",
            p.states[0].pos.x, p.states[0].pos.y, tgt.x, tgt.y
        );
    }
}

#[test]
fn sprint_recoil_audit() {
    // 真实链审计：随机链跑 100s，统计「回弹事件」——
    // 球速与目标切线夹角 >100°（球往目标反方向运动）且速度 >0.05
    let mut p = Player::new(Vec2 { x: 0.5, y: 0.5 }, Vec2 { x: 1.0, y: 0.0 });
    let mut recoils = 0usize;
    let mut worst_dot = 1.0f64;
    let mut total = 0usize;
    for i in 0..6000 {
        p.tick(16.0);
        // 三球都查
        for s in 0..3 {
            let s_i = p.s_lead - p.gaps[s];
            if s_i < 0.0 { continue; }
            let (tgt, tan, seg_at, _) = chain_pos_and_tangent(&p.chain, s_i);
            let v = p.states[s].vel;
            let vm = (v.x * v.x + v.y * v.y).sqrt();
            if vm < 0.05 { continue; }
            let tm = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            let dot = (v.x * tan.x + v.y * tan.y) / vm / tm;
            worst_dot = worst_dot.min(dot);
            // 真回弹 = 球超前于目标（沿切线方向）且正在后退（沿 -tan 运动）
            // ——转弯（夹角大但没超前）不算回弹
            let rel_x = p.states[s].pos.x - tgt.x;
            let rel_y = p.states[s].pos.y - tgt.y;
            let ahead = (rel_x * tan.x + rel_y * tan.y) / tm; // >0 = 球在目标前方
            let retreat = -(v.x * tan.x + v.y * tan.y) / tm; // >0 = 球在后退
            if ahead > 0.02 && retreat > 0.02 {
                recoils += 1;
                if recoils <= 12 {
                    let seg = &p.chain[seg_at];
                    let f = seg.legs[0].from;
                    let tg = seg.legs[4].target;
                    // 未来段（tan_f 所在段）
                    let s_fut = s_i + p.states[s].rate * WORLD_SPEED * LOOKAHEAD_SECONDS;
                    let (_, _, seg_f_at, _) = chain_pos_and_tangent(&p.chain, s_fut);
                    let segf = &p.chain[seg_f_at];
                    let ff = segf.legs[0].from;
                    let tf = segf.legs[4].target;
                    eprintln!(
                        "RECOIL s={} s_i={:.3} v=({:.3},{:.3}) ahead={:.3} retreat={:.3} | at tpl={} curv={:.2} from=({:.2},{:.2})->({:.2},{:.2}) | fut tpl={} curv={:.2} from=({:.2},{:.2})->({:.2},{:.2})",
                        s, s_i, v.x, v.y, ahead, retreat,
                        seg.template_idx,
                        crate::config::templates::TEMPLATES[seg.template_idx].curvature,
                        f.x, f.y, tg.x, tg.y,
                        segf.template_idx,
                        crate::config::templates::TEMPLATES[segf.template_idx].curvature,
                        ff.x, ff.y, tf.x, tf.y,
                    );
                }
            }
            total += 1;
        }
        if i % 1000 == 0 {
            eprintln!("t={i} worst_dot={worst_dot:.3} recoils={recoils}");
        }
    }
    eprintln!("AUDIT: recoils={recoils} total={total} worst_dot={worst_dot:.3}");
    assert!(
        recoils <= 6,
        "回弹事件过多：{recoils}/6000 帧（worst_dot={worst_dot:.3}）"
    );
}

#[test]
fn chain_direction_jumps_audit() {
    // 链几何审计：补 300 段，统计段间方向差 >60° 的跳变（180° 反转的直接证据）
    let mut p = Player::new(Vec2 { x: 0.5, y: 0.5 }, Vec2 { x: 1.0, y: 0.0 });
    p.ensure_chain_to(300.0);
    let chain: Vec<_> = p.chain.iter().cloned().collect();
    let mut jumps = 0usize;
    for w in chain.windows(2) {
        let a = &w[0];
        let b = &w[1];
        let ta = bezier_tangent(a.legs[4].from, a.legs[4].ctrl, a.legs[4].target, 1.0);
        let tb = bezier_tangent(b.legs[0].from, b.legs[0].ctrl, b.legs[0].target, 0.0);
        let la = (ta.x * ta.x + ta.y * ta.y).sqrt().max(1e-9);
        let lb = (tb.x * tb.x + tb.y * tb.y).sqrt().max(1e-9);
        let dot = (ta.x * tb.x + ta.y * tb.y) / la / lb;
        let deg = dot.clamp(-1.0, 1.0).acos().to_degrees();
        if deg > 60.0 {
            jumps += 1;
            if jumps <= 6 {
                let from = a.legs[4].target;
                eprintln!(
                    "JUMP {deg:.0}°  from=({:.3},{:.3})  A_tpl={} curv={:.2} arc={:.2}  B_tpl={} curv={:.2} arc={:.2}",
                    from.x, from.y,
                    a.template_idx,
                    TEMPLATES[a.template_idx].curvature,
                    a.arc,
                    b.template_idx,
                    TEMPLATES[b.template_idx].curvature,
                    b.arc,
                );
            }
        }
    }
    eprintln!("CHAIN AUDIT: jumps={jumps}/300 段");
    assert!(jumps <= 6, "段间方向跳变过多：{jumps}");
}

#[test]
fn queue_speed_uniform_no_stop_go() {
    // 走走停停回归测试：交替高速/低速段链——三球速度大小必须一致
    // （智能匀速 = 队列同速；曾按各自链上位置的 profile 速度 → 蓝绿忽快忽慢）
    let mk_leg = |x0: f64, x1: f64, speed: f64| -> PlannedLeg {
        let from = Vec2 { x: x0, y: 0.5 };
        let target = Vec2 { x: x1, y: 0.5 };
        let sub = (x1 - x0) / 5.0;
        let mut legs = [Leg { from, ctrl: target, target }; 5];
        for (i, leg) in legs.iter_mut().enumerate() {
            let f = x0 + sub * i as f64;
            leg.from = Vec2 { x: f, y: 0.5 };
            leg.target = Vec2 { x: f + sub, y: 0.5 };
            leg.ctrl = Vec2 { x: f + sub / 2.0, y: 0.5 };
        }
        PlannedLeg {
            legs,
            template_idx: 0,
            speed,
            curv_eff: 0.0,
            dur_ms: (x1 - x0) / (WORLD_SPEED * speed) * 1000.0,
            arc: x1 - x0,
        }
    };
    let mut p = Player::new(Vec2 { x: 0.5, y: 0.5 }, Vec2 { x: 1.0, y: 0.0 });
    p.bounds = CircleBounds { cx: 0.5, cy: 0.5, r: 0.6 };
    // 交替：高速(1.6) 低速(0.55) 高速 低速——共 8 段覆盖三球错开范围
    let mut chain = VecDeque::new();
    let mut x = 0.1;
    for i in 0..8 {
        let sp = if i % 2 == 0 { 1.6 } else { 0.55 };
        chain.push_back(mk_leg(x, x + 0.15, sp));
        x += 0.15;
    }
    p.chain = chain;
    p.s_lead = 0.08;
    // 热身 100 帧（上链+贴链）
    for _ in 0..100 {
        p.tick(16.0);
    }
    // 监测 200 帧：三球速度大小必须一致（相对差 < 2%）
    let mut worst = 0.0f64;
    for _ in 0..200 {
        p.tick(16.0);
        let v0 = (p.states[0].vel.x.powi(2) + p.states[0].vel.y.powi(2)).sqrt();
        let v1 = (p.states[1].vel.x.powi(2) + p.states[1].vel.y.powi(2)).sqrt();
        let v2 = (p.states[2].vel.x.powi(2) + p.states[2].vel.y.powi(2)).sqrt();
        let max = v0.max(v1).max(v2).max(1e-9);
        let spread = (max - v0.min(v1).min(v2)) / max;
        worst = worst.max(spread);
    }
    eprintln!("queue speed spread: {worst:.4}");
    assert!(
        worst < 0.02,
        "队列速度不一致（走走停停）：spread={worst:.4}"
    );
}

#[test]
fn chain_curvature_continuous_no_kinks() {
    // 折角回归测试：链上曲率估计（κ ≈ Δθ/Δs）不得跳变——
    // EulerBlend 段内曲率渐变 → 相邻 κ 差 < 0.05；
    // Native 单模板段间曲率跳（≤0.35）→ 测试可区分
    let mut p = Player::new(Vec2 { x: 0.5, y: 0.5 }, Vec2 { x: 1.0, y: 0.0 });
    p.bounds = CircleBounds { cx: 0.5, cy: 0.5, r: 0.6 };
    p.ensure_chain_to(60.0);
    let ds = 0.02;
    let mut prev_ang: Option<f64> = None;
    let mut prev_k = 0.0f64;
    let mut max_k_jump = 0.0f64;
    for i in 0..3000 {
        let s = i as f64 * ds;
        let (_, tan, seg_at, _) = chain_pos_and_tangent(&p.chain, s);
        // 跳过退化切线（|tan| 极小——回退方向是段方向近似，非真实切线）
        if (tan.x * tan.x + tan.y * tan.y).sqrt() < 0.08 {
            prev_ang = None;
            continue;
        }
        let ang = tan.y.atan2(tan.x);
        if let Some(pa) = prev_ang {
            let mut d = (ang - pa).abs();
            // 角度环绕归一化
            if d > std::f64::consts::PI {
                d = std::f64::consts::PI * 2.0 - d;
            }
            let k = d / ds; // 曲率估计
            let jump = (k - prev_k).abs();
            if jump > 1.0 && max_k_jump < jump {
                let seg = &p.chain[seg_at];
                let f = seg.legs[0].from;
                let tg = seg.legs[4].target;
                eprintln!(
                    "KINK at s={s:.3} d={d:.4} |tan|={:.4} tpl={} curv={:.2} arc={:.2} from=({:.2},{:.2})->({:.2},{:.2})",
                    (tan.x * tan.x + tan.y * tan.y).sqrt(),
                    seg.template_idx,
                    TEMPLATES[seg.template_idx].curvature,
                    seg.arc,
                    f.x, f.y, tg.x, tg.y,
                );
            }
            max_k_jump = max_k_jump.max(jump);
            prev_k = k;
        }
        prev_ang = Some(ang);
    }
    eprintln!("max curvature jump (per 0.02 arc): {max_k_jump:.4}");
    assert!(
        max_k_jump < 0.3,
        "链上曲率跳变过大（折角）：{max_k_jump:.4}（EulerBlend 应 < 0.1）"
    );
}
