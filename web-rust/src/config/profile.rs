// 运动风格 Profile（架构候选 A 落地——轻量版）
// 一种风格 = 一个 MotionProfile 实例。当前两个：
// - NATIVE_PROFILE：自研跟随（蓝绿直接追链上点 + spring）——回滚版手感
// - CLOUD_PROFILE：云中心狠活（Frenet 偏移 + EMA 时序滤波 + 调速器）
// 切换风格 = 改 ACTIVE_PROFILE。运动参数（速度档/曲率步长/spring）仍在 params.rs，
// profile 只封装「风格差异」字段（跟随策略/EMA/调速/偏移）。

/// 跟随策略：蓝绿目标怎么算
#[derive(Clone, Copy, PartialEq, Debug)]
#[allow(dead_code)] // NATIVE 备用（一行切回）
pub enum FollowStyle {
    /// 自研：直接追链上弧长点（spring 物理）
    Chain,
    /// 云中心：Frenet 法线偏移 + EMA 时序滤波（转弯同弧、无多段线）
    CloudEma,
}

pub struct MotionProfile {
    #[allow(dead_code)] // 风格名（文档价值）
    pub name: &'static str,
    /// 跟随策略
    pub follow: FollowStyle,
    /// 云中心偏移幅度：蓝绿法线偏移 = FORMATION_OFFSETS[s] × offset_scale
    pub offset_scale: f64,
    /// EMA 时序滤波系数（0.35 跟手适中；越小越柔）
    pub ema_alpha: f64,
    /// 调速器：每补链后 savgol 平滑 + 加速度钳制（消除速度钝点）
    pub tune_speeds: bool,
}

/// 自研 profile（回滚版手感：纯链跟随，无 EMA、无调速器）——备用，一行切回
#[allow(dead_code)]
pub const NATIVE_PROFILE: MotionProfile = MotionProfile {
    name: "native",
    follow: FollowStyle::Chain,
    offset_scale: 0.0,
    ema_alpha: 1.0, // 无滤波（一步到位 = 直接追目标）
    tune_speeds: false,
};

/// 云中心 profile（狠活：Frenet 偏移 + EMA + 调速器）
pub const CLOUD_PROFILE: MotionProfile = MotionProfile {
    name: "cloud-ema",
    follow: FollowStyle::CloudEma,
    offset_scale: 0.05,
    ema_alpha: 0.35,
    tune_speeds: true,
};

/// 当前启用的 profile（切换风格 = 改这里）
pub const ACTIVE_PROFILE: MotionProfile = CLOUD_PROFILE;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn profiles_are_valid() {
        for p in [&NATIVE_PROFILE, &CLOUD_PROFILE] {
            assert!(p.offset_scale >= 0.0 && p.offset_scale < 1.0);
            assert!(p.ema_alpha > 0.0 && p.ema_alpha <= 1.0);
        }
        // 两 profile 必须真正不同（否则切换无意义）
        assert_ne!(NATIVE_PROFILE.follow, CLOUD_PROFILE.follow);
        assert_ne!(NATIVE_PROFILE.ema_alpha, CLOUD_PROFILE.ema_alpha);
    }
}
