// 运动风格 Profile 深模块（架构审查候选 A）
// 一个 MotionProfile 实例 = 一种运动风格的全部决策（速度/曲率/加减速/拖尾/队形错开）。
// 换风格 = 换实例，引擎与规划器只认识 profile 接口，不再散落全局常量。
// 用法：planner/engine 里 `use crate::config::profile::NATIVE_PROFILE as P;`

/// 拖尾风格：两种形态绑定在 profile 上（小拖尾/大拖尾）
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum TrailStyle {
    /// 连续实心大拖尾：全宽 2r，一次 stroke（f525e40 手感）
    Solid { frames: usize },
    /// 小拖尾（动态模糊风）：短历史、宽度收窄、半透明渐变（尚未正式开工）
    Mini { frames: usize },
}

/// Spring 物理（谷歌大学成果，MDC-Android 官方 MotionTokens）
#[derive(Clone, Copy, Debug)]
pub struct Spring {
    pub stiffness: f64,
    pub damping: f64,
}

/// 运动风格：一种风格的全部决策
#[derive(Clone, Copy, Debug)]
pub struct MotionProfile {
    #[allow(dead_code)] // 风格名（文档价值；切换调试用）
    pub name: &'static str,
    /// 段级速度档位（独立于曲线）：慢/巡航/高速
    pub speed_bands: [(f64, f64); 3],
    /// 曲线选择池的曲率范围（|curv| ∈ [curv_min, curv_max]）——直线与大弯出局
    pub curv_min: f64,
    pub curv_max: f64,
    /// 模板切换时曲率最大变化量（连续性约束，消折角）
    pub curv_step: f64,
    /// 追踪 spring（温和加减速核心：软化 k + 临界阻尼）
    pub spring: Spring,
    /// spring 加速度上限（世界单位/s²）：任何时刻加速度有界 = 全程温和加减速
    pub max_accel: f64,
    /// 速率低通时间常数（ms）：速度变化需此量级平滑过渡（慢慢减速/加速）
    pub rate_lerp_tau_ms: f64,
    /// 链上错开弧长区间：稳定队形（蓝绿各落后约 0.18/0.38，微抖动保自然）
    /// 曾放大到 0.08-0.7（随机贴合）→ 队形散失「三个孩子一起玩」的快乐感，回滚
    pub gap_min: f64,
    pub gap_max: f64,
    /// 拖尾风格
    pub trail: TrailStyle,
    /// EulerBlend（段内曲率渐变）概率：0 = 纯自研单段贝塞尔
    pub blend_prob: f64,
}

/// 自研 profile（默认）：慢速多弯 + 单弧线 + 温和加减速 + 实心大拖尾
/// 值 = 历次迭代收敛的手感参数
pub const NATIVE_PROFILE: MotionProfile = MotionProfile {
    name: "native",
    speed_bands: [
        (0.5, 0.65),  // 慢（pixel 主基调）
        (0.72, 0.85), // 巡航
        (1.1, 1.3),   // 高速（需批准，40%）
    ],
    curv_min: 0.3,
    curv_max: 1.1,
    curv_step: 0.35,
    spring: Spring { stiffness: 350.0, damping: 1.0 },
    max_accel: 1.2,
    rate_lerp_tau_ms: 450.0,
    gap_min: 0.16,
    gap_max: 0.20,
    trail: TrailStyle::Solid { frames: 8 },
    blend_prob: 0.0,
};

/// 小拖尾变体（绑定同一套运动，只换拖尾形态）——「小拖尾大拖尾分别绑定 profile」
#[allow(dead_code)] // 备用：运行时切换可直接用它
pub const MINI_TRAIL_PROFILE: MotionProfile = MotionProfile {
    trail: TrailStyle::Mini { frames: 6 },
    ..NATIVE_PROFILE
};

/// 羊角螺线 profile（备用，未启用）：段内曲率渐变（make_blend_leg）
/// 启用 = planner 选择逻辑按 blend_prob 走 make_blend_leg
#[allow(dead_code)]
pub const EULER_PROFILE: MotionProfile = MotionProfile {
    name: "euler-blend",
    blend_prob: 1.0,
    ..NATIVE_PROFILE
};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn profile_spec_validates() {
        for p in [&NATIVE_PROFILE, &MINI_TRAIL_PROFILE, &EULER_PROFILE] {
            assert!(p.curv_min >= 0.0 && p.curv_min < p.curv_max);
            assert!(p.curv_step > 0.0);
            assert!(p.gap_min >= 0.0 && p.gap_min < p.gap_max);
            assert!(p.max_accel > 0.0);
            assert!(p.spring.stiffness > 0.0 && p.spring.damping >= 0.5);
            for (lo, hi) in p.speed_bands {
                assert!(lo < hi && lo > 0.0);
            }
        }
    }

    #[test]
    fn mini_profile_only_differs_in_trail() {
        // 小拖尾 profile 与自研 profile 只差拖尾风格（运动手感一致）
        let a = NATIVE_PROFILE;
        let b = MINI_TRAIL_PROFILE;
        assert_ne!(a.trail, b.trail);
        assert_eq!(a.speed_bands, b.speed_bands);
        assert_eq!(a.spring.stiffness, b.spring.stiffness);
    }
}
