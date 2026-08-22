# 回家链段化契约（/heart 收尾）

> [OK] **已完成**（/heart 收尾验收通过）——本文档作为本次收尾的契约存档保留。
> 实现/运行态见 docs/agent-handoff.md（回家链段化 + 渲染可操作区说明）与
> web-rust/src/config/params.rs【Gemini 可操作区·渲染】。

> 目标：三球"清楚知道自己哪一秒开始回家"——回家动作不可被认出。
> 现状问题：Homeward 触发瞬间球从巡航链"断开"改走 HomeLeg 贝塞尔——高速猛冲
> 时突然顿住再划弧线（速度不连续 + 位置模式切换 = 可被认出的"回家动作"）。
> 方案：**回家弧线变成链的延伸段**（拟合助手与 planner 结合）——球继续贴链，
> 速度连续（tune 平滑），链尾精确 = 锚点——回家 = 自然巡航到链尾。
> 本文件是并发子代理的唯一契约。冲突以本文件为准；发现错误停下问父代理。

## 1. 新回家机制（A 实现）

### Player 新增（planner.rs）：
```rust
/// 回家链段化：把当前位置→锚点的回家弧线作为链的延伸段 push 进 chain——
/// 球继续 tick(None) 贴链（位置/速度连续——不顿）。链尾精确 = anchor。
/// 返回回家段总弧长（Phase 到家判定的超时兜底用）。
pub fn extend_home_chain(&mut self, anchor: Vec2) -> f64 {
    let pos = self.pos();
    let dist = |anchor - pos|;
    if dist < 0.03 { self.snap(anchor); return 0.0; }
    let dir = self.tangent(); // 巡航切线（C1 连续锚点）
    // 段 1：从当前位置沿 dir 平滑弯出（中曲率模板）——目标 = 中途点
    // 中途点 = pos 与 anchor 中点 + dir×(dist×0.15)（保证沿 dir 出发）
    let mid = pos + (anchor - pos)×0.5 + dir×(dist×0.15)（clamp 屏内 0.04-0.96）;
    // 段 2：从中途点精确弯向 anchor（段间切线继承——同巡航链同构）
    // 模板：curvature ≈ 0.4-0.6 的中曲率模板（从 TEMPLATES 找 id 含 loop/sway 或
    //   按 curvature 绝对值范围 [0.4, 0.6] 检索——找不到用索引固定值）
    // speed：回家段钦定慢速档 Some(0)（回家 = 慢下来回家；tune 平滑衔接巡航速度）
    //   段 1/段 2 都 make_planned_leg（或 make_blend_leg）——复用现有几何工厂
    // push 进 chain（clamp_dur_to_chain 同现有逻辑）
    // 返回两段 arc 之和
}

/// 是否已到家（s_lead ≥ 链总弧长 - ε）
pub fn at_chain_end(&self) -> bool {
    self.s_lead >= self.chain_arc() - 1e-6
}
```
- 关键：**回家段从 dir（巡航切线）出发**（C1 连续——拟合助手精神）；
  **速度连续**由现有 tune（调速器）保证（回家段 speed=Some(0) 慢档——
  tune savgol + SEG_V_DELTA 钳制把高速巡航平滑过渡到慢速）；
  链尾 = anchor（精确命中——make_planned_leg 的 curv_c 反推保证段尾命中 target）。
- 删除：`HomeLeg` struct、`quad_home()`、`Phase::Homeward { home: Option<HomeLeg> }`
  的弧线推进（Phase::Homeward 保留但只做"等 at_chain_end + 超时兜底"）。

### state.rs 改造：
- 粉球：Homeward 触发时 `player.extend_home_chain(anchor)` →
  之后每帧 `player.tick(dt, None)`（贴链走回家段）→
  `at_chain_end() || t > HOME_DURATION_MS×2`（超时兜底）→ Resting（snap 锚点已由链尾保证）。
- 蓝绿：BallMode::Homeward 同样（extend_home_chain → tick(None) → at_chain_end → Resting）。
- Homeward 阶段不再有"弧线推进"（位置 = 贴链结果）。
- HOME_DURATION_MS 参数保留（超时兜底）——语义注释更新。

### 测试（A 写）：
1. `home_chain_reaches_anchor`：extend_home_chain 后 tick 推进 → 链尾位置 = anchor（< 0.01）
2. `home_chain_c1_continuous`：回家段首段 from 切线 = 巡航切线（夹角 < 15°）
3. `home_chain_speed_continuous`：Homeward 触发帧前后帧位移连续（< 0.08——lifecycle 已覆盖，本测试断言触发帧）
4. 现有测试适配：pink_homecoming_kept / blue_green_homecoming / follow_*（HomeLeg 删除后
   Phase::Homeward 结构变化——mode 断言/位置断言按新机制）

## 2. 删 profile（B 实现）

- profile.rs：删 `NATIVE_PROFILE`、`ACTIVE_IDX`、`PROFILES`、`active()`、`toggle_active()`、
  `FollowStyle::Chain` 变体（枚举保留单变体 CloudEma 或直接删枚举——由 A 的引用决定）。
  保留：`MotionProfile`（结构）、`CLOUD_PROFILE`、`ACTIVE_PROFILE`（= CLOUD_PROFILE const）。
- planner.rs 的 Chain 跟随分支删除 + `active()` 引用改 `ACTIVE_PROFILE`（**A 做**——
  A 独占 planner.rs）。
- params.rs 的手感别名（`ACTIVE_PROFILE.xxx` const）**保留不动**（ACTIVE_PROFILE 还在）。
- 测试：profile.rs 的 `profile_hot_switch_flips_style` 删；
  planner.rs 的 `tick_uses_runtime_active_profile` 删（**A 做**）。

## 3. 热重载删 + 拖尾热切换保留（C 实现）

- engine.rs：删 `install_keyboard_shortcuts` 的 profile 切换（P 键不再切 profile）。
- **P 键改为拖尾 RenderMode 热切换**（Trail ↔ TrailMini）——**保留**。
- **铁律**：切换只翻渲染层 mode 字段——不触任何 sim/状态逻辑——
  实现后自查（grep 确认 mode 切换路径无 state/player 调用）。
- 拖尾热切换的用户可见行为不变（切换瞬间拖尾视觉切换，其他零变化）。

## 4. 渲染性能可操作区 + 观测报告（D + F）

- D：params.rs 新增【Gemini 可操作区·渲染】段——把 engine.rs/trail.rs 的硬编码
  渲染参数集中（canvas DPR、尺寸缩放、BALL_RADIUS 相关、拖尾点数/间距——
  现状散落的都收进来；**数值不变**——纯搬家）。
- D：写 docs/render-performance.md（渲染性能观测报告——给 Gemini 的输入：
  现象（动画渲染压力大）、渲染管线现状（每帧 clear+全量重绘、拖尾段数、
  canvas 尺寸/DPR、设备像素比处理）、可疑热点（F 提供数据）、Gemini 可操作参数清单）。
- F（只读）：调查 engine.rs/trail.rs 的渲染热点——每帧绘制调用数、拖尾顶点数、
  canvas 尺寸/DPR 处理、clear 策略——给 D 的数据。

## 5. 文档更新（E 实现）

- docs/agent-handoff.md：删 profile 热切换（P 键）、NATIVE profile 相关内容；
  加回家链段化机制；更新测试数（预计 56 → ~54）。
- docs/independent-balls-design.md：HomeLeg → 链段化更新（如果文档提到 HomeLeg）。

## 6. 红线

- 数值零改动（HOME_*/FOLLOW_*/TEMPLATES/SPEED_BANDS 等——回家段 speed=Some(0)
  是新增行为参数——允许）
- 不碰 web-ui/
- 回家动作可被认出的问题必须解决（C1 连续 + 速度连续——测试焊死）
- 拖尾热切换保持纯渲染（无逻辑耦合）
- cd web-rust && CARGO_BUILD_JOBS=1 cargo test 全绿（父代理集成执行；
  子代理无 shell 就静态核对 + 说明预期）
- 中文提交信息（父代理提交）

## 7. 文件所有权（并行不冲突）

- A：web-rust/src/sim/planner.rs、web-rust/src/sim/state.rs
- B：web-rust/src/config/profile.rs
- C：web-rust/src/animation/engine.rs、web-rust/src/animation/trail.rs（如需要）
- D：web-rust/src/config/params.rs、docs/render-performance.md
- E：docs/agent-handoff.md、docs/independent-balls-design.md
- F：只读（engine.rs/trail.rs 渲染热点调查——输出给 D）

## 8. 集成顺序（父代理）

1. F 完成（D 需要数据）→ D 写报告
2. 全部完成后：cargo check 修编译（A/B 的删 Chain 分支 vs FollowStyle 枚举的
   顺序冲突在集成时统一）→ cargo test 修 → 稳定性复跑 → ./build.sh → 提交
