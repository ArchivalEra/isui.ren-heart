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

#[derive(Clone)]
pub struct PlannedLeg {
    pub leg: Leg,
    pub template_idx: usize,
    /// 段级速度倍率（独立于曲线，来自 SPEED_BANDS）
    pub speed: f64,
    /// 段级摆动幅度（独立于曲线，来自 WAVE_BANDS）
    pub wave: f64,
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
    pub order: [usize; 3],
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

    /// Free 专用：指定球 color_slot 从 anchor 出发（其他球位置无用——Free 每球独立链）
    /// 解散/入场时保证球从当前位置无缝续跑（Player::new 会把非队首球放到后方 → 闪现）
    pub fn new_at(anchor: Vec2, dir: Vec2, color_slot: usize) -> Self {
        let mut p = Self::new(anchor, dir);
        p.states[color_slot.min(2)] = BallState {
            pos: anchor,
            vel: Vec2 { x: 0.0, y: 0.0 },
            rate: WORLD_SPEED,
        };
        p
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
        let wave = roll_wave();
        let mut pl = make_planned_leg(anchor, dir, 0, target, speed, wave);
        if !leg_in_bounds(&pl.leg) {
            let safe = clamp_target_in_bounds(anchor, dir, 0, target, speed, wave);
            pl = make_planned_leg(anchor, dir, 0, safe, speed, wave);
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
        // 队首弧长推进：速度 profile（段内温和加速/减速，段间连续——预渲染衔接）
        let (_, _, seg0, u0) = self.chain_pos_and_tangent(self.s_lead);
        self.s_lead += self.profile_speed(seg0, u0) * dt_s;
        self.ensure_chain();

        let k = SPRING.stiffness;
        let c_damp = SPRING.damping * 2.0 * k.sqrt();
        let rate_lerp = (dt_s / 0.12).min(1.0);

        for s in 0..3 {
            // 球 i 弧长 = 队首 - 错开；未上链（<0）→ 目标 = 起点（链起点后方）
            let s_i = self.s_lead - self.gaps[s];
            let (target, tan, seg_i, u_i) = if s_i >= 0.0 {
                self.chain_pos_and_tangent(s_i)
            } else {
                let leg0 = &self.chain.front().unwrap().leg;
                let d = dir_of(leg0.from, leg0.target);
                let pos = Vec2 {
                    x: (leg0.from.x - d.x * self.gaps[s]).clamp(0.05, 0.95),
                    y: (leg0.from.y - d.y * self.gaps[s]).clamp(0.05, 0.95),
                };
                (pos, Vec2 { x: -d.y, y: d.x }, 0usize, 0.0)
            };

            let r_ideal = self.profile_speed(seg_i, u_i);
            let st = &mut self.states[s];
            st.rate += (r_ideal - st.rate) * rate_lerp;
            let tl = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            let tvel = Vec2 { x: tan.x / tl * st.rate, y: tan.y / tl * st.rate };
            let ax = k * (target.x - st.pos.x) + c_damp * (tvel.x - st.vel.x);
            let ay = k * (target.y - st.pos.y) + c_damp * (tvel.y - st.vel.y);
            // 加速度钳制：spring 误差大时力无上限 → 高速冲点；clamp 后温和冲刺
            let a_mag = (ax * ax + ay * ay).sqrt();
            let (ax, ay) = if a_mag > MAX_ACCEL {
                (ax / a_mag * MAX_ACCEL, ay / a_mag * MAX_ACCEL)
            } else {
                (ax, ay)
            };
            st.vel.x += ax * dt_s;
            st.vel.y += ay * dt_s;
            st.pos.x = (st.pos.x + st.vel.x * dt_s).clamp(0.03, 0.97);
            st.pos.y = (st.pos.y + st.vel.y * dt_s).clamp(0.03, 0.97);
        }
    }

    /// 速度 profile：段内从「本段全速」温和过渡到「下段全速」，
    /// smoothstep 保证段内加速/减速平滑；段间速率连续（段尾速 = 下段头速）
    /// 巡航 = 模板全速（不再减半，去蠕动感）
    fn profile_speed(&self, seg_idx: usize, u: f64) -> f64 {
        let v_i = self.chain[seg_idx].speed;
        let v_next = match self.chain.get(seg_idx + 1) {
            Some(next) => next.speed,
            None => v_i,
        };
        let ramp = smoothstep(u.clamp(0.0, 1.0));
        WORLD_SPEED * (v_i + (v_next - v_i) * ramp)
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
            let old_curv = TEMPLATES[tail.template_idx].curvature;
            // 曲线选择：曲率连续性（形状只管几何）
            let template_idx = if roll < PROB.switch_template {
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
            // 段级运动参数：速度档（含高速批准制）+ 摆动档（独立于曲线）
            let speed = roll_speed();
            let wave = roll_wave();
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
            if !(0.1..=0.9).contains(&target.x) || !(0.1..=0.9).contains(&target.y) {
                // 反向偏转
                let angle = rng.gen::<f64>() * std::f64::consts::PI;
                target = Vec2 {
                    x: (from.x + (dir.x * angle.cos() - dir.y * angle.sin()) * dist * 0.7).clamp(0.05, 0.95),
                    y: (from.y + (dir.x * angle.sin() + dir.y * angle.cos()) * dist * 0.7).clamp(0.05, 0.95),
                };
            }
            let mut pl = make_planned_leg(from, dir, template_idx, target, speed, wave);
            if !leg_in_bounds(&pl.leg) {
                let safe = clamp_target_in_bounds(from, dir, template_idx, target, speed, wave);
                pl = make_planned_leg(from, dir, template_idx, safe, speed, wave);
            }
            if pl.arc < 0.05 {
                // 死循环防护：零长度段（收缩失败）强制拉一段，仍失败则放弃补段
                let forced = Vec2 {
                    x: (from.x + dir.x * 0.3).clamp(0.10, 0.90),
                    y: (from.y + dir.y * 0.3).clamp(0.10, 0.90),
                };
                pl = make_planned_leg(from, dir, template_idx, forced, speed, wave);
                if pl.arc < 0.05 || !leg_in_bounds(&pl.leg) {
                    break;
                }
            }
            self.chain.push_back(clamp_dur_to_chain(pl, tail.dur_ms));
        }
    }

    /// 链上弧长 s 处：位置 + 切线 + 段索引 + 段内 u（速度 profile 用）
    fn chain_pos_and_tangent(&self, s: f64) -> (Vec2, Vec2, usize, f64) {
        let mut acc = 0.0;
        for (idx, pl) in self.chain.iter().enumerate() {
            if acc + pl.arc >= s {
                let u = ((s - acc) / pl.arc.max(1e-9)).clamp(0.0, 1.0);
                let leg = &pl.leg;
                let p = quad_bezier(leg.from, leg.ctrl, leg.target, u);
                let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, u);
                let n = normal_of(tan);
                let wobble = pl.wave * (u * std::f64::consts::PI * 2.0).sin();
                // wobble 硬限制：摆动后位置永不越过 [0.03, 0.97]
                // （配合链几何安全区 [0.08,0.92]，物理上不可能出屏/贴边）
                let wob_x = n.x * wobble;
                let wob_y = n.y * wobble;
                let pos = Vec2 {
                    x: if wob_x >= 0.0 { (p.x + wob_x).min(0.97) } else { (p.x + wob_x).max(0.03) },
                    y: if wob_y >= 0.0 { (p.y + wob_y).min(0.97) } else { (p.y + wob_y).max(0.03) },
                };
                return (pos, tan, idx, u);
            }
            acc += pl.arc;
        }
        // 超出链尾：用链尾
        let last = self.chain.back().expect("chain non-empty");
        (last.leg.target, Vec2 { x: 1.0, y: 0.0 }, self.chain.len() - 1, 1.0)
    }

    /// 球位：spring 物理状态 + 法线分离量
    pub fn world_pos(&self, color_slot: usize, offset: f64) -> Vec2 {
        let st = &self.states[color_slot];
        let s_i = self.s_lead - self.gaps[color_slot];
        let n = if s_i >= 0.0 {
            let (_, tan, _, _) = self.chain_pos_and_tangent(s_i);
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

    /// 球 i 当前位置 + 链切线方向（解散回 Free 时用：独立链起点=位置，方向=切线）
    pub fn pos_and_dir(&self, color_slot: usize) -> (Vec2, Vec2) {
        let s_i = self.s_lead - self.gaps[color_slot];
        if s_i >= 0.0 {
            let (pos, tan, _, _) = self.chain_pos_and_tangent(s_i);
            let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            (pos, Vec2 { x: tan.x / l, y: tan.y / l })
        } else {
            let leg0 = &self.chain.front().unwrap().leg;
            let d = dir_of(leg0.from, leg0.target);
            (
                Vec2 {
                    x: (leg0.from.x - d.x * self.gaps[color_slot]).clamp(0.05, 0.95),
                    y: (leg0.from.y - d.y * self.gaps[color_slot]).clamp(0.05, 0.95),
                },
                d,
            )
        }
    }

    /// 球 i 实际中心（spring 物理位置，不含法线偏移）
    pub fn ball_center(&self, color_slot: usize) -> Vec2 {
        self.states[color_slot.min(2)].pos
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

/// 段摆动：随机档位（独立于曲线）
fn roll_wave() -> f64 {
    WAVE_BANDS[rand::random::<usize>() % WAVE_BANDS.len()]
}

/// 造段（几何纯函数）：切线连续 + 段级 speed/wave（独立于曲线模板）
pub fn make_planned_leg(
    from: Vec2,
    dir: Vec2,
    template_idx: usize,
    target: Vec2,
    speed: f64,
    wave: f64,
) -> PlannedLeg {
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
    let dur_ms = (arc / (WORLD_SPEED * speed) * 1000.0).max(200.0);
    PlannedLeg {
        leg,
        template_idx,
        speed,
        wave,
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

pub fn leg_in_bounds(leg: &Leg) -> bool {
    // 根本性出屏禁止：16 点采样（含曲线中途），全程须在安全区 [0.08, 0.92]
    // （不只端点——大 curvature 的中段侧偏可能出屏）
    const SAFE_MIN: f64 = 0.08;
    const SAFE_MAX: f64 = 0.92;
    if !(SAFE_MIN..=SAFE_MAX).contains(&leg.from.x)
        || !(SAFE_MIN..=SAFE_MAX).contains(&leg.from.y)
    {
        return false;
    }
    for i in 0..=16 {
        let u = i as f64 / 16.0;
        let p = quad_bezier(leg.from, leg.ctrl, leg.target, u);
        if !(SAFE_MIN..=SAFE_MAX).contains(&p.x) || !(SAFE_MIN..=SAFE_MAX).contains(&p.y) {
            return false;
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
    wave: f64,
) -> Vec2 {
    for _ in 0..24 {
        let pl = make_planned_leg(from, dir, template_idx, target, speed, wave);
        if leg_in_bounds(&pl.leg) {
            return target;
        }
        target = Vec2 { x: from.x + (target.x - from.x) * 0.82, y: from.y + (target.y - from.y) * 0.82 };
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
    fn make_leg_keeps_endpoints() {
        let from = Vec2 { x: 0.1, y: 0.2 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let target = Vec2 { x: 0.9, y: 0.8 };
        let pl = make_planned_leg(from, dir, 0, target, 1.0, 0.0);
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
        let short = make_planned_leg(from, dir, 0, Vec2 { x: 0.3, y: 0.5 }, 1.0, 0.0);
        let long = make_planned_leg(from, dir, 0, Vec2 { x: 0.95, y: 0.5 }, 1.0, 0.0);
        assert!(long.dur_ms > short.dur_ms * 2.0);
    }
}
