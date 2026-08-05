// ═══════════════════════════════════════════════════════════════════
// 回家动画预渲染（HOME ANIM PRERENDER）—— Gemini 可操作模块
// ═══════════════════════════════════════════════════════════════════
//
// 【这是什么】
//   回家 = 预渲染动画：三球触发回家时一次性生成「当前位置 → 锚点」的
//   Bézier 路径（时间对齐——同时到家），播放期间只查表（O(1)/帧）。
//   Gemini 改回家弧线（弧度/时长/缓动）只动本文件，不碰 planner/state。
//   （链段化回家 plan_home_legs/HomeCtx 已退役——被预渲染取代）
//
// 【契约】（测试 home_anim_contract 强制执行）
//   1. plan_home_anim(starts, anchors)：每球一条二次 Bézier
//      （from → ctrl → anchor）；ctrl = 中点 + 法线偏移×性格弧度
//      （PERSONALITIES[s].curv_bias——爱大弯的球弧度大——个性保留）；
//      ctrl clamp 屏内 0.04-0.96
//   2. dur_ms = HOME_ANIM_MS（params.rs——三球相同——同时到家）
//   3. sample(t_ms)：每球 quad_bezier(from, ctrl, anchor, ease(t/dur))，
//      ease = smoothstep（起止速度 0——温和）；t 超 dur 时 clamp 1（到家）
//   4. sample(0) = starts；sample(dur_ms) = anchors（同时到家——精确）
//   5. 路径采样切线连续（无折角——拖尾无感叹号）
//
// 【如何修改】
//   1. 改 plan_home_anim / sample
//   2. 跑 cargo test home_anim（契约校验）
//   3. cd web-ui && ./build.sh && python3 serve.py 8080 → 强刷目测
// ═══════════════════════════════════════════════════════════════════

use crate::config::params::*;
use crate::sim::math::{normal_of, quad_bezier, smoothstep, Vec2};

/// 单球回家路径（二次 Bézier：from → ctrl → anchor）
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct HomePath {
    /// 起点（触发回家时的球位置）
    pub from: Vec2,
    /// 控制点（中点 + 法线偏移×性格弧度——clamp 屏内）
    pub ctrl: Vec2,
    /// 锚点（回家目标——精确命中）
    pub anchor: Vec2,
}

/// 回家动画（预渲染——三球时间对齐）
#[derive(Clone, Debug)]
pub struct HomeAnim {
    /// 每球一条 Bézier 路径（from → ctrl → anchor）
    pub paths: [HomePath; 3],
    /// 动画时长（ms——三球相同——同时到家）
    pub dur_ms: f64,
}

/// 生成回家动画（纯函数——Gemini 可操作：弧线形状/时长/缓动）
/// - ctrl = 中点 + 法线偏移×性格弧度（PERSONALITIES[s].curv_bias——
///   爱大弯的球弧度大——个性保留）
/// - dur_ms = HOME_ANIM_MS（params.rs——三球相同——同时到家）
pub fn plan_home_anim(starts: [Vec2; 3], anchors: [Vec2; 3]) -> HomeAnim {
    let mut paths = [HomePath { from: starts[0], ctrl: starts[0], anchor: anchors[0] }; 3];
    for s in 0..3 {
        let from = starts[s];
        let anchor = anchors[s];
        // 中点
        let mid = Vec2 {
            x: from.x * 0.5 + anchor.x * 0.5,
            y: from.y * 0.5 + anchor.y * 0.5,
        };
        // 法线 = 从 from 到 anchor 方向的法线
        let d = Vec2 { x: anchor.x - from.x, y: anchor.y - from.y };
        let n = normal_of(d);
        // 偏移量 × 性格弧度（curv_bias 大 → 弯大）
        let offset = 0.25 * (1.0 + PERSONALITIES[s].curv_bias);
        // ctrl = 中点 + 法线偏移，clamp 屏内 0.04-0.96
        let ctrl = Vec2 {
            x: (mid.x + n.x * offset).clamp(0.04, 0.96),
            y: (mid.y + n.y * offset).clamp(0.04, 0.96),
        };
        paths[s] = HomePath { from, ctrl, anchor };
    }
    HomeAnim { paths, dur_ms: HOME_ANIM_MS }
}

impl HomeAnim {
    /// 播放采样（O(1)/帧——每球一次 quad_bezier）
    /// 缓动：smoothstep(t/dur)（起止速度 0——温和）；
    /// t 超 dur 时 clamp 1（到家——sample(dur) = anchors 精确）
    pub fn sample(&self, t_ms: f64) -> [Vec2; 3] {
        let u = (t_ms / self.dur_ms).clamp(0.0, 1.0);
        let e = smoothstep(u);
        let mut out = [self.paths[0].from; 3];
        for s in 0..3 {
            let p = &self.paths[s];
            out[s] = quad_bezier(p.from, p.ctrl, p.anchor, e);
        }
        out
    }
}

// ─────────────────────────── 测试 ───────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn v(x: f64, y: f64) -> Vec2 {
        Vec2 { x, y }
    }

    fn vec_len(a: Vec2) -> f64 {
        (a.x * a.x + a.y * a.y).sqrt()
    }

    /// 两向量夹角（度）——路径采样切线连续性用
    fn angle_deg(a: Vec2, b: Vec2) -> f64 {
        let c = ((a.x * b.x + a.y * b.y) / (vec_len(a).max(1e-12) * vec_len(b).max(1e-12)))
            .clamp(-1.0, 1.0);
        c.acos() * 180.0 / std::f64::consts::PI
    }

    /// 回家动画契约：同时到家（精确）/ 中间点屏内 / 切线连续 / 起止速度 ≈ 0
    #[test]
    fn home_anim_contract() {
        let starts = [v(0.15, 0.20), v(0.82, 0.16), v(0.10, 0.84)];
        let anchors = [v(0.55, 0.35), v(0.47, 0.38), v(0.52, 0.47)];
        let anim = plan_home_anim(starts, anchors);

        // ① sample(0) = starts（精确）
        let s0 = anim.sample(0.0);
        for s in 0..3 {
            assert!(
                (s0[s].x - starts[s].x).abs() < 1e-12 && (s0[s].y - starts[s].y).abs() < 1e-12,
                "t=0 应精确等于起点（球 {}）",
                s
            );
        }

        // ② sample(dur_ms) = anchors（同时到家——精确）
        let sd = anim.sample(anim.dur_ms);
        for s in 0..3 {
            assert!(
                (sd[s].x - anchors[s].x).abs() < 1e-12 && (sd[s].y - anchors[s].y).abs() < 1e-12,
                "t=dur 应精确命中锚点（球 {}）——同时到家",
                s
            );
        }

        // ③ 中间点屏内（t = dur/2）
        let mid = anim.sample(anim.dur_ms * 0.5);
        for s in 0..3 {
            let p = mid[s];
            assert!(
                (0.0..=1.0).contains(&p.x) && (0.0..=1.0).contains(&p.y),
                "中途点应屏内（球 {}）：{:?}",
                s, p
            );
        }

        // ④ 路径采样切线连续（相邻采样夹角 < 20°——无折角）
        let steps = 200;
        let mut prev = anim.sample(0.0);
        let mut prev_d = [Vec2 { x: 0.0, y: 0.0 }; 3];
        let mut seen = [false; 3];
        for k in 1..=steps {
            let cur = anim.sample(anim.dur_ms * k as f64 / steps as f64);
            for s in 0..3 {
                let d = Vec2 { x: cur[s].x - prev[s].x, y: cur[s].y - prev[s].y };
                if seen[s] {
                    let ang = angle_deg(prev_d[s], d);
                    assert!(
                        ang < 20.0,
                        "球 {} 采样切线夹角 {:.2}° ≥ 20°（无折角，k={}）",
                        s, ang, k
                    );
                }
                prev_d[s] = d;
                seen[s] = true;
            }
            prev = cur;
        }

        // ⑤ 起止速度 ≈ 0（一帧当量位移 < 0.01）
        let dt = 1000.0 / 60.0; // 一帧当量（ms）
        let a0 = anim.sample(0.0);
        let a1 = anim.sample(dt);
        for s in 0..3 {
            let d = Vec2 { x: a1[s].x - a0[s].x, y: a1[s].y - a0[s].y };
            assert!(vec_len(d) < 0.01, "起点速度应 ≈ 0（球 {}）：{:.6}", s, vec_len(d));
        }
        let b1 = anim.sample(anim.dur_ms - dt);
        let b2 = anim.sample(anim.dur_ms);
        for s in 0..3 {
            let d = Vec2 { x: b2[s].x - b1[s].x, y: b2[s].y - b1[s].y };
            assert!(vec_len(d) < 0.01, "终点速度应 ≈ 0（球 {}）：{:.6}", s, vec_len(d));
        }
    }

    /// 性格弧度差异可观测：curv_bias 大的球 ctrl 偏移大
    /// （三球同起点同终点——差异仅来自 PERSONALITIES[s].curv_bias）
    #[test]
    fn personality_curvature_observable() {
        let starts = [v(0.2, 0.3); 3];
        let anchors = [v(0.6, 0.7); 3];
        let anim = plan_home_anim(starts, anchors);
        let mid = v(0.4, 0.5);
        let ctrl_dist = |s: usize| {
            vec_len(Vec2 {
                x: anim.paths[s].ctrl.x - mid.x,
                y: anim.paths[s].ctrl.y - mid.y,
            })
        };
        let (dp, db, dg) = (ctrl_dist(0), ctrl_dist(1), ctrl_dist(2));
        // 理论偏移 = 0.25×(1+curv_bias)：粉 0.0 → 0.25 / 蓝 0.45 → 0.3625 / 绿 -0.35 → 0.1625
        assert!(db > dp, "蓝（curv_bias 0.45）偏移应大于粉（0.0）：{:.4} vs {:.4}", db, dp);
        assert!(dp > dg, "粉（curv_bias 0.0）偏移应大于绿（-0.35）：{:.4} vs {:.4}", dp, dg);
        assert!(db - dg > 0.05, "弧度差异应可观测：{:.4} vs {:.4}", db, dg);
    }
}
