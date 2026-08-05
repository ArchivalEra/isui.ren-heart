// ═══════════════════════════════════════════════════════════════════
// 全局可配置参数 —— Gemini 师傅的唯一操作文件
// 曲线模板（TEMPLATES 25 个）、速度档（SPEED_BANDS）、曲率步长
// （TEMPLATE_CURV_STEP）、spring 手感、队形、logo、回家/排队节奏……
// 全部集中于此文件：想调任何东西，只开这一个文件。
// 手感参数（SPRING/MAX_ACCEL/SEG_V_DELTA/TRAIL_MAX_SEG/
// LOOKAHEAD_SECONDS/TANGENTIAL_GAIN/MAX_TURN_RATE/SPEED_BANDS）
// = ACTIVE_PROFILE（profile.rs）字段的别名——换手感 = 改 ACTIVE_PROFILE =
// 一处全变。几何/节奏参数（LOGO_*/PROB/TEMPLATES/HOME_*/QUEUE_* 等）
// 不属于风格，留在本文件下方。
// ═══════════════════════════════════════════════════════════════════
use crate::config::profile::ACTIVE_PROFILE;

// ═══════════════════════════════════════════════════════════════════
// 【Gemini 可操作区·性格】三球灵魂差异化——每个孩子独立的运动性格
// - curv_bias：模板曲率偏好（+ = 爱大弯绕圈 / - = 爱直路巡航 / 0 = 中立）
// - speed_band：速度档钦定（Some(0)=慢 / Some(1)=巡航 / Some(2)=高速 /
//   None=随机）——"跳跃爱好者"给 Some(2)
// - follow_prob：跟随意愿（蓝绿想跟粉球玩的概率——每 5s 判定）
// 改数值即可——测试 personality_bias_observable 校验差异可观测
pub struct Personality {
    pub name: &'static str,
    pub curv_bias: f64,
    pub speed_band: Option<usize>,
    pub follow_prob: f64,
}
pub const PERSONALITIES: [Personality; 3] = [
    Personality { name: "粉球·领航", curv_bias: 0.0, speed_band: None, follow_prob: 0.3 },
    // Gemini 真经三号：强曲率偏好 + 慢速优雅转圈
    Personality { name: "蓝球·绕圈", curv_bias: 0.45, speed_band: Some(0), follow_prob: 0.15 },
    // Gemini 真经三号：直路 + 高速疾速穿梭
    Personality { name: "绿球·巡航", curv_bias: -0.35, speed_band: Some(2), follow_prob: 0.5 },
];

pub const BALL_COLORS: [&str; 3] = ["#F09ABD", "#6EC6E6", "#7FC39F"];

pub const BALL_RADIUS: f64 = 10.0;

// ---- 排队节奏 ----
/// 蓝绿球思考期：各自随机延迟出发（充分思考啥时候跟上粉球）
pub const QUEUE_DELAY_MIN_MS: f64 = 1000.0;
pub const QUEUE_DELAY_MAX_MS: f64 = 3000.0;
/// 开场粉球先停 5 秒（构图停留），蓝绿在粉球出发后再等 1-3 秒
pub const ENTRY_DELAY_MS: f64 = 5000.0;
/// 蓝绿思考结束后滑向槽位时长
pub const QUEUE_TRANSIT_MS: f64 = 2000.0;
/// 思考结束后滑向槽位时长

// ---- 启动/重启错开（主次随机——Gemini 可调）----
/// 首次启动出发错开间隔（ms）：顺位 × 本值——主球顺位 0 无延迟先出发，
/// 次球顺位 1/2 依次延迟（顺位×间隔）。主次随机：每次加载页面洗牌决定
/// 主次——谁先出发谁领跑，三球出场顺序每次打开都不同。
/// Gemini 可调：调大 = 出场拉得更开、主次感更强；调小 = 更紧凑。
/// ⚠️ 接线状态：参数已就绪待集成接入（现有开场仍为粉球 ENTRY_DELAY_MS
/// 先发、蓝绿随机错开 QUEUE_DELAY_MIN/MAX_MS——未按顺位错开）。
pub const LAUNCH_STAGGER_MS: f64 = 1500.0;
/// 回家后重启错开间隔（ms）：顺位 × 本值——重启巡航时同样按顺位错开
/// （主球先启动、次球顺位延迟）。主次随机：每次重启重新洗牌——与上次
/// 出场的领跑者不同（新鲜感）。Gemini 可调：调大 = 重启节奏更从容；
/// 调小 = 更快归位。
/// ⚠️ 接线状态：参数已就绪待集成接入（现有回家后仍三球同步重启，
/// 见下方 HOME_REST_MS 区「不再错开」——此处是后续错开重启的预留）。
pub const RESTART_STAGGER_MS: f64 = 1000.0;

/// 模板切换时曲率最大变化量：0.35 = 灵动转弯（移植自 f525e40 的手感）
pub const TEMPLATE_CURV_STEP: f64 = 0.2; // Gemini 真经二版：段间 |Δκ| ≤ 0.2——法向加速度冲量最小化（0.35 曾单段暴跳）
/// 高速移动批准制：速度倍率超过此阈值的模板需批准
pub const SPEED_THRESHOLD: f64 = 1.2;
/// 高速模板被批准的概率（不批准则重新生成新路径模板）
pub const SPEED_APPROVE_PROB: f64 = 0.4;

// ---- 拖尾 ----
/// 历史点最大间距（世界坐标）：超过即截断（高速/交叉时不会连成大长条）
/// 手感参数 → ACTIVE_PROFILE.trail_max_seg
pub const TRAIL_MAX_SEG: f64 = ACTIVE_PROFILE.trail_max_seg;

/// 相邻段时长比上限：约束球速差异（「换顺序」过程太快 = dur 差异过大）
/// 调小 → 换序更慢更平滑；调大 → 允许暴快（拖尾出师后高速韵味）
pub const MAX_DUR_RATIO: f64 = 2.5;
/// 相邻段速度倍率差上限（调速器钳制）：0.6 = 冲刺后两段内阶梯回落，
/// 曾形同虚设（±5.7）→ 高速直跳低速 → spring 惯性回弹（冲刺反方向回退）
/// 手感参数 → ACTIVE_PROFILE.seg_v_delta
pub const SEG_V_DELTA: f64 = ACTIVE_PROFILE.seg_v_delta;

/// 规划时独立概率事件（网格判断已废弃——规划/执行架构下为纯负担）
pub struct Prob {
    /// 规划时完全随机换模板的概率（防单一模板连发绕圈）
    pub switch_template: f64,
}

pub const PROB: Prob = Prob { switch_template: 0.4 };

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

/// 手感参数 → ACTIVE_PROFILE.spring_stiffness / spring_damping
pub const SPRING: Spring = Spring {
    stiffness: ACTIVE_PROFILE.spring_stiffness,
    damping: ACTIVE_PROFILE.spring_damping,
};
/// spring 加速度上限（世界单位/s²）：防「高速冲到一个点定住」
/// 手感参数 → ACTIVE_PROFILE.max_accel
pub const MAX_ACCEL: f64 = ACTIVE_PROFILE.max_accel;

/// tvel 前瞻时长（秒）：阻尼目标速度取「未来弧长处」的速度/切线——
/// 链减速/转向时球提前反应，根治惯性超前 → spring 拉回（冲刺回弹）
/// 手感参数 → ACTIVE_PROFILE.lookahead_seconds
pub const LOOKAHEAD_SECONDS: f64 = ACTIVE_PROFILE.lookahead_seconds;

/// 位置项切向力占比（0-1）：切向拉回 = 回弹感之源——
/// 法向（纠偏离链）全强度，切向（纠弧长错位）柔和
/// 手感参数 → ACTIVE_PROFILE.tangential_gain
pub const TANGENTIAL_GAIN: f64 = ACTIVE_PROFILE.tangential_gain;

/// tvel 方向低通：球速度方向每秒最多转 MAX_TURN_RATE 弧度——
/// 链几何切线退化/跳变时球不瞬间掉头（冲刺回弹的直接表现），
/// 而是平滑弧线转向（灵动的单弧线转弯）
/// 手感参数 → ACTIVE_PROFILE.max_turn_rate
pub const MAX_TURN_RATE: f64 = ACTIVE_PROFILE.max_turn_rate;

// ---- 段级运动参数（独立于曲线模板，消除组合爆炸）----
/// 速度档位（pixel 开机动画风格：整体慢而优雅，高速档少量保留）
/// 巡航档距小（拖尾均匀），高速档大（跳跃感）
/// 手感参数 → ACTIVE_PROFILE.speed_bands（值 = 原字面量原样搬入）
pub const SPEED_BANDS: &'static [(f64, f64)] = ACTIVE_PROFILE.speed_bands;
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
/// 跟随偏移量：蓝绿跟随粉球时按槽位法线分离（FORMATION_OFFSETS[s]×offset_scale，
/// 由 state.rs 构造 ExtTarget 时注入——不再属于模板）
pub const FORMATION_OFFSETS: [f64; 3] = [0.0, 0.6, -0.6];


/// 入场仪式
pub const FADE_IN_MS: f64 = 800.0; // 锚点淡入时长

// ── 回家程序（checkpoint 仪式）──
// 巡航 HOME_EVERY_MS 后三球同时回家：预渲染动画（plan_home_anim）——
// 三球共享同一 HomeAnim（时间对齐——同时到家）→ 全部到家定住 HOME_REST_MS
// → 三球同时重启巡航。不再错开（三球同步）。
pub const HOME_EVERY_MS: f64 = 30000.0;
/// 回家动画时长（ms）——预渲染 HomeAnim 的 dur_ms（三球相同——同时到家）。
/// Gemini 可调：调大 = 回家弧线更从容；调小 = 更快归位。
pub const HOME_ANIM_MS: f64 = 2500.0;
// 已删除：HOME_STAGGER_MS（不再错开——三球同步回家）、
// HOME_DURATION_MS（被 HOME_ANIM_MS 取代——不再按链段化超时兜底）。
// 引用处由集成时清理（state.rs 等）。
pub const HOME_REST_MS: f64 = 7000.0;

// ── 蓝绿跟随粉球（独立球模式）──
/// Free 中每 FOLLOW_CHECK_MS 判定一次是否进入 FollowPink
pub const FOLLOW_CHECK_MS: f64 = 5000.0;
/// 判定进入跟随的概率（随机 < 此值 → FollowPink）
pub const FOLLOW_PROB: f64 = 0.3;
/// 跟随最短时长（ms）
pub const FOLLOW_DUR_MIN_MS: f64 = 5000.0;
/// 跟随最长时长（ms）
pub const FOLLOW_DUR_MAX_MS: f64 = 20000.0;

/// logo 三球锚点（世界坐标，站主实测给点——固定：锚点恒等于本常量，
/// 不再跟 logo 变换；调试拖球经 state.set_anchor 临时改）
pub const ANCHORS: [(f64, f64); 3] = [
    (0.487, 0.245), // 粉（上）——窗口舞台校准 2026-08-07（固定坐标系）
    (0.386, 0.271), // 水蓝（左）
    (0.454, 0.365), // 薄荷绿（右下）
];

// ═══════════════════════════════════════════════════════════════════
// 【Gemini 可操作区】模板 + 参数集中于此
// 上方 = 全局参数；本区 = 曲线模板池（模板 + 校验测试）。要改曲线就改这里。
// ═══════════════════════════════════════════════════════════════════
//
// 曲线模板规范（CURVE TEMPLATE SPEC）—— 给 AI 协作者的添加/删除指南
//
// 【这是什么】
//   每个「曲线模板」只描述一段路径的【几何形状】（弯度）。
//   速度、摆动、队形是独立的段级参数（见本文件：SPEED_BANDS /
//   WAVE_BANDS / FORMATION_OFFSETS）——曲线只管形状，不做组合爆炸。
//   想「慢速绕圈」= loop 曲线 + 慢速档；想「高速线圈」= coil + 冲刺档，
//   不需要为每种组合新建模板。
//
// 【如何添加一个曲线模板】
//   1. 想好 id（英文小写+下划线，≤16 字符）和 name（中文，≤8 字）
//   2. 设计 curvature（见下面取值规范）
//   3. 在 TEMPLATES 数组末尾追加 `Template { ... },`
//   4. 把数组长度 `[Template; N]` 改成新数量
//   5. 运行 `cargo test template_spec` —— 校验测试检查取值合法
//
// 【如何删除/禁用一个曲线模板】
//   删除 TEMPLATES 中对应行 + 改数组长度。
//
// 【curvature 取值规范】（校验测试 template_spec_validates_all 强制执行）
//   - 范围 [-1.6, 1.6]；0=直线，正=左弯，负=右弯
//   - |curvature| > 1 会显著弯折（线圈/环）；> 1.6 校验失败
//   - 相邻段切换时 |Δcurvature| 会被 TEMPLATE_CURV_STEP(0.35) 约束
//     （自动，无需处理）
//
// 【如何钦定速度档】（可选；默认 None = 随机档，行为与旧版完全一致）
//   Template.speed = Some(档位索引)，指向本文件上方 SPEED_BANDS：
//     0 = 慢档 0.5-0.65，1 = 巡航档 0.72-0.85，2 = 高速档 1.1-1.3
//   例：`Template { id: "coil", ..., speed: Some(2) }` = 线圈固定高速档
//     （艺术表达：coil 天生高速甩尾的视觉意图直接落地）。
//   钦定档不走高速批准制（SPEED_THRESHOLD/SPEED_APPROVE_PROB 只作用于随机档）——
//   AI/Gemini 钦定 = 艺术意图直接落地；随机档才需要批准制防视觉失控。
//   现有模板全部 speed: None（零行为变化）；想钦定才把 None 改成 Some(档位)。
//
// 【设计要点】
//   - 曲线是「从当前点出发、朝当前方向继续」的贝塞尔弧：
//     ctrl = from + dir×(dist/2) + normal×dist×curvature×0.35
//   - 直线段后接大弯 = 突然转向，衔接由曲率连续性约束自动平滑
//   - 想让队伍「画线圈」：curvature ≈ ±1.2~1.5
//   - 想让队伍「蛇形/绕圈」：curvature ≈ 0.4~0.8
//   - 想让队伍「大范围巡航」：curvature ≈ 0.0~0.3
//   - 新增后目测：`./build.sh && python3 serve.py 8080`
//
// 【现有曲线一览】（25 个，gemini 师傅 2026-08-04 六主题梯队）
//   0 轴线基准：run(直线)
//   1 细微流韵：stroll/stroll_r(闲步±0.10) breeze/breeze_r(拂风±0.20)
//   2 优雅巡航：ripple/ripple_r(漪涟±0.30) glide/glide_r(滑翔±0.40) sway/sway_r(摇摆±0.52)
//   3 律动开合：loop/loop_r(绕弧±0.65) sweep/sweep_r(漫游±0.78) surge/surge_r(涌浪±0.90)
//   4 疾速甩尾：drift/drift_r(漂移±1.05) whirl/whirl_r(柔卷±1.22)
//   5 极光飞花：coil/coil_r(灵线±1.40) vortex/vortex_r(漩涡±1.55)
//   ※ 任意相邻档位 |Δcurv| ∈ [0.10, 0.18] << 0.35 连续性约束——衔接天然平滑
//
// ─────────────────────────────────────────────

pub struct Template {
    #[allow(dead_code)] // 配置契约：模板标识（英文小写+下划线，唯一）
    pub id: &'static str,
    #[allow(dead_code)] // 配置契约：中文名（展示/调试用）
    pub name: &'static str,
    /// 路径弯度 [-1.6, 1.6]：0=直线，正=左弯，负=右弯；|x|>1 呈线圈
    pub curvature: f64,
    /// 钦定速度档位（索引指向本文件上方 SPEED_BANDS，见文件头档位对照）：
    /// Some(idx) = 模板固定该档（艺术意图直接落地，不经高速批准制）；
    /// None = 随机档（现状行为，默认）
    pub speed: Option<usize>,
}

// Gemini 真经二版（2026-08-05）：阶梯加密（0.05-0.18 梯队）+ 高曲率钦定低速档
// —— 法向加速度 a_n = v²κ 与速度平方成正比：高 κ 配高 v = 巨大 Jerk 冲量（顿顿）
// 阶梯差：0.05→0.12→0.20→0.28→0.38→0.48→0.60→0.75→0.90→1.05→1.20→1.38
// （0.05-0.18，全部 < TEMPLATE_CURV_STEP 0.2——段间 |Δκ| 自然受约束）
// 高曲率（≥0.90）钦定中/低速档：surge/drift Some(1)、whirl/coil Some(0)
pub const TEMPLATES: [Template; 25] = [
    // --- 0. 轴线基准 ---
    Template { id: "run", name: "直线", curvature: 0.00, speed: None },
    // --- 1. 极微流韵 (±0.05 ~ ±0.12) ---
    Template { id: "glide_micro", name: "微平", curvature: 0.05, speed: None },
    Template { id: "glide_micro_r", name: "微平·反", curvature: -0.05, speed: None },
    Template { id: "stroll", name: "闲步", curvature: 0.12, speed: None },
    Template { id: "stroll_r", name: "闲步·反", curvature: -0.12, speed: None },
    // --- 2. 舒缓巡航 (±0.20 ~ ±0.38) ---
    Template { id: "breeze", name: "拂风", curvature: 0.20, speed: None },
    Template { id: "breeze_r", name: "拂风·反", curvature: -0.20, speed: None },
    Template { id: "ripple", name: "漪涟", curvature: 0.28, speed: None },
    Template { id: "ripple_r", name: "漪涟·反", curvature: -0.28, speed: None },
    Template { id: "glide", name: "滑翔", curvature: 0.38, speed: None },
    Template { id: "glide_r", name: "滑翔·反", curvature: -0.38, speed: None },
    // --- 3. 律动开合 (±0.48 ~ ±0.75) ---
    Template { id: "sway", name: "摇摆", curvature: 0.48, speed: None },
    Template { id: "sway_r", name: "摇摆·反", curvature: -0.48, speed: None },
    Template { id: "loop", name: "绕弧", curvature: 0.60, speed: None },
    Template { id: "loop_r", name: "绕弧·反", curvature: -0.60, speed: None },
    Template { id: "sweep", name: "漫游", curvature: 0.75, speed: None },
    Template { id: "sweep_r", name: "漫游·反", curvature: -0.75, speed: None },
    // --- 4. 疾速甩尾（高曲率钦定中速档——v²κ 降幅） ---
    Template { id: "surge", name: "涌浪", curvature: 0.90, speed: Some(1) },
    Template { id: "surge_r", name: "涌浪·反", curvature: -0.90, speed: Some(1) },
    Template { id: "drift", name: "漂移", curvature: 1.05, speed: Some(1) },
    Template { id: "drift_r", name: "漂移·反", curvature: -1.05, speed: Some(1) },
    // --- 5. 极光飞花（最高曲率钦定低速档——Jerk 最小化） ---
    Template { id: "whirl", name: "柔卷", curvature: 1.20, speed: Some(0) },
    Template { id: "whirl_r", name: "柔卷·反", curvature: -1.20, speed: Some(0) },
    Template { id: "coil", name: "灵线", curvature: 1.38, speed: Some(0) },
    Template { id: "coil_r", name: "灵线·反", curvature: -1.38, speed: Some(0) },
];

// ═══════════════════════════════════════════════════════════════════
// 【Gemini 可操作区·渲染】—— 渲染性能参数集中于此
// 本区 = engine.rs / trail.rs 的硬编码渲染字面量**纯搬家**（数值零改动）。
// 想调渲染开销/视觉精度（DPR、拖尾点数/线宽/透明度、logo 采样……）只改这里。
// 每个参数标注「Gemini 可操作」+ 现状值 + 来源文件；改前必读
// docs/render-performance.md（热点分析 + 验证方法）。
// ⚠️ 接线状态：本区常量数值 = engine.rs/trail.rs 现状字面量，一一对应；
// engine.rs/trail.rs 的引用替换在渲染模块集成时接入（机械替换，数值不变）。
// ═══════════════════════════════════════════════════════════════════

// ---- canvas / DPR（全屏填充率 = 逻辑像素 × DPR²）----
/// 【Gemini 可操作】设备像素比上限。canvas 物理像素 = clientW×dpr × clientH×dpr，
/// 每帧全量重绘的填充率随 DPR² 增长：2.0 上限下 1920×1080 屏 = 3840×2160 ≈ 830 万
/// 像素/帧。改小 → 明显降填充率（画面略糊）；改大 → 3x/4x 屏更清晰但更重。
/// 现状值 2.0（engine.rs `device_pixel_ratio().min(2.0)`）
pub const RENDER_MAX_DPR: f64 = 1.5; // Gemini 真经三号：高 DPR 屏画幅填充压力削减
/// 【Gemini 可操作】canvas 物理尺寸变更容差（px）。|物理宽/高 − 目标| ≤ 0.5 才
/// 重设 canvas 尺寸 + set_transform（防每帧 resize 抖动；也减少 set_transform 次数）。
/// 现状值 0.5（engine.rs `.abs() > 0.5`）
pub const RENDER_CANVAS_RESIZE_EPSILON: f64 = 0.5;

// ---- 球半径缩放（BALL_RADIUS 相关：radius = BALL_RADIUS×depth×(scale)）----
/// 【Gemini 可操作】窗口参考短边（px）。球半径缩放系数 = (min(w,h)/REF).clamp(MIN,MAX)：
/// 短边 700px = 原始比例，>700 放大、<700 缩小。与拖尾线宽（=2r×系数）联动。
/// 现状值 700.0（engine.rs `w.min(h) / 700.0`）
pub const RENDER_RADIUS_REF_SIZE: f64 = 700.0;
/// 【Gemini 可操作】球半径缩放下限（小屏不缩到不可见）。
/// 现状值 0.6（engine.rs `clamp(0.6, ...)`）
pub const RENDER_RADIUS_MIN_SCALE: f64 = 0.6;
/// 【Gemini 可操作】球半径缩放上限（大屏不无限放大——球/拖尾线宽受控）。
/// 现状值 1.0（engine.rs `clamp(..., 1.0)`）
pub const RENDER_RADIUS_MAX_SCALE: f64 = 1.0;

// ---- 拖尾采样（Trail / TrailMini 共用）----
/// 【Gemini 可操作】拖尾历史点上限（帧数）。超过则 pop_front 淘汰最旧点：
/// 8 点 = f525e40 手感。这是拖尾路径顶点数的直接决定项——
/// 减半（4）≈ 拖尾路径点减半（拖尾变短 + 每帧 catmull 采样减半）；
/// 注意这是渲染压力与拖尾长度的核心权衡点。
/// 现状值 8（engine.rs `h.len() > 8`；trail.rs sample_history frames 参数同样 8）
pub const TRAIL_MAX_POINTS: usize = 6; // Gemini 真经三号：-25% 路径顶点
/// 【Gemini 可操作】拖尾采样速度阈值（世界单位/秒）。速度低于此值清空拖尾
/// （静止/思考期不渲染——省绘制）。也是「速度过高时截断重建」判定的伴生阈值。
/// 现状值 0.02（trail.rs `speed_per_sec < 0.02`；engine.rs 经 sim::state.rs
/// `should_track` 的 `speed_per_sec > 0.02` 使用同一数值）
pub const TRAIL_SPEED_THRESHOLD: f64 = 0.02;
/// 【Gemini 可操作】Catmull-Rom 每段子采样数。每段历史间隔内插值点数：
/// 4 = 每历史段 4 个路径点（拖尾平滑度）；路径顶点数 ≈ TRAIL_MAX_POINTS×本值。
/// 减到 3/2 → 拖尾更「折角」但路径点更少；这是平滑度 vs 顶点数的权衡点。
/// 现状值 4（engine.rs `for s in 0..4`；trail.rs 同）
pub const TRAIL_CATMULL_SEGMENTS: usize = 3; // Gemini 真经三号：插值密度降低

// ---- 拖尾 Trail（实心大拖尾：一次 stroke 一条路径）----
/// 【Gemini 可操作】实心拖尾线宽 = 球半径 × 本系数（全宽 2r）。
/// 现状值 2.0（engine.rs `set_line_width(radius * 2.0)`；trail.rs 同）
pub const TRAIL_WIDTH_FACTOR: f64 = 2.0;

// ---- 拖尾 TrailMini（动态模糊小拖尾：每段一次 stroke，8 段 = 8 次 stroke/球）----
/// 【Gemini 可操作】头部透明度：alpha = HEAD_ALPHA × (1 − frac)，尾端渐隐到 0。
/// 现状值 0.45（engine.rs `0.45 * (1.0 - frac)`；trail.rs 同）
pub const TRAIL_MINI_HEAD_ALPHA: f64 = 0.45;
/// 【Gemini 可操作】线宽头系数：lw = 2r × (HEAD − FADE×frac)（球身处最宽）。
/// 现状值 0.6（engine.rs `0.6 - 0.4 * frac`；trail.rs 同）
pub const TRAIL_MINI_WIDTH_HEAD: f64 = 0.6;
/// 【Gemini 可操作】线宽收窄系数：沿拖尾递减（尾端收细 → 动态模糊感）。
/// 现状值 0.4（engine.rs `0.6 - 0.4 * frac`；trail.rs 同）
pub const TRAIL_MINI_WIDTH_FADE: f64 = 0.4;
/// 【Gemini 可操作】线宽下限（px）：尾端线宽不低于此（防拖尾消失）。
/// 现状值 0.5（engine.rs `lw.max(0.5)`；trail.rs 同）
pub const TRAIL_MINI_MIN_WIDTH: f64 = 0.5;

// ---- logo 活动圈采样（getBoundingClientRect 有 layout 成本，需节流）----
/// 【Gemini 可操作】每 N 帧采样一次 .heart-logo 位置。30 ≈ 0.5s 一次：
/// 采样越频繁活动圈越贴 logo（但 getBoundingClientRect 触发 layout 越频繁）。
/// 现状值 30（engine.rs `self.logo_tick % 30 == 0`）
pub const LOGO_SAMPLE_EVERY_FRAMES: u32 = 30;
/// 【Gemini 可操作】活动圆半径 = logo 中心到最近屏幕边缘的距离（1.0 = 不放大：
/// 圆与最近边相切、永不越界；去掉满屏放大——用户钦定）。
/// 现状值 1.25（engine.rs `* 1.25`）
pub const LOGO_BOUNDS_SCALE: f64 = 1.0; // 用户钦定：活动圆不放大，半径 = 到最近屏幕边缘距离
/// 【Gemini 可操作】活动圆最小半径（世界坐标，防退化）。
/// 现状值 0.08（engine.rs `r.max(0.08)`）
pub const LOGO_BOUNDS_MIN_RADIUS: f64 = 0.08;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::params::SPEED_BANDS;

    /// 曲线模板规范校验：所有模板取值必须合法（新增模板违规会在这里红）
    #[test]
    fn template_spec_validates_all() {
        assert!(TEMPLATES.len() <= 40, "模板数量上限 40（防失控）");
        let mut ids = std::collections::HashSet::new();
        for (i, t) in TEMPLATES.iter().enumerate() {
            // id：小写字母/数字/下划线，唯一，非空
            assert!(!t.id.is_empty(), "第 {i} 个模板 id 不能为空");
            assert!(
                t.id.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_'),
                "模板 {i} id '{}' 只能用小写字母/数字/下划线",
                t.id
            );
            assert!(ids.insert(t.id), "模板 id '{}' 重复", t.id);
            assert!(!t.name.is_empty(), "模板 {i} name 不能为空");
            // curvature ∈ [-1.6, 1.6]
            assert!(
                (-1.6..=1.6).contains(&t.curvature),
                "模板 '{}' curvature {} 超出 [-1.6, 1.6]",
                t.id, t.curvature
            );
            // speed：None（随机档）或索引 < SPEED_BANDS.len()（钦定档）
            assert!(
                t.speed.map_or(true, |s| s < SPEED_BANDS.len()),
                "模板 '{}' speed 档位 {:?} 越界（SPEED_BANDS 共 {} 档）",
                t.id, t.speed, SPEED_BANDS.len()
            );
        }
    }
}

