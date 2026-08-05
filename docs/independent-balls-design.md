# 独立球重构契约（Independent Balls）

> 目标：三球从「单链火车编队」改为「一球一链 + 蓝绿低优先级跟随粉球」。
> 本文件是并发子代理的唯一契约——API 签名、状态机、删除/保留清单、测试清单全部以此为准。
> 子代理实现与本文件冲突时，以本文件为准；发现本文件错误时停下问父代理，不要自行发挥。

## 1. 背景

现状（回滚基线）：`Player` 管理一条链 + 三球状态（`states: [BallState; 3]`），三球沿同一条链错开弧长（`s_lead - gaps[s]`）——火车编队「一起动」。用户否决：蓝绿必须有**自己的灵魂**（独立自由巡航），跟随粉球只是**低优先级任务**（偶尔跟、跟腻了就松开）。

## 2. 新架构

```
state.rs: State { balls: [Ball; 3] }
Ball { player: Player（一球一链）, mode: BallMode, follow_timer: f64, ... }
BallMode { Free, FollowPink }
```

- **粉球（ball[0]）**：只有 Free + 回家仪式（Homeward→Resting→Queueing 保留现有逻辑——粉球每 30s 回锚点）。不参与 FollowPink。
- **蓝绿（ball[1]/ball[2]）**：Free = 自己的链自由巡航（各自独立生成链——**不是**粉球链的复制）；FollowPink = 跟随粉球（见 §4）。
- **跟随实现 = external target 注入**（避免链引用借用问题）：跟随目标由 state.rs 每帧用粉球的链计算，注入 `player.tick(dt, Some(ext))`。Player 不持有其他球链的引用。

## 3. Player 单球化 API（planner.rs 契约）

现有 `Player`（三球共链）改造成**单球 Player**。删除：`states: [BallState; 3]`、`gaps: [f64; 3]`、`order`、`ema_targets: [Vec2; 3]`。新增/保留如下：

```rust
// —— 跟随注入目标（state.rs 每帧计算）——
#[derive(Clone, Copy)]
pub struct ExtTarget {
    pub pos: Vec2,   // 目标位置（粉球链上落后弧长处 + Frenet 偏移——由 state.rs 算好）
    pub tvel: Vec2,  // 目标速度（切线×链速——跟随期间球的显示速度）
}

impl Player {
    /// 单球 Player：一条自己的链。anchor = 起点锚点（蓝绿用自己锚点）
    pub fn new(anchor: Vec2, dir: Vec2) -> Player;

    /// 每帧步进。ext = Some 时：位置 = EMA(ext.pos)（云中心——EMA 唯一，native/Chain 已删），
    /// 速度 = ext.tvel——本球链冻结（s_lead 不推进）；ext = None 时：自由模式——
    /// 本球链推进 + 贴链（现有逻辑搬入，s_lead += profile_speed × dt）
    pub fn tick(&mut self, dt: f64, ext: Option<ExtTarget>);

    /// 本球当前位置
    pub fn pos(&self) -> Vec2;
    /// 本球速度（渲染/拖尾用）
    pub fn vel(&self) -> Vec2;
    /// 本球位置切线（归一化——渲染/拖尾用）
    pub fn tangent(&self) -> Vec2;

    /// 自由链预生成（现有 ensure_chain_to 语义保留：批量补链到 ahead）
    pub fn ensure_chain_to(&mut self, ahead: f64);

    /// 链上弧长 s 处：位置 + 切线 + 段索引 + 段内 u（现有 chain_pos_and_tangent 包装）
    pub fn chain_point(&self, s: f64) -> (Vec2, Vec2, usize, f64);

    /// 自由链当前总弧长
    pub fn chain_arc(&self) -> f64;

    /// 链上离 point 最近弧长（跟随退出时定位用——分段线性查找，便宜）
    pub fn nearest_arc(&self, point: Vec2) -> f64;

    /// 现有贴链/spring/EMA/云中心/调速器逻辑全部保留（单球版）——
    /// profile（ACTIVE_PROFILE）字段照旧使用
}
```

实现要点：
- 云中心模式（CLOUD_PROFILE，EMA 唯一——NATIVE/Chain 已删）：自由模式的目标 = 本球链上点 + Frenet 偏移 + EMA（现有逻辑搬入，`ema_target` 单份）；跟随模式（ext=Some）的目标 = ext.pos 直接进 EMA。
- `tick(dt, Some(ext))` 与 `tick(dt, None)` 切换时位置连续性由 state.rs 保证（§5 退出平滑），Player 不做额外过渡。
- **现有 `Player` 的测试**（gaps/队形相关）删除；链生成规则测试（ChainBuilder 相关）保留并迁移到单球语义。

## 4. 蓝绿状态机（state.rs 契约）

```rust
pub enum BallMode { Free, FollowPink }

pub struct Ball {
    pub player: Player,
    pub mode: BallMode,
    pub follow_t: f64,      // FollowPink 已持续时间（ms）
    pub check_t: f64,       // 距上次「是否跟随」判定（ms）
    pub follow_gap: f64,    // 本次跟随的落后弧长（随机 0.1-0.3）
}

impl State {
    // 现有 Phase 大改：去掉 Formation（队形）/Queueing 的队形语义——
    // 粉球保留 Homeward/Resting/Queueing（回家仪式），蓝绿无队形状态
    pub fn tick(&mut self, dt: f64) { ... }
}
```

状态转移（**蓝绿**）：
- Free 中：`check_t` 累计，每 `FOLLOW_CHECK_MS`（5000）判定一次：随机 < `FOLLOW_PROB`（0.3）→ 进入 FollowPink（`follow_gap = 0.1 + rng×0.2`，`follow_t = 0`）；否则 `check_t` 清零继续 Free。
- FollowPink 中：每帧目标 = `pink.chain_point(pink.s_lead - follow_gap)` + Frenet 偏移（FORMATION_OFFSETS[s]×offset_scale）+ 切线×粉球链速 → 构造 `ExtTarget` 注入 `player.tick(dt, Some(ext))`。
- 跟随时长到（`follow_t ≥ FOLLOW_DUR_MS`，随机 5000-20000）：退出回 Free。
- **粉球回家期间**（Phase 非 Formation/巡航——Homeward/Resting/Queueing）：蓝绿不跟随——已 FollowPink 的立即松开回 Free。
- 粉球无 FollowPink 逻辑。

退出平滑（**state.rs 负责**）：松开瞬间——Free 自由链从 `nearest_arc(当前位置)` 继续（`player.s_lead = nearest_arc`，然后 ext=None 正常推进）——位置不跳（nearest_arc 的链上点与当前位置距离 < 0.08 即视为平滑；若 > 0.08 用现有 spring 拉近一帧过渡）。

参数（params.rs 新增，值如下）：
```rust
pub const FOLLOW_CHECK_MS: f64 = 5000.0;      // 跟随判定间隔
pub const FOLLOW_PROB: f64 = 0.3;             // 判定进入跟随的概率
pub const FOLLOW_DUR_MIN_MS: f64 = 5000.0;    // 跟随最短时长
pub const FOLLOW_DUR_MAX_MS: f64 = 20000.0;   // 跟随最长时长
```

## 5. 删除清单（火车残留——全部移除）

- planner.rs：`gaps`、`order`、`ORDERS` 相关（`switch_order`/`PROB.switch_order`/`ORDER` 枚举）、三球 `states`/`ema_targets` 数组化
- state.rs：`Phase::Formation`（队形巡航）、Queueing 的排队语义（粉球的 Queueing 保留——delay 后启动链）
- params.rs：`CHAIN_GAP`（跟随 gap 代替）、`ORDERS`、`PROB.switch_order`
- 相关测试（排队/换顺序/队形）删除或改语义

## 6. 保留清单（不得动）

- ChainBuilder（sim/chain.rs）——自由链生成直接复用
- 贴链/spring/EMA/云中心 Frenet 偏移逻辑（单球化搬移，数值不变）
- 回家仪式（粉球：Homeward→Resting→Queueing，HOME_* 参数）
- logo 游走段（每球自由链各自都有）
- 调速器（tune_tail——每球各自）
- MotionProfile（profile.rs——候选 B 成果，字段照旧）
- web-ui/ 目录零改动

## 7. 测试清单（各子代理在各自文件内写）

A（planner.rs 单球 Player）：
1. `single_ball_free_cruises`：Free 模式 30s 链推进——位置/速度合理（无跳变）
2. `single_ball_follows_ext_target`：ext=Some 时位置 ≈ ext.pos（误差 < 0.05，EMA 收敛后）
3. `nearest_arc_located`：随机点最近弧长——链上点与点距离 < 0.1
4. 链生成规则测试（ChainBuilder 契约）迁移为单球语义（原有规则测试保留）

B（state.rs 三球状态机）：
1. `blue_green_free_independent`：Free 模式两球链各自独立（链序列不同、位置轨迹不重合）
2. `follow_triggers_and_tracks`：模拟固定随机序列——蓝绿进入 FollowPink，位置 ≈ 粉球链落后 gap 处（误差 < 0.05）
3. `follow_exits_smoothly`：时长到退出——位置无跳变（< 0.08）
4. `pink_homecoming_kept`：粉球 30s 回家仪式保留（粉先到→定住→重启）
5. `blue_green_release_on_pink_home`：粉球回家期间蓝绿全部 Free
6. `lifecycle_90s_no_teleport`：三球 90s 无跳变（每帧位移 < 0.08）

## 8. 红线

- 不改任何现有数值（HOME_*/LOGO_*/SPEED_BANDS/SPRING 等——跟随参数是新加的）
- 不碰 web-ui/、不碰 sim/chain.rs（ChainBuilder 零改动）
- 蓝绿自由链必须独立生成（不是粉球链的复制）
- 测试全绿 + 中文提交
- 编译通过（cd web-rust && CARGO_BUILD_JOBS=1 cargo test）

## 9. 参考

- docs/agent-handoff.md（架构全貌/参数表/历史教训）
- web-rust/src/sim/chain.rs（ChainBuilder——自由链生成）
- web-rust/src/sim/planner.rs（现有 Player——本次改造对象）
- web-rust/src/sim/state.rs（现有状态机——本次改造对象）
- web-rust/src/sim/cloud.rs（follower_target/ema_step——跟随偏移复用）
