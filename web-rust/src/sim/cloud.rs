// 云中心（谷歌大学博士课：formation centroid + Frenet 偏移）
// 核心思想：三球不各自随机规划（那会各奔东西），而是共享一条「云中心线」——
// 蓝绿的目标 = 中心线在落后弧长处的点，沿 Frenet 法线偏移 d。
// 转弯时三球走同一条曲线的偏移轨迹 → 天然同弧、无多段线（κ·d < 1 校验）。
//
// 依据（docs/google-university.md）：
// - x(s, d) = r(s*) + d·n(s*)，s* = 弧长投影（Werling Frenet 系）
// - 最近点投影成立条件 κ·d < 1；超出则偏移衰减（防跳变）
// - 云中心平滑 = EMA（Exponential Moving Average 指数移动平均）：
//   权重指数衰减、最新点权重最大——无窗口边界、天然连续
use crate::sim::math::{normal_of, Vec2};
use crate::sim::planner::{chain_pos_and_tangent, Leg};
use std::collections::VecDeque;

/// 曲率-偏移安全校验：κ·d < 1 时投影/偏移稳定（超出则必须衰减）
#[allow(dead_code)] // 工具：follower_target 内部使用 + 测试覆盖
pub fn kappa_d_safe(kappa: f64, d: f64) -> bool {
    kappa * d.abs() < 1.0
}

/// 链上弧长 s 处的曲率（|curv| 估计：切线转角 / 弧长增量）
#[allow(dead_code)] // 工具：follower_target 内部使用 + 测试覆盖
pub fn curvature_at(chain: &VecDeque<Leg5>, s: f64) -> f64 {
    let (_, tan0, _, _) = chain_pos_and_tangent(chain, s);
    let (_, tan1, _, _) = chain_pos_and_tangent(chain, s + 0.02);
    let cross = tan0.x * tan1.y - tan0.y * tan1.x;
    let dot = (tan0.x * tan1.x + tan0.y * tan1.y).clamp(-1.0, 1.0);
    (cross.abs() / (0.02 * (dot).max(1e-6))).min(10.0)
}

/// 云中心目标：中心线弧长 s 处点 + 法线偏移 d（Frenet 偏移，κ·d<1 校验）
/// 返回 (目标点, 切线)。偏移超出安全阈时自动衰减（不跳变）。
#[allow(dead_code)] // 工具：follower_target_smooth 组合使用 + 测试覆盖
pub fn follower_target(chain: &VecDeque<Leg5>, s: f64, d: f64) -> (Vec2, Vec2) {
    let (p, tan, _, _) = chain_pos_and_tangent(chain, s);
    let n = normal_of(tan);
    let kappa = curvature_at(chain, s);
    let d_eff = if kappa_d_safe(kappa, d) { d } else { d * 0.5 };
    (
        Vec2 { x: p.x + n.x * d_eff, y: p.y + n.y * d_eff },
        tan,
    )
}

/// EMA 一步（指数移动平均，时序滤波——套在云中心输出后面）：
/// ema = α·target + (1-α)·ema。α 大 = 跟手（响应快），α 小 = 更柔（滞后大）。
/// 无窗口边界、天然连续——跟随目标平滑化的标准手段。
pub fn ema_step(prev: Vec2, target: Vec2, alpha: f64) -> Vec2 {
    Vec2 {
        x: prev.x + (target.x - prev.x) * alpha,
        y: prev.y + (target.y - prev.y) * alpha,
    }
}

// 类型别名（避免循环依赖：cloud 只关心链的弧长采样接口）
pub type Leg5 = crate::sim::planner::PlannedLeg;



#[allow(dead_code)]
fn _legs_ref(pl: &Leg5) -> &[Leg; 5] {
    &pl.legs
}

#[cfg(test)]
mod tests {
    use super::*;

    fn straight_chain() -> VecDeque<Leg5> {
        // 一条直线链（从 (0.2,0.5) 到 (0.8,0.5)，2 段，ctrl = 段中点）
        let mk = |from: Vec2, target: Vec2| Leg5 {
            legs: [Leg {
                from,
                ctrl: Vec2 { x: (from.x + target.x) / 2.0, y: (from.y + target.y) / 2.0 },
                target,
            }; 5],
            template_idx: 0,
            speed: 1.0,
            curv_eff: 0.0,
            dur_ms: 1000.0,
            arc: 0.3,
        };
        let mut q = VecDeque::new();
        q.push_back(mk(Vec2 { x: 0.2, y: 0.5 }, Vec2 { x: 0.5, y: 0.5 }));
        q.push_back(mk(Vec2 { x: 0.5, y: 0.5 }, Vec2 { x: 0.8, y: 0.5 }));
        q
    }

    #[test]
    fn kappa_d_safety() {
        assert!(kappa_d_safe(1.0, 0.6));
        assert!(!kappa_d_safe(2.0, 0.6), "大曲率大偏移不安全");
    }

    #[test]
    fn follower_target_offsets_along_normal() {
        let chain = straight_chain();
        // 直线链：法线 = (0, ±1)，偏移 d 沿 y
        let (p, tan) = follower_target(&chain, 0.15, 0.05);
        // normal_of 定义：切线顺时针 90°（(1,0) → (0,-1)）——偏移朝 -y
        assert!((p.y - 0.45).abs() < 1e-6, "应沿法线偏移 -0.05: {}", p.y);
        assert!(tan.y.abs() < 1e-6, "直线切线水平");
        assert!((p.x - 0.35).abs() < 0.02, "弧长 0.15 处 x≈0.35: {}", p.x);
    }

    #[test]
    fn ema_step_converges_and_filters() {
        // 收敛：恒定目标 → ema 指数逼近
        let mut e = Vec2 { x: 0.0, y: 0.0 };
        let tgt = Vec2 { x: 1.0, y: 0.0 };
        for _ in 0..40 {
            e = ema_step(e, tgt, 0.35);
        }
        assert!((e.x - 1.0).abs() < 1e-3, "收敛到目标: {}", e.x);
        // 滤波：目标跳变 1.0 → ema 只移动 α 比例（钝点被低通）
        let after_jump = ema_step(e, Vec2 { x: 2.0, y: 0.0 }, 0.35);
        assert!((after_jump.x - 1.35).abs() < 1e-6, "一步只移 α: {}", after_jump.x);
    }
}
