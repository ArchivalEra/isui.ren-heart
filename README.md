# isui.ren/heart

[English](README.en.md) | [中文](README.md)

初心:在被诊断出无菌性中耳炎前一周收听了isui的歌，被医生告知天生耳朵过于敏感且单侧耳道负压持续超4年，接下来几年尽量少听音乐，无治疗手段。
悲痛万分，做个网站背后藏个小本本记一下过几年想听的歌。
这辈子就没过正经数据库(除了收集本子和片)，想达到栗瑞明老师随手掏出15年前素材的效果，这算是一种实践。

isui.ren 的入口页（`/heart`）：tayori 粉丝站的门面——三球队列动画、打字机、卡片墙。
纯 CSR 静态站点（零服务端开销），部署于 EdgeOne Makers；动画核心用 Rust 编译成 wasm——性能敏感的地方绝不妥协。

## 亮点

- **`/static` 契约站通道**：`Static-Contract` 契约文档站（三通道并行的第三路：
  GitHub Pages、Cloudflare `static.mango-mesa.ccwu.cc/`（根路径）、以及本站
  `isui.ren/static`）。**三条线各自独立部署**——本站这条是 deploy 分支里的
  `static/` 静态树由 EdgeOne Makers 直出，中间件只在 **release 形状**的路径上发 302 指向 GitHub（`/static/<owner>/<repo>/releases/download/<tag>/<file>`，纯重定向零字节经过本站），其余形状全部 next() 交还静态树直出。补斜杠那道 301 由
  `site-root/edgeone.json` 声明（平台机制，跟 `/blog → /Blog` 同一处）——
  EO 静态层不自动补斜杠（实测 `/static` 返回 200 而非 301），而页面全是
  相对链接且无 `<base>`，缺斜杠时浏览器把 `contract/x.md` 解析成
  `/contract/x.md`，落到 611B 兜底页且**返回 200**，表现为「链接点不开」。
  GitHub Pages 自己会补，所以那条没这个病。产物**取自对方仓的 `deploy`
  分支**（那是他们的唯一产地，经 `sync-catalogue.py` 严格派生）；不跑构建器、
  也不拷 `site/dist`——前者只出源码兜底的空 catalogue，后者在对方仓里根本不存在。
  **搬运按对方的 `files.json` 清单执行**（`scripts/stage-static-tree.py`），不手写
  文件名——手写列表漏过 `LICENSE`，而 EO 对缺失路径返回 **200 + 兜底页**，
  只看状态码的检查会被骗过去。在线审计用 `scripts/audit-static-channels.py`
  （6 条自证，两条通道的 base 与各自部署位置一致：Cloudflare 已移到根
  `static.mango-mesa.ccwu.cc/`）：按 `files.json` 逐条比**内容指纹**，既判「是不是兜底页伪装」
  也判「与源产物是否逐字节相同」——通道之间「一致」不算证据。
  **release 产物的取货**走 `edgeone.json` 的**跨域 302 + 通配符**（实测有效：
  `302 Found` + `Location: https://github.com/...`），本站仍零字节托管。
- **窗口舞台**：logo 与三球固定在同一坐标系（1280×720 无边框窗口），窗口整体
  `scale()` 等比缩放——任何屏幕尺寸下构图恒定，没有"响应式坐标换算"的生存空间。
- **三球引擎**（Rust/wasm）：一球一链、弧长共享链、云中心（Frenet 偏移 + EMA）、
  调速器（加速度钳制）、回家预渲染动画、启动/重启主次随机、三球独立性格。
- **调试器**（页面左下角）：拖窗口 / L·M 缩放窗口 / 拖三个球 / 一键复制参数
  ——人眼校准闭环，参数直接写回。
- **轻量打字机**（rAF 自研）与**卡片墙**（config.json 驱动）——依赖少优先。
- **纯白灰阶视觉**；全页唯一黑色是 logo。

## 目录结构

```
web-rust/   三球动画核心（Rust → wasm32）
  ├─ sim/       规划/执行：链、云中心、调速器、回家、性格（61 个测试的主体）
  ├─ config/    参数（锚点/曲线模板/节奏）、25 档曲线模板（含校验测试）
  ├─ animation/ engine.rs（wasm 渲染、调试涂层、坐标服务）
  └─ lib.rs     wasm 导出：start_balls / toggle_trail_style / 调试 API
web-ui/     Preact 10 + Vite 8 + TS（性能要求低的部分）
  ├─ src/       Heart（窗口舞台）/ BallsCanvas / Typewriter / CardWall
  └─ build.sh   cargo → wasm-bindgen → wasm-opt → vite 一键构建
site-root/  部署到站点根的静态文件（根跳转页、404 页、logo）
docs/       架构文档、ADR、部署笔记、研究档案
CONTEXT.md  领域术语表
```

应用固定部署在 `isui.ren/heart/` 子目录（vite `base: "/heart/"`）；站点根只有跳转页与 404 页，
死路径由 EdgeOne 的 `404.html` 约定接管。`Bahnhof/` 子目录归 [Bahnhof](https://github.com/ArchivalEra/isui.ren-Bahnhof) 仓库的流水线所有。

## 构建 / 测试 / 预览

```bash
# 构建（需要 Rust toolchain + wasm32 target + Node）
cd web-ui && ./build.sh        # 产物 dist/ 纯静态，一键部署

# 测试（61 个：几何/云中心/调速器/生命周期无跳变/锚点固定）
cd web-rust && cargo test

# 本地预览
python3 serve.py 8080          # http://127.0.0.1:8080/#/heart
```

## 调试器

页面左下角 **调试**：

| 模式 | 操作 | 复制参数 |
|------|------|---------|
| 调窗口 | 拖窗口移动 · L 放大 / M 缩小 | `window: translate/scale` |
| 调小球 | 拖三个灰色标记到理想位置 | `ANCHORS`（可直贴 params.rs） |

## 架构一句话

**窗口 = 单一坐标系**：logo（DOM）与三球（canvas）都在窗口内用同一套归一化坐标——窗口外只有一件事：`scale()`。

## 历史

- 2026-08-04 ~ 08-07：三球动画从"满屏跑 + 响应式换算"迭代到窗口舞台终案
  （闪现、拖尾、折角、回弹、锚点脱焊逐一根治），坐标换算地狱关闭，一劳永逸。
- 致谢：Gemini（曲线模板与架构评审）与并行子代理们。
