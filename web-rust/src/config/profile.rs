// 运动风格 Profile（架构候选 B 落地——完整风格对象，深模块）
// 一种风格 = 一个 MotionProfile 实例。当前唯一：CLOUD_PROFILE（云中心狠活：
// Frenet 偏移 + EMA 时序滤波 + 调速器）——EMA 唯一风格，/heart 收尾：
// 去 EMA 对比已无必要（NATIVE_PROFILE 与运行时热切换已删除）。
// 编译期固定 ACTIVE_PROFILE = CLOUD_PROFILE（params.rs 手感参数别名继续用它）。
//
// 手感参数（速度档/spring/加速度/拖尾/前瞻/切向力/转向低通）从 params.rs
// 全局常量迁入 profile——一个实例 = 一套完整手感：换手感 = 换一个实例，
// 不再全局改 5-9 处。params.rs 中这些常量改为 ACTIVE_PROFILE 字段的别名。
// 几何/节奏参数（CHAIN_GAP/LOGO_*/PROB/ORDERS/TEMPLATES/HOME_*/QUEUE_* 等）
// 不属于风格，留在 params.rs。

/// 跟随策略：蓝绿目标怎么算
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum FollowStyle {
    /// 云中心：Frenet 法线偏移 + EMA 时序滤波（转弯同弧、无多段线）
    CloudEma,
}

#[derive(Clone, Copy, PartialEq, Debug)]
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
    // ── 手感参数（原 params.rs 全局常量迁入——一套完整手感）──
    /// 速度档位（原 params::SPEED_BANDS）：档内随机，高速档需批准
    pub speed_bands: &'static [(f64, f64)],
    /// spring 刚度（原 params::SPRING.stiffness）
    pub spring_stiffness: f64,
    /// spring 阻尼（原 params::SPRING.damping）
    pub spring_damping: f64,
    /// spring 加速度上限（原 params::MAX_ACCEL）
    pub max_accel: f64,
    /// 相邻段速度倍率差钳制（原 params::SEG_V_DELTA）
    pub seg_v_delta: f64,
    /// 拖尾历史点最大间距（原 params::TRAIL_MAX_SEG）
    pub trail_max_seg: f64,
    /// tvel 前瞻时长（秒，原 params::LOOKAHEAD_SECONDS）
    pub lookahead_seconds: f64,
    /// 位置项切向力占比（0-1，原 params::TANGENTIAL_GAIN）
    pub tangential_gain: f64,
    /// tvel 方向最大转角（rad/s，原 params::MAX_TURN_RATE）
    pub max_turn_rate: f64,
}

/// 云中心 profile（狠活：Frenet 偏移 + EMA + 调速器）——EMA 唯一风格
pub const CLOUD_PROFILE: MotionProfile = MotionProfile {
    name: "cloud-ema",
    follow: FollowStyle::CloudEma,
    offset_scale: 0.05,
    ema_alpha: 0.28, // 更柔：段边界 raw 跳（κ·d 衰减）被消化更多——蓝绿顿顿
    tune_speeds: true,
    speed_bands: &[(0.5, 0.65), (0.72, 0.85), (1.1, 1.3)],
    spring_stiffness: 700.0,
    spring_damping: 1.0,
    max_accel: 2.5,
    seg_v_delta: 0.6,
    trail_max_seg: 0.12,
    lookahead_seconds: 0.45,
    tangential_gain: 0.2,
    max_turn_rate: 5.0,
};

/// 当前启用的 profile（编译期固定 CLOUD——EMA 唯一风格；params.rs 手感参数别名继续用它）
pub const ACTIVE_PROFILE: MotionProfile = CLOUD_PROFILE;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn profile_valid() {
        // EMA 唯一风格校验（NATIVE/热切换删除后改为单 profile 校验）
        let p = &CLOUD_PROFILE;
        assert!(p.offset_scale >= 0.0 && p.offset_scale < 1.0);
        assert!(p.ema_alpha > 0.0 && p.ema_alpha <= 1.0);
    }

    #[test]
    fn profiles_have_complete_valid_feel_fields() {
        // 完整风格对象：字段齐全且值合法（speed_bands/spring/accel/trail/前瞻/切向/转向）
        let p = &CLOUD_PROFILE;
        assert!(!p.speed_bands.is_empty(), "speed_bands 非空");
        for &(lo, hi) in p.speed_bands {
            assert!(lo > 0.0 && lo <= hi, "速度档 lo<=hi 且为正: ({lo}, {hi})");
        }
        assert!(p.spring_stiffness > 0.0, "spring 刚度为正: {}", p.spring_stiffness);
        assert!(p.spring_damping > 0.0, "spring 阻尼为正: {}", p.spring_damping);
        assert!(p.max_accel > 0.0, "max_accel 为正: {}", p.max_accel);
        assert!(p.seg_v_delta > 0.0, "seg_v_delta 为正: {}", p.seg_v_delta);
        assert!(p.trail_max_seg > 0.0, "trail_max_seg 为正: {}", p.trail_max_seg);
        assert!(p.lookahead_seconds > 0.0, "lookahead_seconds 为正: {}", p.lookahead_seconds);
        assert!(
            (0.0..=1.0).contains(&p.tangential_gain),
            "tangential_gain ∈ [0,1]: {}",
            p.tangential_gain
        );
        assert!(p.max_turn_rate > 0.0, "max_turn_rate 为正: {}", p.max_turn_rate);
    }

    #[test]
    fn hand_feel_params_match_params_rs_current() {
        // 行为零变化契约：手感参数 = 原 params.rs 全局常量字面量（原样搬入）
        let p = &CLOUD_PROFILE;
        assert_eq!(p.speed_bands, &[(0.5, 0.65), (0.72, 0.85), (1.1, 1.3)][..]);
        assert_eq!(p.spring_stiffness, 700.0);
        assert_eq!(p.spring_damping, 1.0);
        assert_eq!(p.max_accel, 2.5);
        assert_eq!(p.seg_v_delta, 0.6);
        assert_eq!(p.trail_max_seg, 0.12);
        assert_eq!(p.lookahead_seconds, 0.45);
        assert_eq!(p.tangential_gain, 0.2);
        assert_eq!(p.max_turn_rate, 5.0);
    }
}
