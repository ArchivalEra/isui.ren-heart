# 小球动画系统 —— 现状基线（2026-08-03）

> 本文档是重构/继续开发前的**唯一现状基线**：阶段状态机、全部变量、数据流、已知坑。
> 修改本系统前先读这里；文档与实际代码冲突时，以代码为准并更新本文档。

## 0. 一句话概括

三个小球（粉/水蓝/薄荷绿）在 canvas 上玩耍：常态各自自由跑（独立链），每 5 秒有 30% 概率触发排队（共享链），排队时粉球先跑、蓝绿思考 1-3 秒后跟上，排 8-18 秒后解散回自由。

## 1. 模块地图

```
web-rust/src/
├── lib.rs           入口；内联 mod app（App + 路由跳转）；mod config/sim（全平台）、mod animation/pages（仅 wasm32）
├── app.rs           ⚠️ 死文件！lib.rs 用内联 `mod app {}`，src/app.rs 从未编译（内容重复）
├── config/
│   ├── params.rs    全部调参常量（见 §4）—— 动画的「控制面板」
│   └── templates.rs 14 个运动模板（见 §6）
├── sim/             ⚠️ 纯逻辑层，可 cargo test（原生测试）
│   ├── math.rs      Vec2/贝塞尔/样条/缓动/投影 —— 纯函数
│   ├── planner.rs   核心：Player（弧长共享链 + PD spring）+ Phase 状态机定义
│   └── mod.rs
├── animation/       ⚠️ 仅 wasm32（依赖 web_sys）
│   ├── engine.rs    BallsEngine：渲染 + 状态机驱动（step）
│   ├── balls.rs     组件：rAF 循环 + 调试面板（拖拽/键盘/模式/坐标复制）
│   └── mod.rs
└── pages/
    ├── heart.rs     /heart 页面：Typewriter（关注 isui 谢谢喵）+ BallsAnimation + logo
    └── home.rs      /home 页面：LinkItem 卡片（tayori 的 X/YouTube/官网）
```

## 2. 领域概念（本系统的术语，改代码时用同一套词）

| 术语 | 含义 |
|------|------|
| 球 / color_slot | 0=粉 `#F09ABD`，1=水蓝 `#6EC6E6`，2=薄荷绿 `#7FC39F` |
| 链 (chain) | `VecDeque<PlannedLeg>`——无限增长的路径段队列；段间 `from = 上段 target`，切线继承 |
| 弧长 (arc) | 每段的折线长度（from→ctrl→target 两段和），弧长定位 = 沿链行走的里程表 |
| s_lead | 队首（粉球）已走的弧长；每球弧长 = `s_lead - gaps[i]` |
| 槽位 (slot) | `entry_points(anchor, dir)`：链起点 + 沿 -dir 错开 CHAIN_GAP/2×CHAIN_GAP 的三个等待点 |
| 模板 (template) | 一段路径的形状（curvature/speed/offsets/wave）|
| PD spring | 位置+速度双目标的物理追踪：`a = k×(target-pos) + c_damp×(tvel-vel)` |
| 思考期 (delay) | 排队触发后蓝绿各自冻结 1-3 秒再出发 |

## 3. 阶段状态机（Phase）

**定义在 `sim/planner.rs:406`，转移全部由 `engine.rs step()` 驱动**（planner 内部零使用——见坑 2）。

```
AtLogo(3s，球停锚点淡入)
   │ t ≥ AT_LOGO_MS → 三球各自 Player::new(anchors[i], random_dir())
   ▼
Free { players:[Player;3], check_t }        ← 常态
   │ 每帧 p.tick(dt)；check_t ≥ 5000 时掷骰
   │ rng < 0.3 → 建共享链：anchor=粉球当前位置，dir=随机
   ▼
Queueing { t, player, from:[Vec2;3], delays:[f64;3] }
   │ player.tick(dt)（粉球立刻沿链跑）
   │ 渲染：球 i = lerp(from[i], player.world_pos(i), smoothstep((t-delays[i])/2000))
   │   （思考期 t<delays[i]：冻结在 from[i]）
   │ t ≥ 6000 → std::mem::replace 取出 player
   ▼
Formation { player, hold_t, hold_ms }       ← 共享链排队跑（粉蓝绿沿链错开）
   │ player.tick(dt)；hold_t ≥ hold_ms（随机 8-18s）
   │ → 三球各自 Player::new(pos_and_dir(i))（起点=当前位置，方向=链切线）
   ▼
Free ──────────────────────────────────────（循环）
```

**Player 内部（`sim/planner.rs:39`）**：
```rust
pub struct Player {
    chain: VecDeque<PlannedLeg>,  // 弧长共享链（无限增长）
    s_lead: f64,                  // 队首弧长
    states: [BallState; 3],       // 每球 pos/vel/rate（PD spring 物理）
    gaps: [f64; 3],               // [0, CHAIN_GAP, 2×CHAIN_GAP] 沿链错开
    pub order: [usize; 3],        // 渲染排列（Formation 中随机换序）
}
```

**tick() 执行顺序（`planner.rs:99`）**：
1. `s_lead += profile_speed(seg0, u0) × dt_s`（队首沿链推进）
2. `ensure_chain()`：总弧长 < s_lead+3×GAP+0.5 时补段（模板选择：曲率连续 ≤0.35 + 高速批准制 40% + 换序 0.008）
3. 每球：`s_i = s_lead - gaps[i]`；s_i<0 → 目标=链首后方错开点（等上链）；s_i≥0 → `chain_pos_and_tangent(s_i)`（含 wave 摆动 + 边缘衰减）
4. rate 向 `profile_speed(seg_i, u_i)` 低通收敛（时间常数 0.12s）
5. PD spring 求加速度 → MAX_ACCEL(2.5) 钳制 → 积分 → pos clamp [0.03, 0.97]

**速度 profile（`planner.rs:147`）**：段内 `lerp(v_i, v_{i+1}, smoothstep(u))`——段内温和加减速，段尾速 = 下段头速（连续）。链预生成所以知道下段速度（预渲染衔接）。

## 4. 全部配置变量（config/params.rs，消费点已验证）

| 常量 | 值 | 用途 | 消费 |
|------|-----|------|------|
| BALL_COLORS | ["#F09ABD","#6EC6E6","#7FC39F"] | 粉/蓝/绿 | engine.rs:46 |
| BALL_RADIUS | 10.0 | 球半径（世界单位×投影） | engine.rs:319 |
| ORDERS | 6 种全排列 | 排列随机池 | planner.rs:93,209；engine.rs:308 |
| CHAIN_GAP | 0.15 | 沿链错开弧长 | planner.rs:56,92,163 |
| FREE_CHECK_MS | 5000 | 排队判定周期 | engine.rs:154 |
| QUEUE_PROB | 0.3 | 判定到排队的概率 | engine.rs:156 |
| QUEUE_MS | 6000 | 排队过渡总时长 | engine.rs:182 |
| QUEUE_DELAY_MIN/MAX_MS | 1000/3000 | 蓝绿思考期 | engine.rs:169-172 |
| QUEUE_TRANSIT_MS | 2000 | 思考后滑向槽位时长 | engine.rs:243 |
| FORMATION_HOLD_MIN/MAX_MS | 8000/18000 | 排队维持时长 | engine.rs:187-188 |
| TEMPLATE_CURV_STEP | 0.35 | 模板切换曲率最大变化 | planner.rs:181,197 |
| SPEED_THRESHOLD / SPEED_APPROVE_PROB | 1.2 / 0.4 | 高速模板批准制 | planner.rs:190-196 |
| TRAIL_MAX_SEG | 0.12 | 拖尾历史点最大间距（超则清空重建） | engine.rs:104 |
| MAX_DUR_RATIO | 2.5 | 相邻段时长比上限 | planner.rs:393 |
| PROB | {switch_template:0.4, switch_order:0.008} | 模板切换/换序概率 | planner.rs:177,208 |
| WORLD_SPEED | 0.22 | 基准速度（世界单位/秒） | planner.rs:83-85,156,362 |
| SPRING | {stiffness:700, damping:0.9} | PD spring 参数（androidx 实证来源） | planner.rs:106 |
| MAX_ACCEL | 2.5 | spring 加速度上限 | planner.rs:134 |
| WANDER | {offset_lerp:0.04, offset_range:0.05} | 法线偏移缓动 | engine.rs:197；planner.rs:282 |
| FADE_IN_MS / AT_LOGO_MS | 800 / 3000 | 入场淡入/停留 | engine.rs:253,138 |
| ANCHORS | (0.555,0.355),(0.473,0.379),(0.525,0.471) | 球初始坐标（站主实测） | engine.rs:50 |
| ELLIPSE | {max_ratio:2.6, speed_base:0.008, threshold:0.45} | 粒子模式椭圆拉伸 | engine.rs:328-330 |
| MOTION_BLUR | {trail_len:3.0, trail_alpha:0.3} | 粒子模式尾迹 | engine.rs:340,345 |

**运行时状态（engine.rs BallsEngine）**：`balls[3]{offset,color}`、`prev_pos[3]`、`phase`、`anchors[3]`（调试可拖）、`debug`、`mode`（Particle/Trail）、`history[3]`（拖尾点 VecDeque<(f64,f64)>，上限硬编码 8）。

## 5. 一帧的数据流（engine.rs frame:88）

```
balls.rs rAF(dt≈16.7ms)
  → engine.frame(dt)
      ① step(dt)              状态机推进（§3）
      ② render()              读 phase/balls/history → canvas
      ③ prev_pos[s] = ball_world_pos(s)   （注意：render 用旧 prev_pos 算速度）
         按 playing 阶段推 history（间距>0.12 清空，上限 8）
```

**ball_world_pos 按阶段**（engine.rs:236）：
- AtLogo → `anchors[slot]`
- Free → `players[slot].world_pos(slot, offset)`
- Queueing → `lerp(from[slot], player.world_pos(slot), smoothstep((t-delays[slot])/2000))`
- Formation → `player.world_pos(slot, offset)`

**world_pos（planner.rs:270）** = spring 物理 pos + 法线 × offset × 0.05（offset 每帧向模板 offsets[i] 缓动，仅 Formation 中）。

**渲染顺序**：深度排序（屏幕 y）→ 地面线 → 每球：拖尾（Catmull-Rom 过点样条，宽 2×radius×depth）/ 椭圆拉伸（Particle）→ 阴影 → 径向渐变球体。logo 层在 canvas 之上（CSS）。

## 6. 14 个运动模板（templates.rs:27）

| id | curvature | speed | offsets[粉,蓝,绿] | wave |
|----|-----------|-------|-------------------|------|
| run 直线跑 | 0.0 | 1.1 | [0, 0.6, -0.6] | 0 |
| sweep 大转弯 | 0.65 | 1.0 | [0, 0.5, -0.5] | 0 |
| wiggle 小碎步 | 0.22 | 1.2 | [0, 0.4, 0.4] | 0.012 |
| glide 滑翔 | 0.35 | 0.85 | [0, 0.8, -0.8] | 0.02 |
| sprint 冲刺 | 0.08 | 1.6 | [0, 0.3, -0.3] | 0 |
| sway 摇摆 | 0.5 | 0.9 | [0, 0.5, 0.5] | 0.045 |
| loop 绕圈 | 0.6 | 0.95 | [0, 0.6, -0.6] | 0 |
| zigzag 锯齿 | -0.4 | 1.15 | [0.3, 0, -0.3] | 0.06 |
| crawl 慢爬 | 0.18 | 0.55 | [0, 0.4, -0.4] | 0.008 |
| dash 折返 | -0.55 | 1.4 | [0, 0.5, -0.5] | 0.03 |
| drift 漂移 | 0.75 | 1.3 | [0.4, -0.2, 0.2] | 0.015 |
| stroll 散步 | 0.12 | 0.7 | [0, 0.5, 0.5] | 0.005 |
| coil 线圈 | 1.5 | 1.05 | [0, 0.6, -0.6] | 0.20 |
| coil_r 反向线圈 | -1.5 | 0.95 | [0, 0.5, 0.5] | 0.22 |

curvature >1 会显著弯折（coil）；wave 是段内法线摆动（有边缘衰减保护）。

## 7. 已知坑（踩过的雷，改代码前必读）

1. **python str.replace 静默失败**：改代码用 edit_file/multi_edit（带验证），别用 python 无检查替换——曾导致 ANCHORS 坐标"改了但没生效"。
2. **Phase 跨文件**：Phase 定义在 planner.rs，22 处匹配在 engine.rs；改字段要两处同步（曾两次改错文件）。重构方向：Phase 移出或 engine 只依赖方法。
3. **注释过时**：Phase 文档注释还写着"判定后 5 秒过渡"（实际 6000ms + 思考期）；planner.rs 头部"无排队仪式"与实际 Queueing 矛盾。
4. **Free 阶段 `[Player;3]` 浪费**：每个 Player 有 3 个 BallState，但 Free 只用 states[i]（2/3 浪费）。
5. **`template_idx(_color_slot)` 参数是死的**：三球共享链头模板的 offsets。
6. **边界处理不一致**：`set_anchor` 用 `if i<3`、`anchor` 用 `i.min(2)`、`world_pos` 直接索引（越界 panic）。
7. **首帧速度假象**：prev_pos 初始 (0.5,0.5)，Particle 首帧画出从屏幕中心的大尾迹。
8. **heart.rs 打字机 bug**：`count <= text.len()` 用 UTF-8 字节数（"关注isui谢谢喵"=23 字节），停顿 2.7s；set_interval 不清理（Effect 泄漏）。
9. **魔法数字**：history 上限 8、rate_lerp 0.12、Particle fade>0.9。
10. **offset 缓动非 dt 归一化**（帧率相关）。

## 8. 测试覆盖（原生 cargo test，14 个全绿）

- math.rs 7 个：贝塞尔端点/中点/退化切线、法线、Catmull-Rom 过点、smoothstep、投影
- planner.rs 7 个：段端点保持、entry_points 错开、**永不出屏（120s 模拟）**、**永不停（无限轨迹）**、**成群结对（弧长错开+距离<0.6）**、链无限增长、时长随路径缩放

**无测试**：engine.rs 状态机转移（Free→Queueing→Formation→Free）、渲染、调试面板——状态机是唯一无覆盖的核心路径（依赖 web_sys，未抽纯逻辑）。
