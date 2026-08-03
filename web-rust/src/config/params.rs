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

/// 入场仪式（logo 锚点 → 随机区域 → 排队 → 玩耍）
pub const AT_LOGO_MS: f64 = 3000.0; // 在 logo 球位停留
pub const TRAVEL_MS: f64 = 1600.0; // 前往随机区域时长
pub const QUEUE_MS: f64 = 900.0; // 排队时长

/// logo 三球锚点（世界坐标，从原图 517x408 提取：球心 (336,88)(231,110)(299,194)
/// 映射 x=0.5+(nx-0.5)*0.7, y=0.32+ny*0.35；顺序 = BALL_COLORS 顺序）
pub const ANCHORS: [(f64, f64); 3] = [
    (0.605, 0.395), // 粉（上）
    (0.463, 0.414), // 水蓝（左）
    (0.555, 0.486), // 薄荷绿（右下）
];

/// 高速椭圆化：速度 → 长短轴比
pub struct Ellipse {
    /// 最大长短轴比（高速时）
    pub max_ratio: f64,
    /// 速度基准（世界坐标/帧，达到此速度即接近最大比）
    pub speed_base: f64,
}

pub const ELLIPSE: Ellipse = Ellipse {
    max_ratio: 2.6,
    speed_base: 0.012,
};
