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
