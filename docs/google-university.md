# 谷歌大学学习档案（Google University Notes）

> 每次「去谷歌大学深造」的真实抓取成果都记录在这里，**优先最新知识**。
> 抓取时间、来源 URL、实证内容、如何应用。禁止凭记忆写——每一条都要有来源。

## 2026-08-03 — Material 3 v0.192 motion tokens（最新）

**来源**：`material-components/material-web` 仓库，`tokens/versions/v0_192/_md-sys-motion.scss`（Google 设计系统自动生成文件，Design system version: v0.192）

**实证内容**（原文值）：
```scss
'duration-extra-long1..4': 700 / 800 / 900 / 1000ms
'duration-long1..4':       450 / 500 / 550 / 600ms
'duration-medium1..4':     250 / 300 / 350 / 400ms
'duration-short1..4':      50  / 100 / 150 / 200ms

'easing-emphasized':           cubic-bezier(0.2, 0, 0, 1)
'easing-emphasized-accelerate': cubic-bezier(0.3, 0, 0.8, 0.15)
'easing-emphasized-decelerate': cubic-bezier(0.05, 0.7, 0.1, 1)
'easing-legacy':                cubic-bezier(0.4, 0, 0.2, 1)
'easing-legacy-accelerate':     cubic-bezier(0.4, 0, 1, 1)
'easing-legacy-decelerate':     cubic-bezier(0, 0, 0.2, 1)
```

**要点**：Material 3 之后的新标准是 **emphasized 系列**（0.2,0,0,1），legacy（0.4,0,0.2,1 = 老 FastOutSlowIn）被降级为兼容名。入场/出场用 **emphasized-decelerate / emphasized-accelerate**。

**应用**：
- 拖尾尾部消失曲线 = `emphasized-decelerate (0.05, 0.7, 0.1, 1)`——快速离场、平滑收尾
- 球速 profile 的段内过渡曲线可换 emphasized（0.2,0,0,1）

## 2026-08-03 — androidx 官方 easing 常量

**来源**：`androidx/androidx` 仓库，`compose/animation/animation-core/src/commonMain/kotlin/androidx/compose/animation/core/Easing.kt`（172 行实证）

**实证内容**：
```kotlin
FastOutSlowInEasing = CubicBezierEasing(0.4f, 0.0f, 0.2f, 1.0f)
LinearOutSlowInEasing = CubicBezierEasing(0.0f, 0.0f, 0.2f, 1.0f)
FastOutLinearInEasing = CubicBezierEasing(0.4f, 0.0f, 1.0f, 1.0f)
```
（与 Material tokens 的 `easing-legacy` 系列一致——legacy = 平台兼容层）

**应用**：PD spring 的 stiffness 700 / damping 0.9 即源自 MDC 物理缓动思路（google 文档描述），本项目 SPRING 常量直接采用。

## 2026-08-03 — 向心 Catmull–Rom 样条

**来源**：Wikipedia《Centripetal Catmull–Rom spline》（Edwin Catmull / Raphael Rom 原著；Barry & Goldman 递归求值）

**实证内容**：
- 过点插值样条：曲线**穿过全部控制点**（插值，非逼近）
- 向心参数化消除尖角与自交（点密集时普通 CR 会回环）
- 标准公式：P(t) = 0.5·(2P1 + (−P0+P2)t + (2P0−5P1+4P2−P3)t² + (−P0+3P1−3P2+P3)t³)

**应用**：拖尾几何——历史点全部穿过、C¹ 连续，折点（链段连接处）无光栅错误。`sim/math.rs::catmull_rom` + 单测 `catmull_rom_passes_through_points`（t=0 过 P1、t=1 过 P2，误差 <1e-9）。

## 2026-08-04 — Euler spiral / clothoid（混合模板段的数学基础）

**来源**：Wikipedia《Euler spiral》（"Curve whose curvature changes linearly"）

**实证内容**：
- **曲率随弧长线性变化**的曲线（clothoid / Cornu spiral，铁路过渡曲线标准）
- 工程用途：直线↔弯道的**过渡曲线**（铁路/公路）、汽车赛道线、数字矢量绘图
- 曲率线性变化 = 无折角（方向连续 + 曲率连续）

**应用**：混合模板段（一整段 = 模板 A 前半 + B 中间 + C 后半）——
`make_blend_leg` 用 5 子段离散近似 Euler spiral：子段 i 曲率 = 采样线性插值
A→B→C；子段间切线继承（C1 连续）+ 曲率阶梯（≈ 线性变化）。单测
`blend_leg_curvature_gradates_a_to_c` 验证曲率单调渐变 + 终点精确命中。

## 2026-08-04 — Motion blur（小拖尾/动态模糊的设计依据）

**来源**：Wikipedia《Motion blur (media)》

**实证内容**：
- 运动模糊 = 物体**沿相对运动方向涂抹**（smeared along the direction of relative motion）
- 人眼本身有此行为——所以运动模糊观感"自然"（动画/电影/游戏的标准手法）
- 涂抹的形态：沿速度方向、透明度渐变（中心实、边缘虚）

**应用**：TrailMini（小拖尾）——短历史（6 点）+ 宽度 0.6r（小于球）+ 半透明
（头部 alpha 0.45 → 尾部 0 渐变）+ Catmull-Rom 过点——沿运动方向涂抹的
离散近似，模拟动态模糊而非"实体拖尾"。

## 备用：其他可靠来源（未逐条抓取，供后续进修）

- Red Blob Games（redblobgames.com）：steering behaviors / 路径规划——编队与跟随的工程参考
- MDC（material.io/develop）：Material Design Components 各平台实现
- material.io 主站为 JS 渲染，curl 抓不到——用 GitHub 仓库 raw 文件替代（本次经验）
