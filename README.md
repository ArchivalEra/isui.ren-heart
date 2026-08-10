# isui.ren/heart — tayori 粉丝站页面

初心:在被诊断出无菌性中耳炎前一周收听了isui的歌，被医生告知天生耳朵过于敏感且单侧耳道负压持续超4年，接下来几年尽量少听音乐，无治疗手段。悲痛万分，做个网站背后藏个小本本记一下过几年想听的歌。

纯 CSR 静态站点（零服务端开销），部署于 EdgeOne Makers / Cloudflare Pages。
动画核心用 Rust 编译成 wasm——性能敏感的地方绝不妥协。

## 亮点

- **窗口舞台**：logo 与三球固定在同一坐标系（1280×720 无边框窗口），窗口整体
  `scale()` 等比缩放——**任何屏幕尺寸下构图恒焊死**，没有"响应式坐标换算"的
  生存空间（那曾是一个地狱）。
- **三球引擎**（Rust/wasm）：一球一链、弧长共享链、云中心（Frenet 偏移 + EMA）、
  调速器（加速度钳制）、回家预渲染动画、启动/重启主次随机、三球独立性格。
- **调试器**（页面左下角 🔧）：拖窗口 / L·M 缩放窗口 / 拖三个球 / 一键复制参数
  ——人眼校准闭环，参数直接写回。
- **轻量打字机**（rAF 自研）与**卡片墙**（文件夹式展开）——依赖少优先。
- **纯白灰阶视觉**，永远没有深色模式；全页唯一黑色是 logo。

## 目录结构

```
web-rust/   三球动画核心（Rust → wasm32）
  ├─ sim/       规划/执行：链、云中心、调速器、回家、性格（61 个测试的主体）
  ├─ config/    参数（锚点/曲线模板/节奏）、25 档曲线模板（含校验测试）
  ├─ animation/ engine.rs（wasm 渲染、调试涂层、坐标服务）
  └─ lib.rs     wasm 导出：start_balls / toggle_trail_style / 调试 API
web-ui/     Preact 10 + Vite 8 + TS（性能要求低的部分）
  ├─ src/       Heart（窗口舞台）/ BallsCanvas / LogoDebug / Typewriter / CardWall
  ├─ public/    logo.svg（potrace 矢量化——构建时工具，运行时零依赖）
  └─ build.sh   cargo → wasm-bindgen → wasm-opt → vite 一键构建
docs/       架构文档、谷歌大学档案（五次求签）、窗口舞台蓝图
CONTEXT.md  领域术语表
```

## 构建 / 测试 / 预览

```bash
# 构建（需要先 source ~/.nvm/nvm.sh）
cd web-ui && ./build.sh        # 产物 dist/ 纯静态，一键部署

# 测试（61 个：几何/云中心/调速器/生命周期无跳变/锚点固定）
cd web-rust && CARGO_BUILD_JOBS=1 cargo test

# 本地预览
python3 serve.py 8080          # http://127.0.0.1:8080/#/heart（强刷 Ctrl+Shift+R）
```

## 调试器

页面左下角 **🔧 调试**：

| 模式 | 操作 | 复制参数 |
|------|------|---------|
| 调窗口 | 拖窗口移动 · L 放大 / M 缩小 | `window: translate/scale` |
| 调小球 | 拖三个灰色标记到理想位置 | `ANCHORS`（可直贴 params.rs） |

## 架构一句话

**窗口 = 单一坐标系**：logo（DOM）与三球（canvas）都在窗口内用同一套归一化
坐标——窗口外只有一件事：`scale()`。这就是这几天血泪（采样→反透视→注入→
推导值→阈值，五层换算地狱）换来的终局。

## 历史

- 2026-08-04 ~ 08-06：三球动画从"满屏跑 + 响应式换算"一路踩坑（闪现、拖尾、
  折角、回弹、锚点脱焊……），谷歌大学五次求签（Material You motion、无状态
  归一化向量、窗口舞台）。
- 2026-08-07：窗口舞台落地——坐标换算地狱关闭，构图焊死，一劳永逸。
- 特别鸣谢：Gemini 师傅（曲线模板与架构真经）与 32 个任劳任怨的小弟。
