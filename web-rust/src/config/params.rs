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

/// 出发错开：球 i 延迟 i×STAGGER_MS（一个接一个出发，无排队仪式）
pub const STAGGER_MS: f64 = 250.0;

/// 相邻段时长比上限：约束球速差异（「换顺序」过程太快 = dur 差异过大）
/// 调小 → 换序更慢更平滑；调大 → 允许暴快（拖尾出师后高速韵味）
pub const MAX_DUR_RATIO: f64 = 2.5;

/// 规划时独立概率事件（网格判断已废弃——规划/执行架构下为纯负担）
pub struct Prob {
    /// 规划时完全随机换模板的概率（防单一模板连发绕圈）
    pub switch_template: f64,
    /// 规划时切换排列（队首）的概率
    pub switch_order: f64,
}

pub const PROB: Prob = Prob {
    switch_template: 0.4,
    switch_order: 0.008,
};

/// 世界速度（单位/秒）：恒定速度 → 时长与路径长度挂钩
/// （固定时长导致长路径飞掠 = 视觉「闪现」的根因）
pub const WORLD_SPEED: f64 = 0.22;

/// Spring 物理（谷歌大学成果，MDC-Android 官方 MotionTokens）：
/// motionSpringDefaultSpatial = damping 0.9, stiffness 700
/// damping < 1 → 轻微过冲（pixel 小球「灵动」的来源）
/// 取代缓动曲线：任何速度变化都连续（无卡顿感、无停顿、无突跳）
pub struct Spring {
    pub stiffness: f64,
    pub damping: f64,
}

pub const SPRING: Spring = Spring { stiffness: 700.0, damping: 0.9 };

/// 漫游节奏（Play 阶段）
pub struct Wander {
    /// 球沿路径错开相位
    pub phase_gap: f64,
    /// 法线偏移缓动
    pub offset_lerp: f64,
    /// 法线偏移幅度（路径法线方向）
    pub offset_range: f64,
}

pub const WANDER: Wander = Wander {
    phase_gap: 0.055,
    offset_lerp: 0.04,
    offset_range: 0.05,
};

/// 三球「商量」最小间距（世界坐标）
pub const MIN_BALL_DIST: f64 = 0.3;


/// 入场仪式
pub const FADE_IN_MS: f64 = 800.0; // 锚点淡入时长
pub const AT_LOGO_MS: f64 = 3000.0; // 在 logo 球位停留
pub const TRAVEL_MS: f64 = 1600.0; // 前往随机区域时长

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

/// 动态模糊尾迹
pub struct MotionBlur {
    pub trail_len: f64,
    pub trail_alpha: f64,
}

pub const MOTION_BLUR: MotionBlur = MotionBlur {
    trail_len: 3.0,
    trail_alpha: 0.3,
};
