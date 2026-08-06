# 渲染性能观测报告（给 Gemini 师傅的渲染优化输入）

> 现象：动画渲染压力大（用户观察）——三球 + 拖尾的每帧全量重绘在部分设备
> （高 DPR 屏 / 低端 GPU）上可感知帧率波动、发热。
> 本报告 = 渲染管线现状 + 可疑热点 + **Gemini 可操作参数清单** + 验证方法，
> 供渲染层优化参考。
> ⚠️ 运动数学「顿顿」问题已由 docs/stutter-report.md 覆盖（已排除渲染层）；
> 本报告只谈**渲染层绘制开销**，两者正交。

---

## 1. 现象

- 用户观察：动画渲染压力大——三球长时间巡航时绘制负载居高不下。
- 压力来源结构性存在：**每帧 clear 全屏 + 全量重绘**（无离屏缓存、无脏矩形），
  且 canvas 物理像素随 DPR 平方放大。
- 本报告发布时**无运行期帧率数据**（D 子代理无 shell）：以下现状与热点均为
  对 `web-rust/src/animation/engine.rs` / `trail.rs` 的**代码静态统计**。

## 2. 渲染管线现状

### 2.1 每帧流程（engine.rs `frame()`）

```
state.step(dt)   // sim 逻辑（不占渲染）
render()         // 全量重绘：clear 全屏 → 3 球（拖尾 + 球体）
history 采样     // 每球 push 位置历史（上限 8 点，世界坐标）
```

- 历史点采样：球速 > 0.02（world/s）才采样；超过 8 点 pop_front 淘汰最旧。
- 间距截断：与最新点距离 > `TRAIL_MAX_SEG`(0.12) → 清空重建（防大长条）。

### 2.2 canvas 尺寸 / DPR 处理

- 逻辑尺寸 = `clientWidth / clientHeight`（CSS 像素）。
- **DPR = `min(devicePixelRatio, 2.0)`**（engine.rs render()）——
  `RENDER_MAX_DPR` 上限：3x/4x 屏不追满，填充率可控在 4× 逻辑像素以内。
- 物理尺寸 = 逻辑 × DPR（round）；`|物理宽/高 − 目标| > 0.5` 才重设
  `canvas.width/height` + `set_transform`（`RENDER_CANVAS_RESIZE_EPSILON`）。
- 每帧都会调用 `devicePixelRatio()` 并做一次尺寸比较（成本极低）。

### 2.3 clear 策略

- 每帧 `clearRect(0, 0, w, h)` **全屏清除**，然后全量重绘；无脏矩形/增量。
- 像素吞吐示例：1920×1080 屏 @ DPR 2 → 物理 3840×2160 ≈ **830 万像素/帧**
  （≈ 60fps 时 5 亿像素/秒）；4K 屏 @ DPR 2 → 约 3318 万像素/帧。

### 2.4 每帧绘制调用统计（静态推导，Trail 默认模式）

| 项目 | Trail（默认） | TrailMini |
|---|---|---|
| clear_rect | 1 | 1 |
| 拖尾 stroke | 3（每球 1 条整路径） | **24**（每球 8 段各 1 次） |
| 拖尾路径点/球 | 8 段 × 4 子采样 = 32 | 8 段 × 4 = 32（拆成 8 次 stroke） |
| set_stroke_style | 3（每球 1） | 24（每段 1，含 format! 字符串分配） |
| set_line_width | 3 | 24 |
| catmull_rom 计算 | 96 次（3×8×4，wasm 纯算术，成本低） | 同左 |
| 球体 | 3 × (save + global_alpha + arc + set_fill_style + fill + restore) | 同左 |

- 拖尾顶点数 = `TRAIL_MAX_POINTS`(8) × `TRAIL_CATMULL_SEGMENTS`(4) ≈ 32 路径点/球。
- TrailMini 每段还做一次 `format!("rgba(r,g,b,a:.3)")` 字符串分配（每帧 24 次）。

### 2.5 球体绘制

- 每球每帧：`save` + `set_global_alpha(fade)` + `begin_path` + `arc` + `set_fill_style` + `fill` + `restore`。
- `fill` 是 canvas 2D 光栅化重命令；深度排序（按屏幕 y）后从后往前画。

## 3. 可疑热点（按嫌疑排序，代码静态判断）

1. **全屏高 DPR canvas + 每帧全量重绘**（最大嫌疑）
   - 物理像素 = 逻辑像素 × DPR²；DPR 2 时每帧 clear + 重绘 4× 逻辑像素。
   - 低端 GPU / 高分屏 = 填充率瓶颈；画面内容简单（3 球 + 3 拖尾）却整屏刷新。
   - 优化方向：`RENDER_MAX_DPR` 下调、离屏缓存静态背景、脏矩形（均需改代码）。

2. **TrailMini 逐段 stroke**（第二嫌疑）
   - 每帧 24 次 `stroke()` + 24 次 `set_stroke_style()` + 24 次字符串分配——
     渲染状态切换频繁，`stroke` 是 canvas 最重命令之一。
   - 优化方向：合并为一条路径一次 stroke（需改代码）；或预计算 alpha 表。

3. **clearRect 全屏无增量**：每帧全清全画；页面静态部分（logo/背景）未缓存。

4. **球体 arc+fill ×3/帧**：fill 光栅化 + save/restore/global_alpha 状态切换。

5. **catmull 路径点**：96 次/帧纯算术（wasm 侧成本低，但顶点数翻倍线性增加路径点数）。

6. **logo getBoundingClientRect**：每 30 帧采样一次（已节流，layout 成本低频）。

## 4. Gemini 可操作参数清单（params.rs【Gemini 可操作区·渲染】）

| 参数 | 现状 | 作用 | 调大影响 | 调小影响 |
|---|---|---|---|---|
| `RENDER_MAX_DPR` | 2.0 | 设备像素比上限 | 高分屏更清晰，填充率↑（DPR²） | **填充率明显↓，画面略糊** |
| `RENDER_CANVAS_RESIZE_EPSILON` | 0.5 | canvas resize 容差(px) | resize 不敏感 | set_transform 更频繁 |
| `RENDER_RADIUS_REF_SIZE` | 700.0 | 球半径缩放参考短边(px) | 球/拖尾整体偏小 | 偏大 |
| `RENDER_RADIUS_MIN_SCALE` | 0.6 | 半径缩放下限（小屏） | 小屏球更大 | 小屏球更小 |
| `RENDER_RADIUS_MAX_SCALE` | 1.0 | 半径缩放上限（大屏） | 大屏球更大 | 大屏球更小 |
| `TRAIL_MAX_POINTS` | 8 | 拖尾历史点数（顶点数之源） | 拖尾更长更平滑，顶点↑ | **拖尾变短，顶点↓** |
| `TRAIL_SPEED_THRESHOLD` | 0.02 | 低速清拖尾阈值(world/s) | 更易清空（更省绘制） | 低速也画 |
| `TRAIL_CATMULL_SEGMENTS` | 4 | 每历史段子采样数 | 更平滑，路径点↑ | 更折角，路径点↓ |
| `TRAIL_WIDTH_FACTOR` | 2.0 | 实心拖尾线宽（×半径） | 拖尾更粗 | 更细 |
| `TRAIL_MINI_HEAD_ALPHA` | 0.45 | TrailMini 头透明度 | 更实 | 更淡 |
| `TRAIL_MINI_WIDTH_HEAD` | 0.6 | TrailMini 头线宽系数 | 更粗 | 更细 |
| `TRAIL_MINI_WIDTH_FADE` | 0.4 | TrailMini 收窄系数 | 收窄更快 | 更均匀 |
| `TRAIL_MINI_MIN_WIDTH` | 0.5 | TrailMini 线宽下限(px) | 尾端更粗 | 尾端更细 |
| `LOGO_SAMPLE_EVERY_FRAMES` | 30 | logo 采样节流（帧） | layout 更少，圈更滞后 | layout 更多，圈更贴 |
| `LOGO_BOUNDS_SCALE` | 1.25 | 活动圆放大系数 | 活动圆更大 | 更小 |
| `LOGO_BOUNDS_MIN_RADIUS` | 0.08 | 活动圆最小半径 | 最小半径更大 | 更小 |

- 高频收益候选（低风险试水）：`RENDER_MAX_DPR`、`TRAIL_MAX_POINTS`、
  `TRAIL_CATMULL_SEGMENTS`、`TRAIL_MINI_HEAD_ALPHA`。
- 已集中但非性能参数（记录不动）：`BALL_RADIUS`=10.0（球基础半径）、
  `TRAIL_MAX_SEG`=0.12（拖尾间距截断）。

## 5. 参数接线状态（⚠️ 重要）

- 本报告发布时：params.rs 已定义【Gemini 可操作区·渲染】全部常量，
  **数值 = engine.rs/trail.rs 现状字面量（纯搬家，零行为变化）**。
- **engine.rs/trail.rs 现状仍读字面量**——在接线完成前，改 params.rs 渲染段
  数值 **视觉上零变化**（常量未被引用）。
- 接线 = 把 engine.rs/trail.rs 的字面量替换为对应常量（机械替换，见 §6），
  由渲染模块集成时完成（数值不变，安全）。

## 6. 字面量 → 常量接线清单（机械替换）

**engine.rs：**

| 位置 | 现状字面量 | 替换为 |
|---|---|---|
| render() DPR | `.min(2.0)` | `RENDER_MAX_DPR` |
| render() resize 判定 | `.abs() > 0.5` | `RENDER_CANVAS_RESIZE_EPSILON` |
| render() 半径公式 | `w.min(h) / 700.0` | `RENDER_RADIUS_REF_SIZE` |
| render() 半径公式 | `.clamp(0.6, 1.0)` | `.clamp(RENDER_RADIUS_MIN_SCALE, RENDER_RADIUS_MAX_SCALE)` |
| frame() 历史上限 | `h.len() > 8` | `TRAIL_MAX_POINTS` |
| render() Trail 线宽 | `radius * 2.0` | `radius * TRAIL_WIDTH_FACTOR` |
| render() TrailMini alpha | `0.45 * (1.0 - frac)` | `TRAIL_MINI_HEAD_ALPHA * (1.0 - frac)` |
| render() TrailMini 线宽 | `0.6 - 0.4 * frac` | `TRAIL_MINI_WIDTH_HEAD - TRAIL_MINI_WIDTH_FADE * frac` |
| render() TrailMini 下限 | `lw.max(0.5)` | `lw.max(TRAIL_MINI_MIN_WIDTH)` |
| render() catmull 采样 | `for s in 0..4`（Trail/TrailMini 各 1 处） | `0..TRAIL_CATMULL_SEGMENTS` |
| frame() logo 节流 | `logo_tick % 30 == 0` | `LOGO_SAMPLE_EVERY_FRAMES` |
| sample_logo_bounds | `* 1.25` | `* LOGO_BOUNDS_SCALE` |
| sample_logo_bounds | `r.max(0.08)` | `r.max(LOGO_BOUNDS_MIN_RADIUS)` |

**trail.rs**（拖尾深模块，未接线；同源参数同步）：

| 位置 | 现状字面量 | 替换为 |
|---|---|---|
| sample_history 低速 | `speed_per_sec < 0.02` | `TRAIL_SPEED_THRESHOLD` |
| draw Solid 线宽 | `radius * 2.0` | `radius * TRAIL_WIDTH_FACTOR` |
| draw Mini alpha | `0.45 * (1.0 - frac)` | `TRAIL_MINI_HEAD_ALPHA * (1.0 - frac)` |
| draw Mini 线宽 | `0.6 - 0.4 * frac` | `TRAIL_MINI_WIDTH_HEAD - TRAIL_MINI_WIDTH_FADE * frac` |
| draw Mini 下限 | `lw.max(0.5)` | `lw.max(TRAIL_MINI_MIN_WIDTH)` |
| draw catmull 采样 | `for s in 0..4`（Solid/Mini 各 1 处） | `0..TRAIL_CATMULL_SEGMENTS` |

- ⚠️ `TRAIL_SPEED_THRESHOLD`(0.02) 同时是 sim/state.rs `should_track` 的同一数值
  ——sim/ 属红线区，接线时不应改 state.rs，可保留字面量并注明与常量同值。

## 7. 验证方法

1. **强刷目测**：`cd web-ui && ./build.sh && python3 serve.py 8080` →
   **Ctrl+Shift+R**（硬刷新，绕缓存）→ 观察三球 + 拖尾流畅度、发热。
2. **双模式对比**：切换 Trail ↔ TrailMini（P 键 / 前端按钮）——
   TrailMini 理论上更重（24 次 stroke vs 3 次），是热点 #2 的直接复现手段。
3. **DevTools Performance**：Chrome 录制 10s → 看每帧时长、Rendering 占比、
   dropped frames；对比改参前后。
4. **DPR 差异**：普通屏（DPR 1）与 Retina（DPR 2）各测一轮——
   DPR 2 填充率是 4×，`RENDER_MAX_DPR` 的收益最直观。
5. **可选后续**：注入 rAF 帧间隔计数（FPS 探针，dev-only）——本报告不实现，
   如需帧率数字可由后续子代理加。

## 8. 相关文件

- `web-rust/src/config/params.rs` ——【Gemini 可操作区·渲染】主战场（本报告 §4）
- `web-rust/src/animation/engine.rs` ——渲染管线实现（clear/DPR/拖尾/球体）
- `web-rust/src/animation/trail.rs` ——拖尾深模块（未接线，参数同源，§6 清单）
- `docs/stutter-report.md` ——运动数学「顿顿」（与渲染开销正交，勿混淆）
