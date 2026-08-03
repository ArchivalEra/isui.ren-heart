// 规划器 + 执行器（纯 Rust，可单测）
// 共享路径链模型：三个小孩一个接一个跑
// - 共享链：legs 为连续路径段队列（段间 from=上段 target）
// - 独立游标：每球 Cursor{idx, t} 沿链推进（队首先进新段，队尾还在旧段）
// - 入场：汇合链（spots[2]→spots[1]→spots[0]）+ 正式链，零跳变
use crate::config::params::*;
use crate::config::templates::TEMPLATES;
use crate::sim::math::*;

/// 段端点速度（归一化）：非零 → 段间不停顿、不突跳
const SEG_END_SPEED: f64 = 0.4;
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

/// 每球游标（沿共享链）
#[derive(Clone, Copy)]
struct Cursor {
    idx: usize,
    t: f64,
}

/// 执行器：共享链 + 三球独立游标
pub struct Player {
    legs: VecDeque<PlannedLeg>,
    curs: [Cursor; 3],
    pub order: [usize; 3],
}

impl Player {
    /// 汇合链：spots[2]→spots[1]→spots[0] 排队入场，然后正式链
    pub fn new(spots: [Vec2; 3]) -> Self {
        // 汇合段（队尾→队首，直线）
        let mut legs: VecDeque<PlannedLeg> = VecDeque::new();
        for i in (1..3).rev() {
            let dir = dir_of(spots[i], spots[i - 1]);
            legs.push_back(make_planned_leg(spots[i], dir, 0, spots[i - 1]));
        }
        // 正式首段：从 spots[0] 出发（队首先跑）
        let others = [spots[1], spots[2]];
        let target0 = random_target_apart(&others, MIN_BALL_DIST);
        let dir0 = dir_of(spots[0], target0);
        let mut leg0 = make_planned_leg(spots[0], dir0, 0, target0);
        if !leg_in_bounds(&leg0.leg) {
            let safe = clamp_target_in_bounds(spots[0], dir0, 0, target0);
            leg0 = make_planned_leg(spots[0], dir0, 0, safe);
        }
        legs.push_back(leg0);

        // 游标：球 i 站在汇合链对应位置（球2 最前 idx0，球1 idx1，球0 idx2）
        let curs = [
            Cursor { idx: 2, t: 0.0 }, // 球0（队首）在 spots[0]
            Cursor { idx: 1, t: 0.0 }, // 球1 在 spots[1]
            Cursor { idx: 0, t: 0.0 }, // 球2 在 spots[2]
        ];

        let mut p = Player { legs, curs, order: ORDERS[0] };
        p.ensure_chain();
        p
    }

    pub fn tick(&mut self, dt: f64) {
        for c in self.curs.iter_mut() {
            let dur = self
                .legs
                .get(c.idx)
                .map(|pl| pl.dur_ms)
                .unwrap_or(1000.0);
            c.t += dt / dur;
            while c.t >= 1.0 {
                if c.idx + 1 < self.legs.len() {
                    c.idx += 1;
                    c.t = 0.0;
                } else {
                    c.t = 1.0;
                    break;
                }
            }
        }
        self.ensure_chain();
    }

    /// 链增长：保证每球至少 3 段余量（无限轨迹）
    fn ensure_chain(&mut self) {
        let max_idx = self.curs.iter().map(|c| c.idx).max().unwrap_or(0);
        while self.legs.len() < max_idx + 4 {
            self.plan_next();
        }
    }

    /// 共享链规划下一段（from = 链尾 target，切线继承）
    fn plan_next(&mut self) {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        let tail = self.legs.back().expect("chain non-empty");
        let from = tail.leg.target;
        let dir = if tail.leg.from == tail.leg.target {
            Vec2 { x: 1.0, y: 0.0 }
        } else {
            let tan = bezier_tangent(tail.leg.from, tail.leg.ctrl, tail.leg.target, 1.0);
            let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            Vec2 { x: tan.x / l, y: tan.y / l }
        };

        // 商量：与其它球当前目标保持距离
        let others = [self.curs[1].idx, self.curs[2].idx]
            .map(|idx| self.legs.get(idx).map(|pl| pl.leg.target).unwrap_or(from));

        // 模板（随机换 / 保留链尾模板）
        let roll = rng.gen::<f64>();
        let template_idx = if roll < PROB.switch_template {
            rng.gen_range(0..TEMPLATES.len())
        } else {
            tail.template_idx
        };

        // 排列（渲染顺序）概率轮换
        if rng.gen::<f64>() < PROB.switch_order {
            let next = ORDERS[rng.gen_range(0..ORDERS.len())];
            if next != self.order {
                self.order = next;
            }
        }

        // 重试生成合法段（控制点屏内保切线连续）
        for _ in 0..8 {
            let target = random_target_apart(&others, MIN_BALL_DIST);
            let pl = make_planned_leg(from, dir, template_idx, target);
            if leg_in_bounds(&pl.leg) {
                self.legs.push_back(pl);
                return;
            }
        }
        let target = random_target_apart(&others, MIN_BALL_DIST);
        let safe = clamp_target_in_bounds(from, dir, template_idx, target);
        self.legs.push_back(make_planned_leg(from, dir, template_idx, safe));
    }

    /// 球位：链上游标位置（t<0 不发生；t 平滑）
    pub fn world_pos(&self, color_slot: usize, offset: f64) -> Vec2 {
        let c = self.curs[color_slot];
        let pl = self.legs.get(c.idx).expect("cursor idx in chain");
        let te = smooth_velocity(c.t, SEG_END_SPEED);
        let leg = &pl.leg;
        let p = quad_bezier(leg.from, leg.ctrl, leg.target, te);
        let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, te);
        let n = normal_of(tan);
        let off = offset * WANDER.offset_range;
        Vec2 {
            x: (p.x + n.x * off).clamp(0.0, 1.0),
            y: (p.y + n.y * off).clamp(0.0, 1.0),
        }
    }

    pub fn template_idx(&self, color_slot: usize) -> usize {
        self.legs
            .get(self.curs[color_slot].idx)
            .map(|pl| pl.template_idx)
            .unwrap_or(0)
    }

    /// 调试：当前目标
    pub fn target_of(&self, color_slot: usize) -> Vec2 {
        self.legs
            .get(self.curs[color_slot].idx)
            .map(|pl| pl.leg.target)
            .unwrap_or(Vec2 { x: 0.5, y: 0.5 })
    }

    /// 游标索引（测试/调试：确认一个接一个）
    #[cfg(test)]
    pub fn cursor_idx(&self, color_slot: usize) -> usize {
        self.curs[color_slot].idx
    }
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
    /// 到达点等待（三球静止在各自到达点，零跳变进入 Play）
    Queue { t: f64, spots: [Vec2; 3] },
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
    fn one_behind_another() {
        // 三个小孩一个接一个：队首游标 ≥ 队尾（且队首先进入下一段）
        let spots = [
            Vec2 { x: 0.2, y: 0.3 },
            Vec2 { x: 0.5, y: 0.6 },
            Vec2 { x: 0.8, y: 0.4 },
        ];
        let mut p = Player::new(spots);
        for _ in 0..60 * 30 {
            p.tick(16.7);
        }
        let i0 = p.cursor_idx(0);
        let i1 = p.cursor_idx(1);
        let i2 = p.cursor_idx(2);
        assert!(i0 >= i1 && i1 >= i2, "队首应先走: {i0} {i1} {i2}");
        // 队首领先队尾至少一段（真正的一个接一个）
        assert!(i0 > i2, "球0 应领先球2 至少一段: {i0} vs {i2}");
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
    fn duration_scales_with_path_length() {
        let from = Vec2 { x: 0.1, y: 0.5 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let short = make_planned_leg(from, dir, 0, Vec2 { x: 0.3, y: 0.5 });
        let long = make_planned_leg(from, dir, 0, Vec2 { x: 0.95, y: 0.5 });
        assert!(long.dur_ms > short.dur_ms * 2.0, "长路径应显著更久: short={} long={}", short.dur_ms, long.dur_ms);
    }
}
