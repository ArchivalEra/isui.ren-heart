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

/// 模板切换时曲率最大变化量：0.35 = 灵动转弯（移植自 f525e40 的手感）
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
/// 相邻段速度倍率差上限（调速器钳制）：0.6 = 冲刺后两段内阶梯回落，
/// 曾形同虚设（±5.7）→ 高速直跳低速 → spring 惯性回弹（冲刺反方向回退）
pub const SEG_V_DELTA: f64 = 0.6;

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

/// tvel 前瞻时长（秒）：阻尼目标速度取「未来弧长处」的速度/切线——
/// 链减速/转向时球提前反应，根治惯性超前 → spring 拉回（冲刺回弹）
pub const LOOKAHEAD_SECONDS: f64 = 0.45;

/// 位置项切向力占比（0-1）：切向拉回 = 回弹感之源——
/// 法向（纠偏离链）全强度，切向（纠弧长错位）柔和
pub const TANGENTIAL_GAIN: f64 = 0.2;

/// tvel 方向低通：球速度方向每秒最多转 MAX_TURN_RATE 弧度——
/// 链几何切线退化/跳变时球不瞬间掉头（冲刺回弹的直接表现），
/// 而是平滑弧线转向（灵动的单弧线转弯）
pub const MAX_TURN_RATE: f64 = 5.0;

// ---- 段级运动参数（独立于曲线模板，消除组合爆炸）----
/// 速度档位（pixel 开机动画风格：整体慢而优雅，高速档少量保留）
/// 巡航档距小（拖尾均匀），高速档大（跳跃感）
pub const SPEED_BANDS: [(f64, f64); 3] = [
    (0.5, 0.65),   // 慢（pixel 主基调）
    (0.72, 0.85),  // 巡航
    (1.1, 1.3),    // 高速（需批准，40%）
];
/// 入场预生成：粉球开跑前一次性预生成 N 秒的链（压力前置，运行期零规划）
pub const PREPLAN_SECONDS: f64 = 300.0;
/// 小圈圈滤波：段长低于此值时曲率按比例衰减（短段配小弯，防绿球哆嗦）
pub const MIN_LEG_LEN: f64 = 0.35;
/// 曲线 profile 选择：Native（自研单段贝塞尔）或 EulerBlend（段内曲率渐变）
/// 以后新增曲线策略：加 CurveProfile 变体 + 这里切换
pub const CURVE_PROFILE: crate::sim::planner::CurveProfile = crate::sim::planner::CurveProfile::Native;
/// EulerBlend 下混合段概率（make_blend_leg 保留为独立工具含测试）
pub const BLEND_PROB: f64 = 0.2;
/// logo 区域：每隔 LOGO_EVERY_ARC 弧长规划一个「logo 游走段」（区域规划回归）
pub const LOGO_RADIUS: f64 = 0.13;
pub const LOGO_EVERY_ARC: f64 = 9.6; // ≈ 60s 巡航弧长
/// 队形常量：三球法线分离量（不再属于模板）
pub const FORMATION_OFFSETS: [f64; 3] = [0.0, 0.6, -0.6];


/// 入场仪式
pub const FADE_IN_MS: f64 = 800.0; // 锚点淡入时长

// ── 回家程序（checkpoint 仪式）──
// 巡航 HOME_EVERY_MS 后三球回家：粉先回（0ms）→ 蓝绿错开 HOME_STAGGER_MS 依次回
// （弧线回家 HOME_DURATION_MS）→ 全部到家定住 HOME_REST_MS → 粉球启动重启巡航
pub const HOME_EVERY_MS: f64 = 30000.0;
pub const HOME_STAGGER_MS: f64 = 150.0;
pub const HOME_DURATION_MS: f64 = 1500.0;
pub const HOME_REST_MS: f64 = 7000.0;

/// logo 三球锚点（世界坐标，站主实测给点）
pub const ANCHORS: [(f64, f64); 3] = [
    (0.555, 0.355), // 粉（上）
    (0.473, 0.379), // 水蓝（左）
    (0.525, 0.471), // 薄荷绿（右下）
];

