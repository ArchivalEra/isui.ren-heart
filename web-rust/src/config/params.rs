// 全局可配置参数 —— 解耦：改这里即改行为
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
    /// 进入新网格时切换到「该网格偏好模板」的概率
    pub switch_template: f64,
    /// 进入新网格时切换排列（队首）的概率
    pub switch_order: f64,
}

pub const PROB: Prob = Prob {
    switch_template: 0.3,
    switch_order: 0.008,
};

/// 精细区域网格（满屏游乐场：边边角角也在内）
pub const GRID_COLS: usize = 8;
pub const GRID_ROWS: usize = 8;

/// 漫游节奏（Play 阶段）
pub struct Wander {
    /// 基准进度（t/帧，60fps 基准；t 走完 1.0 = 一段路径）
    pub base_speed: f64,
    /// 球沿路径错开相位
    pub phase_gap: f64,
    /// 法线偏移缓动
    pub offset_lerp: f64,
    /// 法线偏移幅度（路径法线方向）
    pub offset_range: f64,
}

pub const WANDER: Wander = Wander {
    base_speed: 0.007,
    phase_gap: 0.055,
    offset_lerp: 0.04,
    offset_range: 0.05,
};

/// 透视：自然俯视（0=远处地平线，1=近处镜头前）
pub fn depth_scale(y: f64) -> f64 {
    0.55 + 0.45 * y.clamp(0.0, 1.0)
}

/// 帧率自适应：rAF 预算（ms/帧）。实际帧率由 vsync 决定，超预算自动跳帧
pub const FRAME_BUDGET_MS: f64 = 16.0; // 60fps 预算；慢设备自动降频
pub const MAX_SKIP: u32 = 4; // 最多每 5 帧渲染 1 次（≈12fps 保底，电视 23fps 之上）

/// 入场仪式
pub const AT_LOGO_MS: f64 = 3000.0; // 在 logo 球位停留
pub const TRAVEL_MS: f64 = 1600.0; // 前往随机区域时长
pub const QUEUE_MS: f64 = 900.0; // 排队时长

/// logo 三球锚点（世界坐标，从原图提取）
pub const ANCHORS: [(f64, f64); 3] = [
    (0.605, 0.395), // 粉（上）
    (0.463, 0.414), // 水蓝（左）
    (0.555, 0.486), // 薄荷绿（右下）
];

/// 高速椭圆化：只有非常快才压缩（阈值 + smoothstep 平滑曲线）
pub struct Ellipse {
    pub max_ratio: f64,
    pub speed_base: f64,
    /// 归一化速度阈值：低于此完全不压缩
    pub threshold: f64,
}

pub const ELLIPSE: Ellipse = Ellipse {
    max_ratio: 2.6,
    speed_base: 0.008,
    threshold: 0.45,
};

/// 规划/执行解耦：规划窗口参数
pub struct Plan {
    /// 规划总窗口（预计算时间上限 1 分钟）
    pub horizon_ms: f64,
    /// 补规划步长（每 15s 补足未来曲线，即多规划 15s）
    pub step_ms: f64,
}

pub const PLAN: Plan = Plan {
    horizon_ms: 60_000.0,
    step_ms: 15_000.0,
};

/// 动态模糊尾迹
pub struct MotionBlur {
    pub trail_len: f64,
    pub trail_alpha: f64,
}

pub const MOTION_BLUR: MotionBlur = MotionBlur {
    trail_len: 3.0,
    trail_alpha: 0.3,
};
