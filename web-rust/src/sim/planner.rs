// 规划器 + 执行器（纯 Rust，可单测）
// 弧长共享链模型：三球成群结对沿同一链跑，弧长错开（一个接一个）
// - 链 = 连续路径段队列（段间 from=上段 target，切线继承）
// - 队首弧长 s_lead 推进；球 i 弧长 = s_lead - i×GAP（沿链错开）
// - 球 i 未上链（s<0）时停在起点（= Travel 到达点，链起点后方）→ 自然滑上链，无排队仪式
// - PD spring 追踪链上目标（丝滑：位置+速度双目标）
use crate::config::params::*;
use crate::config::templates::TEMPLATES;
use crate::sim::math::*;
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
pub struct Player {
    chain: VecDeque<PlannedLeg>,
    /// 队首（球0）弧长
    s_lead: f64,
    states: [BallState; 3],
    /// 每球沿链错开弧长（0, GAP, 2×GAP）
    gaps: [f64; 3],
    pub order: [usize; 3],
}

impl Player {
    /// 上链点：球 i 到达点 = 链起点后方 i×GAP 弧长（沿 -dir）
    /// 到达即 Play：队首在链起点，其余在后方错开，s_lead 前进自然滑上链
    pub fn entry_points(anchor: Vec2, dir: Vec2) -> [Vec2; 3] {
        let mut pts = [anchor; 3];
        for i in 1..3 {
            pts[i] = Vec2 {
                x: (anchor.x - dir.x * i as f64 * CHAIN_GAP).clamp(0.05, 0.95),
                y: (anchor.y - dir.y * i as f64 * CHAIN_GAP).clamp(0.05, 0.95),
            };
        }
        pts
    }

    pub fn new(anchor: Vec2, dir: Vec2) -> Self {
        let spots = Self::entry_points(anchor, dir);
        // 首段：链起点 = 球0（anchor），方向 dir，目标 = 扇区/随机（屏内）
        let target = {
            let angle = rand::random::<f64>() * std::f64::consts::PI * 2.0;
            let r = 0.25 + rand::random::<f64>() * 0.2;
            Vec2 {
                x: (anchor.x + angle.cos() * r).clamp(0.1, 0.9),
                y: (anchor.y + angle.sin() * r).clamp(0.1, 0.9),
            }
        };
        let mut pl = make_planned_leg(anchor, dir, 0, target);
        if !leg_in_bounds(&pl.leg) {
            let safe = clamp_target_in_bounds(anchor, dir, 0, target);
            pl = make_planned_leg(anchor, dir, 0, safe);
        }
        let mut chain = VecDeque::new();
        chain.push_back(pl);

        let states = [
            BallState { pos: spots[0], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED },
            BallState { pos: spots[1], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED },
            BallState { pos: spots[2], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED },
        ];

        let mut p = Player {
            chain,
            s_lead: 0.0,
            states,
            gaps: [0.0, CHAIN_GAP, 2.0 * CHAIN_GAP],
            order: ORDERS[0],
        };
        p.ensure_chain();
        p
    }

    pub fn tick(&mut self, dt: f64) {
        let dt_s = dt / 1000.0;
        // 队首弧长推进（沿当前段速率）
        let seg = self.chain.front().expect("chain non-empty");
        self.s_lead += WORLD_SPEED * TEMPLATES[seg.template_idx].speed() * dt_s;
        self.ensure_chain();

        let k = SPRING.stiffness;
        let c_damp = SPRING.damping * 2.0 * k.sqrt();
        let rate_lerp = (dt_s / 0.15).min(1.0);

        for s in 0..3 {
            // 球 i 弧长 = 队首 - 错开；未上链（<0）→ 目标 = 起点
            let s_i = self.s_lead - self.gaps[s];
            let (target, tan) = if s_i >= 0.0 {
                self.chain_pos_and_tangent(s_i)
            } else {
                // 链起点后方：沿反向切线延伸（起点 = entry point，静止等待上链）
                let start = Self::entry_points(
                    self.chain.front().map(|x| x.leg.from).unwrap_or(Vec2 { x: 0.5, y: 0.5 }),
                    Vec2 { x: 1.0, y: 0.0 },
                )[s];
                // 反推初始方向（近似：链首段切线方向）
                let leg0 = &self.chain.front().unwrap().leg;
                let d = dir_of(leg0.from, leg0.target);
                let pos = Vec2 {
                    x: (leg0.from.x - d.x * self.gaps[s]).clamp(0.05, 0.95),
                    y: (leg0.from.y - d.y * self.gaps[s]).clamp(0.05, 0.95),
                };
                let _ = start;
                (pos, Vec2 { x: -d.y, y: d.x })
            };

            let seg = self
                .chain
                .front()
                .map(|x| x.template_idx)
                .unwrap_or(0);
            let r_ideal = WORLD_SPEED * TEMPLATES[seg].speed();
            let st = &mut self.states[s];
            st.rate += (r_ideal - st.rate) * rate_lerp;
            let tl = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            let tvel = Vec2 { x: tan.x / tl * st.rate, y: tan.y / tl * st.rate };
            let ax = k * (target.x - st.pos.x) + c_damp * (tvel.x - st.vel.x);
            let ay = k * (target.y - st.pos.y) + c_damp * (tvel.y - st.vel.y);
            st.vel.x += ax * dt_s;
            st.vel.y += ay * dt_s;
            st.pos.x = (st.pos.x + st.vel.x * dt_s).clamp(0.0, 1.0);
            st.pos.y = (st.pos.y + st.vel.y * dt_s).clamp(0.0, 1.0);
        }
    }

    /// 链增长：总弧长保持 ≥ s_lead + 余量（无限轨迹）
    fn ensure_chain(&mut self) {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let need = self.s_lead + CHAIN_GAP * 3.0 + 0.5;
        while self.chain.iter().map(|x| x.arc).sum::<f64>() < need {
            let tail = self.chain.back().expect("chain non-empty");
            let from = tail.leg.target;
            let dir = if tail.leg.from == tail.leg.target {
                Vec2 { x: 1.0, y: 0.0 }
            } else {
                let tan = bezier_tangent(tail.leg.from, tail.leg.ctrl, tail.leg.target, 1.0);
                let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
                Vec2 { x: tan.x / l, y: tan.y / l }
            };
            let roll = rng.gen::<f64>();
            let template_idx = if roll < PROB.switch_template {
                rng.gen_range(0..TEMPLATES.len())
            } else {
                tail.template_idx
            };
            if rng.gen::<f64>() < PROB.switch_order {
                let next = ORDERS[rng.gen_range(0..ORDERS.len())];
                if next != self.order {
                    self.order = next;
                }
            }
            // 目标：沿链继续（保持前进方向为主 + 模板曲率）
            let dist = 0.3 + rng.gen::<f64>() * 0.3;
            let mut target = Vec2 {
                x: from.x + dir.x * dist,
                y: from.y + dir.y * dist,
            };
            // 目标出界则转向（保持链在屏内）
            if !(0.05..=0.95).contains(&target.x) || !(0.05..=0.95).contains(&target.y) {
                // 反向偏转
                let angle = rng.gen::<f64>() * std::f64::consts::PI;
                target = Vec2 {
                    x: (from.x + (dir.x * angle.cos() - dir.y * angle.sin()) * dist * 0.7).clamp(0.05, 0.95),
                    y: (from.y + (dir.x * angle.sin() + dir.y * angle.cos()) * dist * 0.7).clamp(0.05, 0.95),
                };
            }
            let mut pl = make_planned_leg(from, dir, template_idx, target);
            if !leg_in_bounds(&pl.leg) {
                let safe = clamp_target_in_bounds(from, dir, template_idx, target);
                pl = make_planned_leg(from, dir, template_idx, safe);
            }
            self.chain.push_back(clamp_dur_to_chain(pl, tail.dur_ms));
        }
    }

    /// 链上弧长 s 处的位置 + 切线
    fn chain_pos_and_tangent(&self, s: f64) -> (Vec2, Vec2) {
        let mut acc = 0.0;
        for pl in &self.chain {
            if acc + pl.arc >= s {
                let u = ((s - acc) / pl.arc.max(1e-9)).clamp(0.0, 1.0);
                let leg = &pl.leg;
                let p = quad_bezier(leg.from, leg.ctrl, leg.target, u);
                let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, u);
                let n = normal_of(tan);
                let wave = TEMPLATES[pl.template_idx].wave;
                let wobble = wave * (u * std::f64::consts::PI * 2.0).sin();
                let pos = Vec2 {
                    x: (p.x + n.x * wobble).clamp(0.0, 1.0),
                    y: (p.y + n.y * wobble).clamp(0.0, 1.0),
                };
                return (pos, tan);
            }
            acc += pl.arc;
        }
        // 超出链尾：用链尾
        let last = self.chain.back().expect("chain non-empty");
        (last.leg.target, Vec2 { x: 1.0, y: 0.0 })
    }

    /// 球位：spring 物理状态 + 法线分离量
    pub fn world_pos(&self, color_slot: usize, offset: f64) -> Vec2 {
        let st = &self.states[color_slot];
        let s_i = self.s_lead - self.gaps[color_slot];
        let n = if s_i >= 0.0 {
            let (_, tan) = self.chain_pos_and_tangent(s_i);
            normal_of(tan)
        } else {
            let leg0 = &self.chain.front().unwrap().leg;
            let d = dir_of(leg0.from, leg0.target);
            Vec2 { x: -d.y, y: d.x }
        };
        Vec2 {
            x: (st.pos.x + n.x * offset * WANDER.offset_range).clamp(0.0, 1.0),
            y: (st.pos.y + n.y * offset * WANDER.offset_range).clamp(0.0, 1.0),
        }
    }

    pub fn template_idx(&self, _color_slot: usize) -> usize {
        self.chain.front().map(|x| x.template_idx).unwrap_or(0)
    }

    /// 调试：当前目标（球 i 链上位置）
    pub fn target_of(&self, color_slot: usize) -> Vec2 {
        let s_i = self.s_lead - self.gaps[color_slot];
        if s_i >= 0.0 {
            self.chain_pos_and_tangent(s_i).0
        } else {
            let leg0 = &self.chain.front().unwrap().leg;
            let d = dir_of(leg0.from, leg0.target);
            Vec2 {
                x: (leg0.from.x - d.x * self.gaps[color_slot]).clamp(0.0, 1.0),
                y: (leg0.from.y - d.y * self.gaps[color_slot]).clamp(0.0, 1.0),
            }
        }
    }

    #[cfg(test)]
    pub fn chain_len(&self) -> usize {
        self.chain.len()
    }
}

/// 造段（几何纯函数）：切线连续 + 时长挂钩路径长度
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
    let leg = Leg { from, ctrl, target };
    let arc = ((ctrl.x - from.x).powi(2) + (ctrl.y - from.y).powi(2)).sqrt()
        + ((target.x - ctrl.x).powi(2) + (target.y - ctrl.y).powi(2)).sqrt();
    PlannedLeg {
        leg,
        template_idx,
        dur_ms: leg_duration_ms(&leg, template),
        arc,
    }
}

fn leg_duration_ms(leg: &Leg, template: &crate::config::templates::Template) -> f64 {
    let bend = ((leg.ctrl.x - leg.from.x).powi(2) + (leg.ctrl.y - leg.from.y).powi(2)).sqrt()
        + ((leg.target.x - leg.ctrl.x).powi(2) + (leg.target.y - leg.ctrl.y).powi(2)).sqrt();
    (bend / (WORLD_SPEED * template.speed()) * 1000.0).max(200.0)
}

fn dir_of(from: Vec2, to: Vec2) -> Vec2 {
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    let l = (dx * dx + dy * dy).sqrt().max(1e-9);
    Vec2 { x: dx / l, y: dy / l }
}

pub fn leg_in_bounds(leg: &Leg) -> bool {
    in_unit(leg.from) && in_unit(leg.ctrl) && in_unit(leg.target)
}

fn in_unit(p: Vec2) -> bool {
    p.x >= -1e-6 && p.x <= 1.0 + 1e-6 && p.y >= -1e-6 && p.y <= 1.0 + 1e-6
}

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

fn clamp_dur_to_chain(mut pl: PlannedLeg, tail_dur: f64) -> PlannedLeg {
    let ratio = pl.dur_ms / tail_dur.max(1.0);
    if ratio > crate::config::params::MAX_DUR_RATIO {
        pl.dur_ms = tail_dur * crate::config::params::MAX_DUR_RATIO;
    } else if ratio < 1.0 / crate::config::params::MAX_DUR_RATIO {
        pl.dur_ms = tail_dur / crate::config::params::MAX_DUR_RATIO;
    }
    pl
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
    fn duration_scales_with_path_length() {
        let from = Vec2 { x: 0.1, y: 0.5 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let short = make_planned_leg(from, dir, 0, Vec2 { x: 0.3, y: 0.5 });
        let long = make_planned_leg(from, dir, 0, Vec2 { x: 0.95, y: 0.5 });
        assert!(long.dur_ms > short.dur_ms * 2.0);
    }
}
