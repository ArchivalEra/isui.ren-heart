// 全局可配置参数（解耦：改这里即改行为）
pub const BALL_COLORS: [&str; 3] = ["#F09ABD", "#6EC6E6", "#7FC39F"];

pub const BALL_RADIUS: f64 = 10.0;

/// 三球排列：6 种全排列
pub const ORDERS: [[usize; 3]; 6] = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
];

/// 区域内独立概率事件
pub struct Prob {
    pub switch_template: f64,
    pub switch_order: f64,
}

pub const PROB: Prob = Prob {
    switch_template: 0.03,
    switch_order: 0.008,
};

/// 屏幕分块网格
pub const GRID_COLS: usize = 3;
pub const GRID_ROWS: usize = 3;

/// 动画节奏
pub struct Speed {
    pub tps: f64,
    pub phase_gap: f64,
    pub offset_lerp: f64,
    pub yo_yo_amp: f64,
    pub yo_yo_freq: f64,
    pub offset_range: f64,
}

pub const SPEED: Speed = Speed {
    tps: 0.06,
    phase_gap: 0.06,
    offset_lerp: 0.02,
    yo_yo_amp: 0.02,
    yo_yo_freq: 3.0,
    offset_range: 0.06,
};

/// 灰阶氛围
pub struct Ambient {
    pub shadow_color: &'static str,
    pub shadow_blur: f64,
}

pub const AMBIENT: Ambient = Ambient {
    shadow_color: "rgba(17, 17, 17, 0.06)",
    shadow_blur: 24.0,
};

/// 透视：自然俯视（0=远处地平线，1=近处镜头前）
pub fn depth_scale(y: f64) -> f64 {
    0.55 + 0.45 * y.clamp(0.0, 1.0)
}

/// 质量分级（240p → 8K 无缝适配，按视口面积定级）
#[derive(Clone, Copy, PartialEq, PartialOrd)]
pub enum Quality {
    /// 240p 级：最小渲染（无模糊尾迹，浅阴影）
    Low,
    /// 480p 级：基础阴影
    Medium,
    /// 720p/1080p：完整阴影 + 尾迹
    High,
    /// 4K/8K：全效果（深阴影 + 尾迹 + 高渐变精度）
    Ultra,
}

pub fn quality_of(w: f64, h: f64) -> Quality {
    let area = w * h;
    if area < 300_000.0 {
        Quality::Low // ≈ 240p-360p
    } else if area < 1_000_000.0 {
        Quality::Medium // ≈ 480p-720p
    } else if area < 4_000_000.0 {
        Quality::High // ≈ 1080p-2K
    } else {
        Quality::Ultra // 4K/8K
    }
}

/// 帧率自适应：rAF 预算（ms/帧）。实际帧率由 vsync 决定，超预算自动跳帧
pub const FRAME_BUDGET_MS: f64 = 16.0; // 60fps 预算；慢设备自动降频
pub const MAX_SKIP: u32 = 4; // 最多每 5 帧渲染 1 次（≈12fps 保底，电视 23fps 之上）

/// 动态模糊尾迹参数
pub struct MotionBlur {
    /// 尾迹长度（速度方向反向量，倍率 × 球半径）
    pub trail_len: f64,
    /// 尾迹最大透明度
    pub trail_alpha: f64,
}

pub const MOTION_BLUR: MotionBlur = MotionBlur {
    trail_len: 3.0,
    trail_alpha: 0.35,
};
