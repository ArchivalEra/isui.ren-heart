// 规划器 + 执行器（纯 Rust，可单测）
// 三球独立轨迹：分开算（各自规划队列）、分开商量（目标去重）
use crate::config::params::*;
use crate::config::templates::TEMPLATES;
use crate::sim::math::*;
use crate::sim::target::{random_target_apart};
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

/// 单球规划队列（执行器的最小消费单位）
pub struct BallPlan {
    legs: VecDeque<PlannedLeg>,
    cur: PlannedLeg,
    t: f64,
}

impl BallPlan {
    fn new(leg: Leg, template_idx: usize) -> Self {
        let dur = TEMPLATES[template_idx].duration_ms();
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

    fn push(&mut self, leg: PlannedLeg) {
        self.legs.push_back(leg);
    }
}

/// 执行器：三球独立消费预规划曲线
pub struct Player {
    plans: [BallPlan; 3],
    now_ms: f64,
    planned_ms: [f64; 3],
    pub order: [usize; 3],
}

impl Player {
    /// 从三球到达点出发（与入场阶段完全连续：t=0 时位置 == spots）
    pub fn new(spots: [Vec2; 3]) -> Self {
        let mut targets = [Vec2 { x: 0.5, y: 0.5 }; 3];
        for i in 0..3 {
            let others = [spots[(i + 1) % 3], spots[(i + 2) % 3]];
            targets[i] = random_target_apart(&others, MIN_BALL_DIST);
        }
        let mut plans_buf: [Option<BallPlan>; 3] = [None, None, None];
        let mut planned: [f64; 3] = [0.0; 3];
        for i in 0..3 {
            // 起始方向：指向自己的首个目标（直线起步，无跳变）
            let dx = targets[i].x - spots[i].x;
            let dy = targets[i].y - spots[i].y;
            let dist = (dx * dx + dy * dy).sqrt().max(1e-6);
            let dir = Vec2 { x: dx / dist, y: dy / dist };
            let mut leg = make_planned_leg(spots[i], dir, 0, targets[i]);
            // 可行性校验：首个目标出界则收缩目标（朝起点拉回屏内）
            if !leg_in_bounds(&leg.leg, 16) {
                let safe = clamp_target_in_bounds(spots[i], targets[i]);
                leg = make_planned_leg(spots[i], dir, 0, safe);
            }
            plans_buf[i] = Some(BallPlan::new(leg.leg, 0));
            planned[i] = leg.dur_ms;
        }
        let plans = plans_buf.map(|p| p.expect("plan initialized"));
        Player { plans, now_ms: 0.0, planned_ms: planned, order: ORDERS[0] }
    }

    pub fn tick(&mut self, dt: f64) {
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
                self.plans[i].push(next);
            }
        }
    }

    /// 单球规划下一段：from=自己的终点（段间连续），目标与其它球商量（去重）
    /// 可行性校验：路径全程屏内才采纳（防止长段出界 → 球消失/闪现）
    fn plan_next(&mut self, i: usize) -> PlannedLeg {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        let cur = &self.plans[i].cur;
        let from = cur.leg.target;
        let others = [
            self.plans[(i + 1) % 3].cur.leg.target,
            self.plans[(i + 2) % 3].cur.leg.target,
        ];

        // 切线继承（段间 C1 连续）
        let tan = bezier_tangent(cur.leg.from, cur.leg.ctrl, cur.leg.target, 1.0);
        let tl = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
        let dir = Vec2 { x: tan.x / tl, y: tan.y / tl };

        // 重试生成合法段（最多 8 次；目标去重 + 路径屏内）
        for _ in 0..8 {
            let target = random_target_apart(&others, MIN_BALL_DIST);
            let roll = rng.gen::<f64>();
            let template_idx = if roll < PROB.switch_template {
                rng.gen_range(0..TEMPLATES.len())
            } else {
                cur.template_idx
            };
            let pl = make_planned_leg(from, dir, template_idx, target);
            if leg_in_bounds(&pl.leg, 16) {
                // 排列（渲染顺序）概率轮换
                if rng.gen::<f64>() < PROB.switch_order {
                    let next = ORDERS[rng.gen_range(0..ORDERS.len())];
                    if next != self.order {
                        self.order = next;
                    }
                }
                return pl;
            }
        }
        // 兜底：直飞（曲率 0 直线，几乎必在屏内）
        let target = random_target_apart(&others, MIN_BALL_DIST);
        make_planned_leg(from, dir, 0, target)
    }

    /// 球位：bezier 点 + 法线偏移（法线偏移概念单一化入口）
    pub fn world_pos(&self, color_slot: usize, offset: f64) -> Vec2 {
        let plan = &self.plans[color_slot];
        let te = smoothstep(plan.t);
        let leg = &plan.cur.leg;
        let p = quad_bezier(leg.from, leg.ctrl, leg.target, te);
        let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, te);
        let n = normal_of(tan);
        let off = offset * WANDER.offset_range;
        Vec2 { x: p.x + n.x * off, y: p.y + n.y * off }
    }

    pub fn template_idx(&self, color_slot: usize) -> usize {
        self.plans[color_slot].cur.template_idx
    }

    /// 调试：当前各球目标点
    pub fn target_of(&self, color_slot: usize) -> Vec2 {
        self.plans[color_slot].cur.leg.target
    }
}

/// 目标收缩：朝起点方向拉回，直到直线路径全程在屏内
/// （对直线段：from→target 线段在屏内 ⟺ 收缩到屏内点即可）
fn clamp_target_in_bounds(from: Vec2, target: Vec2) -> Vec2 {
    let mut t = target;
    for _ in 0..16 {
        let leg = Leg { from, ctrl: from, target: t };
        if leg_in_bounds(&leg, 8) {
            return t;
        }
        // 朝 from 收缩 15%
        t = Vec2 { x: from.x + (t.x - from.x) * 0.85, y: from.y + (t.y - from.y) * 0.85 };
    }
    from
}

/// 路径可行性：采样整段路径（含控制点弯曲），全部落在 [0,1]² 屏内
/// 长段路径可能甩出屏幕（即使 ctrl 已 clamp）→ 出界 = 球消失 = 视觉闪现
pub fn leg_in_bounds(leg: &Leg, samples: usize) -> bool {
    for i in 0..=samples {
        let t = i as f64 / samples as f64;
        let p = quad_bezier(leg.from, leg.ctrl, leg.target, t);
        if !(0.0..=1.0).contains(&p.x) || !(0.0..=1.0).contains(&p.y) {
            return false;
        }
    }
    true
}

/// 造段（Player::new 与 plan_next 共用）：切线连续 + 屏内控制点 + 时长派生
pub fn make_planned_leg(
    from: Vec2,
    dir: Vec2,
    template_idx: usize,
    target: Vec2,
) -> PlannedLeg {
    let dx = target.x - from.x;
    let dy = target.y - from.y;
    let dist = (dx * dx + dy * dy).sqrt().max(1e-6);
    let template = &TEMPLATES[template_idx];
    let norm = Vec2 { x: -dir.y, y: dir.x };
    let ctrl = Vec2 {
        x: (from.x + dir.x * (dist * 0.5) + norm.x * dist * template.curvature * 0.35)
            .clamp(0.0, 1.0),
        y: (from.y + dir.y * (dist * 0.5) + norm.y * dist * template.curvature * 0.35)
            .clamp(0.0, 1.0),
    };
    PlannedLeg {
        leg: Leg { from, ctrl, target },
        template_idx,
        dur_ms: template.duration_ms(),
    }
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
        assert!((0.0..=1.0).contains(&pl.leg.ctrl.x) && (0.0..=1.0).contains(&pl.leg.ctrl.y));
        assert!(pl.dur_ms > 0.0);
    }

    #[test]
    fn ctrl_clamped_in_screen() {
        // 极端：起点在角上、方向朝外、目标在对角 —— 控制点必须仍在屏内
        let from = Vec2 { x: 0.0, y: 0.0 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let target = Vec2 { x: 1.0, y: 1.0 };
        for tpl in 0..TEMPLATES.len() {
            let pl = make_planned_leg(from, dir, tpl, target);
            assert!((0.0..=1.0).contains(&pl.leg.ctrl.x));
            assert!((0.0..=1.0).contains(&pl.leg.ctrl.y));
        }
    }

    #[test]
    fn player_balls_start_apart_and_continuous() {
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
                (pos.x - spots[s].x).abs() < 1e-9 && (pos.y - spots[s].y).abs() < 1e-9,
                "球{s} 入场应连续: 期望 {:?} 实际 {:?}",
                spots[s],
                pos
            );
        }
        let a = p.world_pos(0, 0.0);
        let b = p.world_pos(1, 0.0);
        let c = p.world_pos(2, 0.0);
        let d_ab = ((a.x - b.x).powi(2) + (a.y - b.y).powi(2)).sqrt();
        let d_ac = ((a.x - c.x).powi(2) + (a.y - c.y).powi(2)).sqrt();
        assert!(d_ab > 1e-6, "球0/1 不应重叠");
        assert!(d_ac > 1e-6, "球0/2 不应重叠");
    }

    #[test]
    fn world_pos_stays_in_screen_after_horizon() {
        let spots = [
            Vec2 { x: 0.2, y: 0.3 },
            Vec2 { x: 0.5, y: 0.6 },
            Vec2 { x: 0.8, y: 0.4 },
        ];
        let mut p = Player::new(spots);
        // 推进 90 秒（跨多段 + 触发补规划），球位必须始终在屏内
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
    fn all_planned_legs_stay_in_screen() {
        // 属性测试：随机 spots 大量生成 Player，推进 5 分钟，所有球全程屏内
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
        // 播放 120 秒，任一段间隔 1 秒内球都应移动（无停止）
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
}
