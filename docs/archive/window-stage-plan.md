# 窗口舞台方案（window-stage 分支——2026-08-07 开工蓝图）

> 用户决策（2026-08-06）：无边框窗口容器——logo + 三球 + 活动圆固定在同一
> 坐标系——容器整体 transform 缩放/位移——彻底消灭"响应式坐标换算"。
> 此分支不推 main——验证通过后再合。

## 为什么（这几天的血泪总结）

main 上球位置问题的全部根源 = **跨层坐标换算链**：
采样（DOM rect）→ 反透视（世界坐标）→ 推导值（LOGO_DESIGN_CENTER/W）→
注入（set_logo_transform）→ rebuild 阈值（fallback→真圆）——**每层都是
bug 温床**（推导值错 0.074、阈值放行 0.074、首帧 fallback、translate 补偿
混写……）。窗口方案让 logo 和球**永远同一坐标系**——这类 bug 物理上消失。

## 目标架构

```
body（纯白灰阶背景）
└── .stage-window（无边框窗口——固定设计尺寸，如 1280×720）
    ├── .heart-logo（DOM——窗口内固定百分比定位——无需外部换算）
    ├── canvas#balls-canvas（球——窗口内 100%——世界坐标→窗口像素一步）
    │     └─ 活动圆 = 窗口内固定（圆心/半径常量——无采样）
    └── （三球动画核心 sim/ 全保留——不动）
└── .card-wall（文件夹按钮——最上层 z 层）
└── .stage-control（调试：拖窗口位置/缩放 + 拖球 + 复制参数）
```

## 删除清单（main 上这些全部退役）

**engine.rs**：
- `sample_logo_bounds`（DOM 采样——整函数删）
- 反透视（`(ratio-0.5)/depth+0.5` 与 `screen_to_world`）
- `logo_bounds` 采样链路 / `last_bounds` / rebuild 阈值判断
- `ball_mode` 的采样暂停逻辑（球模式改拖窗口内锚点——无需暂停）
- `set_logo_transform` 调用（已删——连同采样块）

**state.rs / params.rs**：
- `set_logo_transform` / `anchor_vecs` / `LOGO_DESIGN_CENTER` / `LOGO_DESIGN_W`
- `set_calib`（已删）
- 锚点 = ANCHORS 常量（世界坐标——窗口内渲染，`screen_of(w_window, h_window)`）

**styles.css / Heart.tsx**：
- translate 偏心补偿（`-2.119% / 3.448%`）——窗口内固定定位后不需要
- left/top 百分比定位（改为窗口内布局）
- 小屏媒体查询的 logo 部分（窗口等比缩放——无断点）

**LogoDebug.tsx**：
- "调 logo"模式改为**调窗口**（拖 .stage-window 的 translate / 滚轮或按键缩放）
- "调小球"保留（拖球 = 窗口内世界坐标 set_anchor）

## 保留清单（不动）

- `sim/` 全部：链规划/速度/回家预渲染/跟随/三球独立性格（61 测试的主体）
- 调试器拖球（set_anchor——世界坐标不变）
- 文件夹卡片墙（最上层 z）
- 纯白灰阶 + SVG logo（logo.svg 已 trim——图形占满）

## 实现步骤（明天顺序）

1. **Heart.tsx**：`.stage-window` 容器（包 logo + canvas）——设计尺寸定死
2. **engine**：canvas 尺寸 = 窗口固定尺寸 × dpr（清晰度）——删采样/换算/注入
3. **state**：锚点 = ANCHORS（世界坐标——`screen_of(w, h)` 窗口像素渲染）
4. **CSS**：窗口 `transform: translate()/scale()`——调试器拖窗口/缩放
5. **测试收编**：删换算相关（anchors_follow_logo_center 等）——sim 核心测试
   保留（61 → 预计 55 左右）
6. **部署验证**：全屏/小窗/手机——窗口等比缩放（非等比屏 letterbox 白边——
   纯白背景自然）

## 风险与对策

| 风险 | 对策 |
|------|------|
| 非等比屏幕 letterbox | 白边 = 页面背景色——自然；窗口可拖可缩放（用户控制） |
| canvas 缩放后模糊 | 窗口内 canvas 物理像素 = 设计尺寸 × dpr（固定清晰） |
| 球不再满屏 | 用户已接受（窗口方向就是放弃满屏） |
| 设计尺寸选择 | 1280×720（16:9 基准）——或按用户校准的 1904 比例折算 |

## 验收标准

- 任意窗口尺寸：logo 与三球**恒焊死**（同一坐标系——无分离可能）
- 调试器：拖窗口位置 / 缩放窗口 / 拖球——复制参数一键写回
- 61 测试全绿（删换算相关后）——sim 核心零改动
