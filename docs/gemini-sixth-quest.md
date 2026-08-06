# 第六次求签：双屏翻页 + 动画 freeze（给 Gemini 姐姐）

> 2026-08-07 · isui.ren /heart
> 背景：三球动画已窗口化（logo+球固定在同一 1280×720 窗口坐标系——窗口整体
> transform 缩放——坐标换算地狱已终结）。现在要做**双屏翻页**。

## 需求（站主原话整理）

1. **文件夹当"楚河汉界"**：点击文件夹（或滚轮）→ 整页像鼠标滚轮一样平滑
   翻到屏 2；再点/滚轮上 → 翻回屏 1
2. **屏 1**（100vh）：动画窗口舞台（三球 + logo）
3. **屏 2**（100vh）：卡片/按钮区——**动画 freeze**（离开视口后 wasm 暂停——
   球定格当背景；回来 resume 无缝续播）——屏 2 想多花哨都行（性能全释放）
4. **布局预先划定**：body 恒 200vh（两屏各 100vh）——不是动态延展
5. **滚轮兼容**（站主最新决定）：不彻底禁滚轮——支持滚轮翻页（之前想禁，
   现改主意——"fullpage听起来很成熟"）
6. 站主铁律：**依赖少 + 压缩率高 + 省带宽**（现站点运行时零依赖；
   fullpage.js 469KB unpacked/~140KB gzip——被质疑太重）

## 我的方案（自研 0KB）

```
body（overflow: hidden——200vh 固定）
└── .scroll-stage（height:200vh; transform: translateY(0/-100vh); transition）
    ├── 屏 1（100vh）：.stage-window（动画）+ 文件夹按钮
    └── 屏 2（100vh）：卡片区
```

- 翻页：transform + CSS transition（Material decelerate `cubic-bezier(0.05,0.7,0.1,1)`）
- 滚轮：wheel 事件节流（翻页动画期间忽略——防连滚）+ 方向判断（deltaY）
- freeze：翻页完成 → wasm `set_paused(true)`（step 跳过——rAF 继续但零开销）；
  翻回 → resume（状态原样续跑）
- wasm 改动：set_paused 导出（~10 行——engine 加 paused 标志）

## 给 Gemini 姐姐的问题

**Q1：freeze 的最佳实践**——wasm 暂停（step 跳过）vs rAF 停止（cancelAnimationFrame
由 JS 控制）？哪个更省电/省性能？恢复时有什么坑（如 dt 跳变——暂停期间累积的
时间要丢弃）？

**Q2：滚轮翻页 vs 屏 2 内部滚动冲突**——屏 2 以后卡片多了可能要内部滚动——
全局滚轮翻页会吃掉内部滚动——业界常见模式？（fullpage 的 scrollOverflow 模式：
屏内滚到顶/底才触发翻页——还是：屏 2 内部滚动 + 只在屏 1 滚轮翻页？）
站主场景：屏 2 一屏装 3-6 张卡（不内部滚）——但想留后路。

**Q3：自研 vs fullpage 判断**——站主省带宽铁律（140KB gzip 换翻页=站点
最重依赖）——自研 25 行 wheel 节流 + transform 是否覆盖 fullpage 的核心价值？
fullpage 除了滚轮翻页还有什么我们可能低估的价值？（无障碍/移动端触控/惯性）

**Q4：翻页动画曲线**——"像鼠标滚轮"的感觉——Material 系里选哪个？
（decelerate 0.05,0.7,0.1,1 vs emphasized vs 自定义惯性衰减？）移动端
touch 翻页（touchmove 跟手 + 松手惯性）是否值得做（还是按钮/滚轮就够）？

**Q5：freeze 的视觉**——球定格当背景：定格帧是"最后渲染帧"（canvas 不动）——
但翻页过程中（屏 1 移出）球还在动（过渡期）——freeze 时机（过渡完成 vs 开始）？
过渡完成再 freeze 会不会有"翻页后球还在动半秒"的怪感？

---
站主注：答案要**简洁可落地**（我们不是论文——是给 Rust wasm + Preact 的
实现建议）。回复格式随意，落地时我会翻译成代码。
