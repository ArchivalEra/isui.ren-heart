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

// ---- 排队节奏 ----
/// 蓝绿球思考期：各自随机延迟出发（充分思考啥时候跟上粉球）
pub const QUEUE_DELAY_MIN_MS: f64 = 1000.0;
pub const QUEUE_DELAY_MAX_MS: f64 = 3000.0;
/// 开场粉球先停 5 秒（构图停留），蓝绿在粉球出发后再等 1-3 秒
pub const ENTRY_DELAY_MS: f64 = 5000.0;
/// 蓝绿思考结束后滑向槽位时长
pub const QUEUE_TRANSIT_MS: f64 = 2000.0;
/// 思考结束后滑向槽位时长

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

// ---- 运动风格参数已收敛到 config/profile.rs（MotionProfile 深模块）----
/// 入场预生成：粉球开跑前一次性预生成 N 秒的链（压力前置，运行期零规划）
pub const PREPLAN_SECONDS: f64 = 300.0;
/// 小圈圈滤波：段长低于此值时曲率按比例衰减（短段配小弯，防绿球哆嗦）
pub const MIN_LEG_LEN: f64 = 0.35;
/// logo 区域：每隔 LOGO_EVERY_ARC 弧长规划一个「logo 游走段」（区域规划回归）
pub const LOGO_CENTER: (f64, f64) = (0.52, 0.42);
pub const LOGO_RADIUS: f64 = 0.13;
pub const LOGO_EVERY_ARC: f64 = 9.6; // ≈ 60s 巡航弧长
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

