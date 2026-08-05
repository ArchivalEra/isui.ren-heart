// 运动风格 Profile（架构候选 B 落地——完整风格对象，深模块）
// 一种风格 = 一个 MotionProfile 实例。当前两个：
// - NATIVE_PROFILE：简易去 EMA 版（Chain 跟随 + 无 EMA + 无偏移）——断尾求生对比用
// - CLOUD_PROFILE：云中心狠活（Frenet 偏移 + EMA 时序滤波 + 调速器）
// 编译期默认 ACTIVE_PROFILE = CLOUD_PROFILE（params.rs 手感参数别名继续用它）；
// 运行时热切换：P 键 / toggle_active() 翻转 ACTIVE_IDX（0=native、1=cloud）——
// Player 每帧从 active() 读风格，切换即时生效、无需重建 Player。
//
// 手感参数（速度档/spring/加速度/拖尾/前瞻/切向力/转向低通）从 params.rs
// 全局常量迁入 profile——一个实例 = 一套完整手感：换手感 = 换一个实例，
// 不再全局改 5-9 处。params.rs 中这些常量改为 ACTIVE_PROFILE 字段的别名。
// 几何/节奏参数（CHAIN_GAP/LOGO_*/PROB/ORDERS/TEMPLATES/HOME_*/QUEUE_* 等）
// 不属于风格，留在 params.rs。

use std::sync::atomic::{AtomicUsize, Ordering};

/// 跟随策略：蓝绿目标怎么算
#[derive(Clone, Copy, PartialEq, Debug)]
#[allow(dead_code)] // NATIVE 备用（一行切回）
pub enum FollowStyle {
    /// 自研：直接追链上弧长点（spring 物理）
    Chain,
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

/// 简易去 EMA 版：Chain 跟随（直接贴链上点）+ 无 EMA（α=1.0）+ 无偏移
/// （offset_scale=0）+ 无调速器（tune_speeds=false）——断尾求生对比用
/// 手感参数与 CLOUD_PROFILE 相同（当前只有一套手感；引入第二套手感时从这里分化）
#[allow(dead_code)]
pub const NATIVE_PROFILE: MotionProfile = MotionProfile {
    name: "native",
    follow: FollowStyle::Chain,
    offset_scale: 0.0,
    ema_alpha: 1.0, // 无滤波（一步到位 = 直接追目标）
    tune_speeds: false,
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

/// 云中心 profile（狠活：Frenet 偏移 + EMA + 调速器）
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

/// 当前启用的 profile（编译期默认 CLOUD——params.rs 手感参数别名继续用它；
/// 运行时热切换走 ACTIVE_IDX + active()，与它无冲突）
pub const ACTIVE_PROFILE: MotionProfile = CLOUD_PROFILE;

/// 运行时活动风格索引：0 = NATIVE_PROFILE、1 = CLOUD_PROFILE。
/// 调试热切换（P 键 / toggle_active）翻转此值；Player 每帧 active() 读取——
/// 切换即时生效，无需重建 Player。
pub static ACTIVE_IDX: AtomicUsize = AtomicUsize::new(1);

/// 全部风格（索引 = ACTIVE_IDX 语义）
pub const PROFILES: [MotionProfile; 2] = [NATIVE_PROFILE, CLOUD_PROFILE];

/// 当前活动风格（每帧读一次 atomic，Relaxed 足够——仅做 0/1 翻转一致）
pub fn active() -> MotionProfile {
    PROFILES[ACTIVE_IDX.load(Ordering::Relaxed)].clone()
}

/// 运行时热切换：0↔1（native ↔ cloud）——P 键调试用
pub fn toggle_active() {
    ACTIVE_IDX.store(1 - ACTIVE_IDX.load(Ordering::Relaxed), Ordering::Relaxed);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sim::cloud::ema_step;
    use crate::sim::math::Vec2;

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

    #[test]
    fn profiles_have_complete_valid_feel_fields() {
        // 完整风格对象：字段齐全且值合法（speed_bands/spring/accel/trail/前瞻/切向/转向）
        for p in [&NATIVE_PROFILE, &CLOUD_PROFILE] {
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
    }

    #[test]
    fn style_pairing_observable_difference() {
        // 风格对拍：同一输入下，两种风格的可观测差异落在文档化字段上
        // （follow / ema_alpha / offset_scale / tune_speeds）——一个实例 = 一种手感
        assert_ne!(NATIVE_PROFILE.follow, CLOUD_PROFILE.follow);
        assert_ne!(NATIVE_PROFILE.ema_alpha, CLOUD_PROFILE.ema_alpha);
        assert_ne!(NATIVE_PROFILE.offset_scale, CLOUD_PROFILE.offset_scale);
        assert_ne!(NATIVE_PROFILE.tune_speeds, CLOUD_PROFILE.tune_speeds);

        // EMA 对拍：同一 raw 点序列，α 不同 → 滤波轨迹不同
        // NATIVE α=1.0（无滤波一步到位）vs CLOUD α=0.28（柔化滞后）
        let raw = [
            Vec2 { x: 0.5, y: 0.5 },
            Vec2 { x: 0.55, y: 0.53 },
            Vec2 { x: 0.48, y: 0.5 },
        ];
        let mut nat = raw[0];
        let mut clo = raw[0];
        for p in &raw[1..] {
            nat = ema_step(nat, *p, NATIVE_PROFILE.ema_alpha);
            clo = ema_step(clo, *p, CLOUD_PROFILE.ema_alpha);
        }
        assert_ne!(nat, clo, "ema_alpha 不同 → 同一输入滤波结果不同");

        // 云偏移对拍：同一链上点 + 水平切线（法线 = (0,-1)）——
        // CLOUD offset_scale=0.05 产生法线偏移，NATIVE offset_scale=0 无偏移
        let point = Vec2 { x: 0.5, y: 0.5 };
        let normal = Vec2 { x: 0.0, y: -1.0 }; // 水平切线顺时针 90°
        let nat_target = Vec2 {
            x: point.x + normal.x * NATIVE_PROFILE.offset_scale,
            y: point.y + normal.y * NATIVE_PROFILE.offset_scale,
        };
        let clo_target = Vec2 {
            x: point.x + normal.x * CLOUD_PROFILE.offset_scale,
            y: point.y + normal.y * CLOUD_PROFILE.offset_scale,
        };
        assert_ne!(nat_target, clo_target, "offset_scale 不同 → 跟随目标不同");
        assert!((nat_target.y - 0.5).abs() < 1e-12, "NATIVE 无偏移: {}", nat_target.y);
        assert!((clo_target.y - 0.45).abs() < 1e-12, "CLOUD 偏移 0.05: {}", clo_target.y);
    }

    #[test]
    fn hand_feel_params_match_params_rs_current() {
        // 行为零变化契约：手感参数 = 原 params.rs 全局常量字面量（原样搬入）
        // 当前两种风格共享同一套手感参数（只有风格字段不同）
        for p in [&NATIVE_PROFILE, &CLOUD_PROFILE] {
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

    #[test]
    fn profile_hot_switch_flips_style() {
        // 运行时热切换：ACTIVE_IDX 0↔1 → active() 在 NATIVE/CLOUD 间翻转（原子读写）
        // 测试末尾必须复位 1（RAII）——否则污染并行运行的其他测试
        struct ResetIdx;
        impl Drop for ResetIdx {
            fn drop(&mut self) {
                ACTIVE_IDX.store(1, Ordering::Relaxed);
            }
        }
        let _reset = ResetIdx;

        ACTIVE_IDX.store(0, Ordering::Relaxed);
        assert_eq!(active(), NATIVE_PROFILE, "idx=0 → native（去 EMA 简易版）");
        ACTIVE_IDX.store(1, Ordering::Relaxed);
        assert_eq!(active(), CLOUD_PROFILE, "idx=1 → cloud（EMA 版）");
        // toggle_active 双向翻转（P 键行为）
        toggle_active(); // 1→0
        assert_eq!(active(), NATIVE_PROFILE, "toggle 1→0");
        toggle_active(); // 0→1
        assert_eq!(active(), CLOUD_PROFILE, "toggle 0→1");
    }
}
