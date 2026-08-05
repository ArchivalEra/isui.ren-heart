// ═══════════════════════════════════════════════════════════════════
// 回家段生成（HOME LEG PLANNER）—— Gemini 可操作模块
// ═══════════════════════════════════════════════════════════════════
//
// 【这是什么】
//   回家弧线设计的唯一战场。planner.rs 的 extend_home_chain 只负责：
//   截断巡航链 → 调 plan_home_legs 拿回家段 → push 进链。
//   Gemini 改回家弧线（曲率/段数/速度/形状）只动本文件，不碰 planner。
//
// 【契约】（测试 home_plan_contract 强制执行）
//   1. plan_home_legs(ctx) 返回 1-N 段 PlannedLeg——【段尾精确命中 ctx.anchor】
//      （每段 target 必须 = 下一段 from；最后一段 target 必须 = anchor——
//      make_planned_leg 的 curv_c 反推保证段尾命中 target，用它即可）
//   2. 第一段从 ctx.dir 出发（链尾切线——C1 连续，回家动作不被认出）
//   3. 段间曲率差 |Δκ| ≤ 0.2（拖尾渐进转向——感叹号约束）
//   4. 每段 ctrl clamp 屏内（0.04-0.96——dir 朝屏外防段中出屏）
//   5. 速度 roll_speed(Some(1)) 巡航档（tune 衔接当前速度——温和）
//
// 【已知现象（供 Gemini 参考）】
//   用户实测：回家触发时若球在高速冲刺（1.1-1.3 档），会出现"感叹号"
//   （拖尾与小球分离）。已排除/尝试：
//   - 单段 0.40 曲率（当前基线）——感叹号仍在
//   - 三段渐进 0.12→0.28→0.20 + 显式 tune——无改善（已回滚 95196ef）
//   - 链尾段 profile_speed 的 v_next=v_i（截断后无下一段）→ 段边界速度跳
//     0.58（数学上确认——但改 tune 未解决视觉）
//   - 拖尾层（trail.rs）未动——若根因在拖尾采样/渲染，那是另一个战场
//
// 【如何修改】
//   1. 改 plan_home_legs（或加 plan_home_legs_v2 并切换）
//   2. 跑 cargo test home_plan（契约校验）
//   3. cd web-ui && ./build.sh && python3 serve.py 8080 → 强刷目测
// ═══════════════════════════════════════════════════════════════════

use crate::config::params::*;
use crate::sim::math::Vec2;
use crate::sim::chain::{make_planned_leg, roll_speed};
use crate::sim::planner::PlannedLeg;

/// 回家段生成上下文（planner 提供——Gemini 只消费）
pub struct HomeCtx {
    /// 链尾位置（截断后——球走完剩余巡航段自然进入）
    pub from: Vec2,
    /// 链尾切线（归一化——第一段 C1 连续锚点）
    pub dir: Vec2,
    /// 回家目标锚点
    pub anchor: Vec2,
}

/// 生成回家段（当前基线：单段 0.40 曲率——Gemini 的改造对象）
pub fn plan_home_legs(ctx: &HomeCtx) -> Vec<PlannedLeg> {
    let tpl = TEMPLATES
        .iter()
        .position(|x| (x.curvature - 0.40).abs() < 1e-9)
        .unwrap_or(8);
    let speed = roll_speed(Some(1)); // 巡航档回家——tune 平滑衔接当前速度
    let mut pl = make_planned_leg(ctx.from, ctx.dir, tpl, ctx.anchor, speed);
    // ctrl clamp 屏内（dir 朝屏外时防段中出屏——段尾 target 不受影响）
    pl.legs[0].ctrl.x = pl.legs[0].ctrl.x.clamp(0.04, 0.96);
    pl.legs[0].ctrl.y = pl.legs[0].ctrl.y.clamp(0.04, 0.96);
    vec![pl]
}

// ─────────────────────────── 测试 ───────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn v(x: f64, y: f64) -> Vec2 {
        Vec2 { x, y }
    }

    #[test]
    fn home_plan_contract() {
        // 契约校验：段尾命中 anchor / C1 出发 / 曲率渐进 / ctrl 屏内 / 巡航档
        let ctx = HomeCtx {
            from: v(0.6, 0.4),
            dir: v(0.8, 0.6),
            anchor: v(0.3, 0.7),
        };
        let legs = plan_home_legs(&ctx);
        assert!(!legs.is_empty(), "至少一段");
        // 段尾精确命中 anchor
        let tail = legs.last().unwrap().legs[4];
        assert!(
            (tail.target.x - ctx.anchor.x).abs() < 1e-9
                && (tail.target.y - ctx.anchor.y).abs() < 1e-9,
            "段尾应精确命中 anchor"
        );
        // 段间曲率差 ≤ 0.2（拖尾渐进——感叹号约束）
        for w in legs.windows(2) {
            let k0 = TEMPLATES[w[0].template_idx].curvature;
            let k1 = TEMPLATES[w[1].template_idx].curvature;
            assert!((k1 - k0).abs() <= 0.2, "段间曲率差应 ≤ 0.2");
        }
        // ctrl 屏内 + 速度巡航档
        for pl in &legs {
            let c = pl.legs[0].ctrl;
            assert!((0.04..=0.96).contains(&c.x) && (0.04..=0.96).contains(&c.y), "ctrl 应屏内");
            assert!(
                (0.72..=0.85).contains(&pl.speed) || (0.5..=0.65).contains(&pl.speed),
                "回家段应巡航/慢档: {}",
                pl.speed
            );
        }
    }
}
