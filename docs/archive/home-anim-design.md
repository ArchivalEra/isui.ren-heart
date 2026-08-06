# 回家预渲染契约（Home Anim Pre-render——"三球一起等"方案）

> 状态：**已定稿（并发子代理唯一契约）**——B/C/D 实施 + 父代理集成（§7）
> 尚未落地（当前代码仍为链段化基线：plan_home_legs / extend_home_chain）；
> 待 §6 全量验证（cargo test 全绿）完成后，本文件转「已实施（归档）」。
> 目标：**彻底终结回家的性能/同步/感叹号问题**——回家 = 预渲染动画。
> 三球触发回家时一次性生成"当前位置→锚点"的平滑动画路径（时间对齐——
> 同时到家），播放期间只查表（O(1)/帧），播完三球同时 Resting → 同时重启。
> 本文件是并发子代理的唯一契约。冲突以本文件为准；契约错误停下问父代理。

## 1. 新机制（替代链段化回家的运行时部分）

```
回家触发（粉球 Cruise t ≥ HOME_EVERY_MS——唯一计时源）：
1. starts = 三球当前位置；anchors = 三球锚点
2. anim = home::plan_home_anim(starts, anchors)   // 一次性生成（纯函数）
3. 粉球 Phase::Homeward { t: 0, anim }；蓝绿 mode 全部 → BallMode::Homeward
   （三球共享同一 anim——同步播放）
4. Homeward 期间（每帧）：pos[s] = anim.sample(t)——t += dt
5. t ≥ anim.dur_ms：三球同时 → Resting（粉球 phase + 蓝绿 mode）→
   HOME_REST_MS → Queueing（1s）→ 同时重启（粉球 Cruise / 蓝绿 Free）
```

## 2. sim/home.rs 改造（B 实现——Gemini 战场延续）

```rust
/// 回家动画（预渲染——三球时间对齐）
pub struct HomeAnim {
    /// 每球一条 Bézier 路径（from → ctrl → anchor）
    pub paths: [HomePath; 3],
    /// 动画时长（ms——三球相同——同时到家）
    pub dur_ms: f64,
}
pub struct HomePath {
    pub from: Vec2,
    pub ctrl: Vec2,
    pub anchor: Vec2,
}

/// 生成回家动画（纯函数——Gemini 可操作：弧线形状/时长/缓动）
/// - ctrl = 中点 + 法线偏移×性格弧度（PERSONALITIES[s].curv_bias——
///   爱大弯的球弧度大——个性保留）
/// - dur_ms = HOME_ANIM_MS（params.rs）
/// - 契约测试（home_plan_contract 升级）：
///   ① sample(dur_ms) = anchors（同时到家——精确）
///   ② 路径采样切线连续（无折角——拖尾无感叹号）
///   ③ 起止速度 ≈ 0（ease-in-out——温和）
pub fn plan_home_anim(starts: [Vec2; 3], anchors: [Vec2; 3]) -> HomeAnim;

impl HomeAnim {
    /// 播放采样（O(1)/帧——每球一次 quad_bezier）
    /// 缓动：ease_in_out(t/dur)（smoothstep——起止速度 0）
    pub fn sample(&self, t_ms: f64) -> [Vec2; 3];
}
```

## 3. sim/state.rs 集成（C 实现）

- `Phase::Homeward { t: f64, anim: Option<HomeAnim> }`（替换 `home: Option<HomeLeg>`）
- 回家触发（Cruise t ≥ HOME_EVERY_MS）：
  - `let anim = home::plan_home_anim(三球 pos, anchors)`；
  - 粉球 phase → Homeward；**蓝绿 mode 全部 → Homeward**（同步）
  - **删蓝绿独立 cycle_t 回家**（回家唯一计时 = 粉球 Cruise——蓝绿不再自己触发；
    cycle_t 字段删除——跟随判定 check_t 保留）
- Homeward 期间（粉球 tick_pink + 蓝绿 tick_blue_green 的 Homeward 分支）：
  - `t += dt`；`pos[s] = anim.sample(t)`；`player.snap(pos)`（每球）
  - `t ≥ anim.dur_ms` → 三球同时 Resting（snap 锚点）
- Resting/Queueing：三球同时推进（粉球 phase + 蓝绿 mode——**时间对齐**
  ——同一 HOME_REST_MS / QUEUE_DELAY_MIN_MS 窗口）
- 重启：粉球 Queueing → Cruise（新链）；蓝绿 Queueing → Free（新链）——
  **同帧**
- **删**：extend_home_chain / at_chain_end / home_mode / 截断逻辑（链段化
  运行时全部退役——home.rs 不再有 plan_home_legs——被 plan_home_anim 取代）
  ——**planner.rs 的相关代码删除**（B 或父代理——**契约：C 动 state.rs；
  planner.rs 的删除由父代理集成时做**——B/C 不碰 planner.rs）
- 测试适配：pink_homecoming_kept / blue_green_homecoming / home_sync_with_pink
  （新机制：三球同时 Resting——断言"同帧同步"重新可行——不再擦边）

## 4. params.rs（D 实现）

- 新增 `HOME_ANIM_MS: f64 = 2500.0`（回家动画时长——Gemini 可调）
- `HOME_DURATION_MS` 保留（语义变"动画时长的兼容别名"或删除——**删除**
  （被 HOME_ANIM_MS 取代——引用处更新）
- **删**：`FOLLOW_CHECK_MS/FOLLOW_PROB/FOLLOW_DUR_*` **保留**（跟随判定还在——
  follow_prob 用 PERSONALITIES）；`HOME_STAGGER_MS` 删除（不再错开）
- 数值零改动（除删除/新增）

## 5. 文件所有权（并行不冲突）

- A：web-ui/src/Heart.tsx（emoji 打字机 typed.js 残留 → 轻量自研——
  rAF + textContent——与 Typewriter.tsx 同方案）
- B：web-rust/src/sim/home.rs（plan_home_anim + HomeAnim + 测试）
- C：web-rust/src/sim/state.rs（统一回家仪式 + 测试适配）
- D：web-rust/src/config/params.rs（HOME_ANIM_MS + 删除项）
- E：docs（gemini-workbench.md 更新——回家战场说明：home.rs = 预渲染路径；
  测试数更新）
- F：只读审查（planner.rs 的链段化退役清单——extend_home_chain/at_chain_end/
  home_mode/截断——哪些删除哪些保留——给父代理集成）

## 6. 红线

- 数值零改动（除契约列出的删除/新增）
- 不碰 web-ui/（A 独占 Heart.tsx）；不碰 chain.rs（ChainBuilder 保留）
- 回家 = 预渲染后：三球**必须同时**到家/Resting/重启（测试焊死）
- 播放期间 O(1)/帧（sample 查表——性能终结）
- cd web-rust && CARGO_BUILD_JOBS=1 cargo test 全绿（父代理集成；
  子代理静态核对 + 说明预期）；中文提交信息

## 7. 集成顺序（父代理）

1. F 清单 → 父代理删 planner.rs 链段化退役代码
2. B/C/D 完成后：编译修（API 对齐）→ 测试修 → 稳定性 → build → 提交
