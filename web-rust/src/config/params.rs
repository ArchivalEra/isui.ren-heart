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

/// 链上错开弧长：球 i 落后队首 i×CHAIN_GAP（成群结对一个接一个）
pub const CHAIN_GAP: f64 = 0.15;

// ---- 排队节奏 ----
/// 蓝绿球思考期：各自随机延迟出发（充分思考啥时候跟上粉球）
pub const QUEUE_DELAY_MIN_MS: f64 = 1000.0;
pub const QUEUE_DELAY_MAX_MS: f64 = 3000.0;
/// 开场粉球先停 5 秒（构图停留），蓝绿在粉球出发后再等 1-3 秒
pub const ENTRY_DELAY_MS: f64 = 5000.0;
/// 蓝绿思考结束后滑向槽位时长
pub const QUEUE_TRANSIT_MS: f64 = 2000.0;
/// 思考结束后滑向槽位时长

/// 模板切换时曲率最大变化量（连续性约束，消除方向突变微抖动/小折角）
pub const TEMPLATE_CURV_STEP: f64 = 0.35;
/// 高速移动批准制：速度倍率超过此阈值的模板需批准
pub const SPEED_THRESHOLD: f64 = 1.2;
/// 高速模板被批准的概率（不批准则重新生成新路径模板）
pub const SPEED_APPROVE_PROB: f64 = 0.4;

// ---- 拖尾 ----
/// 历史点最大间距（世界坐标）：超过即截断（高速/交叉时不会连成大长条）
pub const TRAIL_MAX_SEG: f64 = 0.12;

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

pub const SPRING: Spring = Spring { stiffness: 700.0, damping: 1.0 };
/// spring 加速度上限（世界单位/s²）：防「高速冲到一个点定住」
pub const MAX_ACCEL: f64 = 2.5;

/// 漫游节奏（Play 阶段）
pub struct Wander {
    /// 法线偏移缓动
    pub offset_lerp: f64,
    /// 法线偏移幅度（路径法线方向）
    pub offset_range: f64,
}

pub const WANDER: Wander = Wander {
    offset_lerp: 0.04,
    offset_range: 0.05,
};

// ---- 段级运动参数（独立于曲线模板，消除组合爆炸）----
/// 速度档位（每段随机选档；>1.2 为高速，受批准制约束）
/// 收窄档距：段间速度差小 → 历史点距均匀 → 拖尾连续无珠链
pub const SPEED_BANDS: [(f64, f64); 3] = [
    (0.75, 0.9),   // 慢
    (0.95, 1.1),   // 巡航
    (1.2, 1.35),   // 高速（需批准）
];
/// 摆动档位（每段随机选；收窄 + 段间连续性约束 → 无折角）
pub const WAVE_BANDS: [f64; 3] = [0.0, 0.02, 0.05];
/// 段间摆动最大变化（wave 连续性，防折角）
pub const WAVE_CURV_STEP: f64 = 0.03;
/// 队形常量：三球法线分离量（不再属于模板）
pub const FORMATION_OFFSETS: [f64; 3] = [0.0, 0.6, -0.6];


/// 入场仪式
pub const FADE_IN_MS: f64 = 800.0; // 锚点淡入时长

/// logo 三球锚点（世界坐标，站主实测给点）
pub const ANCHORS: [(f64, f64); 3] = [
    (0.555, 0.355), // 粉（上）
    (0.473, 0.379), // 水蓝（左）
    (0.525, 0.471), // 薄荷绿（右下）
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
