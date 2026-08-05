# 第五次求签：logo 响应式锚定与小球焊死问题（给 Gemini 师傅）

> 2026-08-06 · isui.ren /heart 三球动画适配收尾
> 上下文：Rust wasm 动画（canvas 全屏渲染三球）+ Preact 页面 + SVG logo。
> 现象一句话：**全屏（~1904px 宽）完美；小屏（≤560 或矮窗）logo 偏右、
> 小球锚点不与 logo 焊死（球不跟随 logo 缩放/平移）。**

## 架构现状（自包含）

```
.heart-page (position: relative, 全页)
├── canvas#balls-canvas (absolute inset:0, z-index 9999, pointer-events:none)
│     └─ wasm 渲染三球（粉/蓝/绿）满屏跑，活动范围 = 活动圆
│        （圆中心 = logo 实际中心，半径 = 中心到最近屏幕边缘）
└── .heart-logo (absolute, left:44.65% top:37.86%,
     transform:translate(calc(-50% - 2.119%), calc(-50% + 3.448%)))
      └── img.heart-logo-img (src=logo.svg, width:min(70vw,70vh,196px))
```

**关键机制（Rust wasm 侧）**：
1. 每 30 帧采样 `.heart-logo` 的 `getBoundingClientRect()` → 归一化中心
   （反透视 `cx=(ratio-0.5)/depth+0.5, depth=0.55+0.45*cy`）+ 宽度（scale 基准）
2. `State::set_logo_transform(c, scale)`：三球锚点 =
   `校准中心 + (ANCHORS-校准中心)×(scale/校准scale) + (c-校准中心)`
   ——即锚点相对 logo 中心平移 + 随 logo 尺寸成比例缩放（"焊死"的机制）
3. 首帧校准：第一次有效采样零平移（锚点 = 用户实测 ANCHORS）
4. `rebuild_on_resize`（尺寸变化 >1% 或活动圆中心跳变 >0.1）：
   创建全新 State + `set_calib(旧基准)` 恢复校准（已修——曾重置导致小屏不缩放）

**小屏规则**：`@media (max-width:560px),(max-height:560px)`：
`.heart-logo-img { width:min(52vw,42vh,150px) }`；left/top 与大屏一致（44.65%/37.86%）

## 问题 1：小屏 logo 视觉偏右

- 全屏：logo 中心（含 translate 补偿）≈ 39.3% 容器宽——用户调好的构图
- 小屏（如 390px 宽）：`left:44.65%` + `translate(-50%-2.119%)`——translate
  的 % 相对**自身宽**（150px），容器 390px → 实际中心 = 44.65% - 52.119%×(150/390)
  = 44.65% - 20% ≈ **24.6%**——**偏左**（数学）
- **但用户观察"偏右"**——怀疑：小屏时球锚点没跟 logo（问题 2），球留在
  全屏位置（右侧），视觉上"logo 偏右"（其实是球/整体构图错位）？
- 待解：小屏时 logo 中心应保持在哪个位置才"视觉不偏"？translate 补偿的
  百分比语义（相对自身）在容器缩小时是否应改用容器百分比或像素？

## 问题 2：小屏小球锚点不与 logo 焊死

- 机制存在（set_logo_transform——中心平移 + 缩放），rebuild 后也恢复了基准
- 但仍未焊死——怀疑点：
  a. `set_logo_transform` 只在**非 ball_mode** 且**非 fallback** 时调用——
     小屏切换瞬间（rebuild 后 30 帧窗口）锚点 = ANCHORS（全屏值）——短暂错位
  b. scale 基准 `calib_w` 是**首帧 div 宽度**——rebuild 后 set_calib 恢复了
     center/scale，但 engine 的 `calib_w`（宽度基准）没恢复——小屏 scale 计算
     用的还是旧基准？
  c. div 的 `getBoundingClientRect().width` 在小屏是否真的 = img 渲染宽
     （position:absolute + width:auto 的 shrink-to-fit 行为）？
- 期望行为：**任意窗口尺寸下，三球锚点始终 = logo 中心 + 相对偏移×缩放**
  （即"焊死"——logo 在哪球就在哪，logo 多大球围绕它的半径就多大）

## 已尝试（均未彻底解决）

| 方案 | 结果 |
|------|------|
| 锚点固定百分比（ANCHORS 常量） | 全屏对、小屏错位 |
| set_logo_center 平移跟随 | 全屏对、缩放时丢（已改绝对语义） |
| set_logo_transform（平移+缩放） | 机制对、rebuild 后失效（已修基准恢复） |
| 小屏 left:50%（与文件夹中轴对齐） | 用户反馈偏右（已删——统一 44.65%） |
| 小屏 width:min(52vw,42vh,150px) | logo 缩了但位置/球仍有问题 |
| logo 裁切透明边 + CSS 补偿 | 全屏更准；小屏补偿百分比语义（相对自身）可疑 |

## 求签问题（请 Gemini 师傅指教）

1. **CSS 层面**：`position:absolute + left% + translate(-50%-X%)` 的组合在
   容器宽度变化时，如何让"logo 中心"稳定在一个**固定的容器百分比**（如 40%）？
   （translate 的 % 相对自身宽——容器缩小时自身宽也变——中心漂移）
   是否应该用 `left: calc(40% - 0px)` + `margin-left: -50%` 或其他惯用组合？
2. **焊死机制**：小屏下球锚点不跟随 logo 缩放，最可能的根因是什么？
   （怀疑 b：engine 宽度基准 calib_w 在 rebuild 后未恢复）
3. **推荐方案**：有没有"一个容器包住 logo + canvas 层，全部用 CSS 变换缩放"
   的成熟模式（真经第四回提过 stage 叠层——但球要满屏跑，不能限制在 logo 区域）？
