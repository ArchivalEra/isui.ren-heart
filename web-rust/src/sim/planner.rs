// 规划器 + 执行器（纯 Rust，可单测）
// 共享路径链模型：三个小孩一个接一个跑
// - 共享链：legs 为连续路径段队列（段间 from=上段 target）
// - 独立游标：每球 Cursor{idx, t} 沿链推进（队首先进新段，队尾还在旧段）
// - 入场：汇合链（spots[2]→spots[1]→spots[0]）+ 正式链，零跳变
use crate::config::params::*;
use crate::config::templates::TEMPLATES;
use crate::sim::math::*;

use crate::sim::target::random_target_apart;
use std::collections::VecDeque;

#[derive(Clone, Copy, Debug)]
pub struct Leg {
    pub from: Vec2,
    pub ctrl: Vec2,
    pub target: Vec2,
}

pub struct PlannedLeg {
    pub leg: Leg,
    pub template_idx: usize,
    pub dur_ms: f64,
}

/// 每球独立链（无共享汇合：三球各自从到达点出发，出发时间错开）
struct BallPlan {
    legs: VecDeque<PlannedLeg>,
    cur_idx: usize,
    t: f64,
    state: BallState,
    /// 出发延迟（错开：一个接一个但不排队）
    delay_ms: f64,
}

/// 每球物理状态（PD spring 追踪）
#[derive(Clone, Copy)]
struct BallState {
    pos: Vec2,
    vel: Vec2,
    /// 沿链速率（平滑中，向段理想速率收敛）
    rate: f64,
}

/// 执行器：三球独立链 + spring 物理
pub struct Player {
    plans: [BallPlan; 3],
    pub order: [usize; 3],
}

impl Player {
    /// 三球各自从到达点出发；出发错开 delay = i × STAGGER_MS（无排队仪式）
    pub fn new(spots: [Vec2; 3]) -> Self {
        let mut plans_buf: [Option<BallPlan>; 3] = [None, None, None];
        for i in 0..3 {
            // 目标去重（商量）
            let others = [spots[(i + 1) % 3], spots[(i + 2) % 3]];
            let target = random_target_apart(&others, MIN_BALL_DIST);
            let dir = dir_of(spots[i], target);
            let mut leg = make_planned_leg(spots[i], dir, 0, target);
            if !leg_in_bounds(&leg.leg) {
                let safe = clamp_target_in_bounds(spots[i], dir, 0, target);
                leg = make_planned_leg(spots[i], dir, 0, safe);
            }
            let state = BallState { pos: spots[i], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED };
            plans_buf[i] = Some(BallPlan {
                legs: {
                    let mut q = VecDeque::new();
                    q.push_back(leg);
                    q
                },
                cur_idx: 0,
                t: 0.0,
                state,
                delay_ms: i as f64 * STAGGER_MS,
            });
        }
        let plans = plans_buf.map(|p| p.expect("plan initialized"));
        Player { plans, order: ORDERS[0] }
    }

    pub fn tick(&mut self, dt: f64) {
        let dt_s = dt / 1000.0;
        let k = SPRING.stiffness;
        let c_damp = SPRING.damping * 2.0 * k.sqrt();
        let rate_lerp = (dt_s / 0.15).min(1.0);

        for s in 0..3 {
            let pl = &mut self.plans[s];
            // 出发错开：延迟未到 → 静止在起点
            if pl.delay_ms > 0.0 {
                pl.delay_ms -= dt;
                continue;
            }
            // 游标推进（线性 t，速度平滑交给 spring）
            let dur = pl
                .legs
                .get(pl.cur_idx)
                .map(|x| x.dur_ms)
                .unwrap_or(1000.0);
            pl.t += dt / dur;
            while pl.t >= 1.0 {
                if pl.cur_idx + 1 < pl.legs.len() {
                    pl.cur_idx += 1;
                    pl.t = 0.0;
                } else {
                    pl.t = 1.0;
                    break;
                }
            }
            // PD spring：目标 = 自己的链上点；速度目标 = 切线 × 平滑速率
            let (target, tan) = chain_pos_and_tangent(&pl.legs, pl.cur_idx, pl.t);
            let r_ideal = WORLD_SPEED
                * TEMPLATES[pl.legs.get(pl.cur_idx).map(|x| x.template_idx).unwrap_or(0)]
                    .speed();
            pl.state.rate += (r_ideal - pl.state.rate) * rate_lerp;
            let tl = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            let tvel = Vec2 { x: tan.x / tl * pl.state.rate, y: tan.y / tl * pl.state.rate };
            let ax = k * (target.x - pl.state.pos.x) + c_damp * (tvel.x - pl.state.vel.x);
            let ay = k * (target.y - pl.state.pos.y) + c_damp * (tvel.y - pl.state.vel.y);
            pl.state.vel.x += ax * dt_s;
            pl.state.vel.y += ay * dt_s;
            pl.state.pos.x = (pl.state.pos.x + pl.state.vel.x * dt_s).clamp(0.0, 1.0);
            pl.state.pos.y = (pl.state.pos.y + pl.state.vel.y * dt_s).clamp(0.0, 1.0);
        }
        self.ensure_chains();
    }

    fn ensure_chains(&mut self) {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        for s in 0..3 {
            while self.plans[s].legs.len() < self.plans[s].cur_idx + 4 {
                // 目标去重（商量）：与其他球当前目标保持距离
                let from = self.plans[s]
                    .legs
                    .back()
                    .map(|x| x.leg.target)
                    .unwrap_or(Vec2 { x: 0.5, y: 0.5 });
                let others = [
                    self.plans[(s + 1) % 3]
                        .legs
                        .back()
                        .map(|x| x.leg.target)
                        .unwrap_or(from),
                    self.plans[(s + 2) % 3]
                        .legs
                        .back()
                        .map(|x| x.leg.target)
                        .unwrap_or(from),
                ];
                // 拷贝 tail 关键值（避免借用冲突）
                let (tail_leg, tail_dur, tail_tpl) = {
                    let tail = self.plans[s].legs.back().expect("chain non-empty");
                    (tail.leg, tail.dur_ms, tail.template_idx)
                };
                let dir = if tail_leg.from == tail_leg.target {
                    Vec2 { x: 1.0, y: 0.0 }
                } else {
                    let tan = bezier_tangent(tail_leg.from, tail_leg.ctrl, tail_leg.target, 1.0);
                    let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
                    Vec2 { x: tan.x / l, y: tan.y / l }
                };
                let roll = rng.gen::<f64>();
                let template_idx = if roll < PROB.switch_template {
                    rng.gen_range(0..TEMPLATES.len())
                } else {
                    tail_tpl
                };
                if rng.gen::<f64>() < PROB.switch_order {
                    let next = ORDERS[rng.gen_range(0..ORDERS.len())];
                    if next != self.order {
                        self.order = next;
                    }
                }
                // 重试生成合法段
                let mut pushed = false;
                for _ in 0..8 {
                    let target = random_target_apart(&others, MIN_BALL_DIST);
                    let pl = make_planned_leg(from, dir, template_idx, target);
                    if leg_in_bounds(&pl.leg) {
                        self.plans[s]
                            .legs
                            .push_back(clamp_dur_to_chain(pl, tail_dur));
                        pushed = true;
                        break;
                    }
                }
                if !pushed {
                    let target = random_target_apart(&others, MIN_BALL_DIST);
                    let safe = clamp_target_in_bounds(from, dir, template_idx, target);
                    let pl = make_planned_leg(from, dir, template_idx, safe);
                    self.plans[s].legs.push_back(clamp_dur_to_chain(pl, tail_dur));
                }
            }
        }
    }

    /// 球位：spring 物理状态 + 法线分离量
    pub fn world_pos(&self, color_slot: usize, offset: f64) -> Vec2 {
        let pl = &self.plans[color_slot];
        let st = &pl.state;
        if let Some(leg) = pl.legs.get(pl.cur_idx) {
            let tan = bezier_tangent(leg.leg.from, leg.leg.ctrl, leg.leg.target, pl.t.clamp(0.0, 1.0));
            let n = normal_of(tan);
            Vec2 {
                x: (st.pos.x + n.x * offset * WANDER.offset_range).clamp(0.0, 1.0),
                y: (st.pos.y + n.y * offset * WANDER.offset_range).clamp(0.0, 1.0),
            }
        } else {
            st.pos
        }
    }

    pub fn template_idx(&self, color_slot: usize) -> usize {
        self.plans[color_slot]
            .legs
            .get(self.plans[color_slot].cur_idx)
            .map(|x| x.template_idx)
            .unwrap_or(0)
    }

    /// 调试：当前目标
    pub fn target_of(&self, color_slot: usize) -> Vec2 {
        self.plans[color_slot]
            .legs
            .get(self.plans[color_slot].cur_idx)
            .map(|x| x.leg.target)
            .unwrap_or(Vec2 { x: 0.5, y: 0.5 })
    }

    #[cfg(test)]
    pub fn cursor_idx(&self, color_slot: usize) -> usize {
        self.plans[color_slot].cur_idx
    }

    #[cfg(test)]
    pub fn is_delayed(&self, color_slot: usize) -> bool {
        self.plans[color_slot].delay_ms > 0.0
    }
}

/// 链上目标位置 + 切线（线性 t；spring 做全部平滑）
fn chain_pos_and_tangent(legs: &VecDeque<PlannedLeg>, idx: usize, t: f64) -> (Vec2, Vec2) {
    let pl = legs.get(idx).expect("cursor idx in chain");
    let leg = &pl.leg;
    let u = t.clamp(0.0, 1.0);
    let p = quad_bezier(leg.from, leg.ctrl, leg.target, u);
    let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, u);
    let n = normal_of(tan);
    // 段内摆动（模板差异化）
    let wave = TEMPLATES[pl.template_idx].wave;
    let wobble = wave * (u * std::f64::consts::PI * 2.0).sin();
    let pos = Vec2 {
        x: (p.x + n.x * wobble).clamp(0.0, 1.0),
        y: (p.y + n.y * wobble).clamp(0.0, 1.0),
    };
    (pos, tan)
}

/// 造段（几何纯函数）：切线连续 + 时长挂钩路径长度（恒定世界速度）
pub fn make_planned_leg(from: Vec2, dir: Vec2, template_idx: usize, target: Vec2) -> PlannedLeg {
    let dx = target.x - from.x;
    let dy = target.y - from.y;
    let dist = (dx * dx + dy * dy).sqrt().max(1e-6);
    let template = &TEMPLATES[template_idx];
    let norm = Vec2 { x: -dir.y, y: dir.x };
    let ctrl = Vec2 {
        x: from.x + dir.x * (dist * 0.5) + norm.x * dist * template.curvature * 0.35,
        y: from.y + dir.y * (dist * 0.5) + norm.y * dist * template.curvature * 0.35,
    };
    PlannedLeg {
        leg: Leg { from, ctrl, target },
        template_idx,
        dur_ms: leg_duration_ms(&Leg { from, ctrl, target }, template),
    }
}

/// 路径时长：世界速度恒定 → 时长 = 长度 / (WORLD_SPEED × 模板速度)
fn leg_duration_ms(leg: &Leg, template: &crate::config::templates::Template) -> f64 {
    let bend = ((leg.ctrl.x - leg.from.x).powi(2) + (leg.ctrl.y - leg.from.y).powi(2)).sqrt()
        + ((leg.target.x - leg.ctrl.x).powi(2) + (leg.target.y - leg.ctrl.y).powi(2)).sqrt();
    (bend / (WORLD_SPEED * template.speed()) * 1000.0).max(200.0)
}

/// 时长比约束：新段 dur 与链尾 dur 的比值限制在 MAX_DUR_RATIO 内
/// （球速差异过大 = 「换顺序」瞬间完成，视觉上太快）
fn clamp_dur_to_chain(mut pl: PlannedLeg, tail_dur: f64) -> PlannedLeg {
    let ratio = pl.dur_ms / tail_dur.max(1.0);
    if ratio > crate::config::params::MAX_DUR_RATIO {
        pl.dur_ms = tail_dur * crate::config::params::MAX_DUR_RATIO;
    } else if ratio < 1.0 / crate::config::params::MAX_DUR_RATIO {
        pl.dur_ms = tail_dur / crate::config::params::MAX_DUR_RATIO;
    }
    pl
}

fn dir_of(from: Vec2, to: Vec2) -> Vec2 {
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    let l = (dx * dx + dy * dy).sqrt().max(1e-9);
    Vec2 { x: dx / l, y: dy / l }
}

/// 路径可行性（凸包性质：三点屏内 ⟺ 全程屏内；浮点容差）
pub fn leg_in_bounds(leg: &Leg) -> bool {
    in_unit(leg.from) && in_unit(leg.ctrl) && in_unit(leg.target)
}

fn in_unit(p: Vec2) -> bool {
    p.x >= -1e-6 && p.x <= 1.0 + 1e-6 && p.y >= -1e-6 && p.y <= 1.0 + 1e-6
}

/// 目标收缩：朝起点方向拉回，直到控制点与目标都在屏内（保切线连续）
fn clamp_target_in_bounds(from: Vec2, dir: Vec2, template_idx: usize, mut target: Vec2) -> Vec2 {
    for _ in 0..20 {
        let pl = make_planned_leg(from, dir, template_idx, target);
        if in_unit(pl.leg.ctrl) && in_unit(pl.leg.target) {
            return target;
        }
        target = Vec2 { x: from.x + (target.x - from.x) * 0.85, y: from.y + (target.y - from.y) * 0.85 };
    }
    from
}

/// 入场状态机（数据；转移由引擎层驱动）
pub enum Phase {
    AtLogo { t: f64 },
    Travel { from: [Vec2; 3], to: [Vec2; 3], t: f64 },
    Play(Player),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn make_leg_keeps_endpoints() {
        let from = Vec2 { x: 0.1, y: 0.2 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let target = Vec2 { x: 0.9, y: 0.8 };
        let pl = make_planned_leg(from, dir, 0, target);
        assert_eq!(pl.leg.from, from);
        assert_eq!(pl.leg.target, target);
        assert!(pl.dur_ms > 0.0);
    }

    #[test]
    fn clamp_target_keeps_leg_in_screen() {
        let from = Vec2 { x: 0.0, y: 0.0 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let target = Vec2 { x: 1.0, y: 1.0 };
        for tpl in 0..TEMPLATES.len() {
            let safe = clamp_target_in_bounds(from, dir, tpl, target);
            let pl = make_planned_leg(from, dir, tpl, safe);
            assert!(leg_in_bounds(&pl.leg), "收缩后应屏内: {:?}", pl.leg);
        }
    }

    #[test]
    fn player_balls_start_continuous() {
        let spots = [
            Vec2 { x: 0.2, y: 0.3 },
            Vec2 { x: 0.5, y: 0.6 },
            Vec2 { x: 0.8, y: 0.4 },
        ];
        let p = Player::new(spots);
        // t=0 时位置 == 到达点（入场连续，零跳变）
        for s in 0..3 {
            let pos = p.world_pos(s, 0.0);
            assert!(
                (pos.x - spots[s].x).abs() < 1e-6 && (pos.y - spots[s].y).abs() < 1e-6,
                "球{s} 入场应连续: 期望 {:?} 实际 {:?}",
                spots[s],
                pos
            );
        }
    }

    #[test]
    fn staggered_start() {
        // 出发错开：球0 先动，球1/球2 依次延迟（无排队仪式）
        let spots = [
            Vec2 { x: 0.2, y: 0.3 },
            Vec2 { x: 0.5, y: 0.6 },
            Vec2 { x: 0.8, y: 0.4 },
        ];
        let mut p = Player::new(spots);
        assert!(p.is_delayed(2) && p.is_delayed(1), "球1/2 初始应延迟");
        assert!(!p.is_delayed(0), "球0 应立即出发");
        // 推进 300ms：球0 已动，球1/2 仍延迟
        for _ in 0..18 {
            p.tick(16.7);
        }
        assert!(!p.is_delayed(0), "球0 应已出发");
        assert!(p.is_delayed(1) || p.is_delayed(2), "球1/2 应仍在延迟");
        // 推进 600ms：全部出发
        for _ in 0..40 {
            p.tick(16.7);
        }
        assert!(!p.is_delayed(0) && !p.is_delayed(1) && !p.is_delayed(2), "全部应已出发");
    }

    #[test]
    fn world_pos_stays_in_screen_after_horizon() {
        let spots = [
            Vec2 { x: 0.2, y: 0.3 },
            Vec2 { x: 0.5, y: 0.6 },
            Vec2 { x: 0.8, y: 0.4 },
        ];
        let mut p = Player::new(spots);
        for _ in 0..90 * 60 {
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
        let spots = [
            Vec2 { x: 0.3, y: 0.3 },
            Vec2 { x: 0.5, y: 0.5 },
            Vec2 { x: 0.7, y: 0.7 },
        ];
        let mut p = Player::new(spots);
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
                    let dist = ((cur.x - last[s].x).powi(2) + (cur.y - last[s].y).powi(2)).sqrt();
                    if dist > 1e-9 {
                        moved = true;
                    }
                    last[s] = cur;
                }
            }
        }
        assert!(moved, "球应持续运动（无限轨迹）");
    }

    #[test]
    fn all_planned_legs_stay_in_screen() {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        for _ in 0..50 {
            let spots = [
                Vec2 { x: rng.gen(), y: rng.gen() },
                Vec2 { x: rng.gen(), y: rng.gen() },
                Vec2 { x: rng.gen(), y: rng.gen() },
            ];
            let mut p = Player::new(spots);
            for _ in 0..60 * 30 {
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
    }

    #[test]
    fn chain_duration_ratio_bounded() {
        // 相邻段时长比受 MAX_DUR_RATIO 约束（换序速度可控）
        use crate::config::params::MAX_DUR_RATIO;
        let spots = [
            Vec2 { x: 0.3, y: 0.3 },
            Vec2 { x: 0.5, y: 0.5 },
            Vec2 { x: 0.7, y: 0.7 },
        ];
        let mut p = Player::new(spots);
        for _ in 0..60 * 30 {
            p.tick(16.7);
            let legs = &p.plans[0].legs;
            if legs.len() < 5 {
                continue;
            }
            let n = legs.len();
            let tail = &legs[n - 1];
            let prev = &legs[n - 2];
            let r = tail.dur_ms / prev.dur_ms.max(1.0);
            assert!(r <= MAX_DUR_RATIO + 1e-6 && r >= 1.0 / MAX_DUR_RATIO - 1e-6,
                "相邻段时长比越界: {r}");
        }
    }

    #[test]
    fn duration_scales_with_path_length() {
        let from = Vec2 { x: 0.1, y: 0.5 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let short = make_planned_leg(from, dir, 0, Vec2 { x: 0.3, y: 0.5 });
        let long = make_planned_leg(from, dir, 0, Vec2 { x: 0.95, y: 0.5 });
        assert!(long.dur_ms > short.dur_ms * 2.0, "长路径应显著更久: short={} long={}", short.dur_ms, long.dur_ms);
    }
}
