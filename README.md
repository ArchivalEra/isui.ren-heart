# isui.ren — tayori 粉丝站

tayori 乐队粉丝站。纯 CSR 静态站点（零服务端开销），部署于 EdgeOne Makers / Cloudflare Pages。

## 目录结构

```
web-rust/   三球动画核心（Rust → wasm32，性能敏感部分）
  ├─ sim/       规划/执行：弧长共享链、云中心（Frenet 偏移 + EMA）、调速器（savgol + 加速度钳制）
  ├─ config/    参数、25 档曲线模板（gemini 协作，含校验测试）、运动 profile
  └─ lib.rs     wasm 导出：start_balls(canvas_id) / toggle_trail_style()
web-ui/     Preact 10 + Vite 8 + TS 前端（性能要求低的部分，依赖少优先）
  ├─ src/       Heart / Home / Typewriter(typed.js) / CardWall / BallsCanvas(wasm 挂载)
  └─ build.sh   cargo → wasm-bindgen → wasm-opt → vite 一键构建
docs/       架构文档、谷歌大学档案（Motion 资料）、曲线模板委托书
CONTEXT.md  领域术语表（tayori/卡片/边缘层/快照等）
```

## 构建

```bash
cd web-ui && ./build.sh        # 产物 dist/ 纯静态，一键部署
python3 serve.py 8080          # 本地预览（http://127.0.0.1:8080/#/heart）
```

## 测试

```bash
cd web-rust && cargo test      # 32 个测试：几何/云中心/调速器/生命周期无跳变
```

## 体积（gzip 后 ~75KB 总量）

| 产物 | gzip |
|------|------|
| 动画 wasm（wasm-opt -Oz） | 59.6 KB |
| UI（Preact + typed.js） | 14 KB |
| 运行时依赖 | preact + typed.js（2 个） |

## 设计要点

- **纯 CSR 底线**：不承担任何服务端开销，静态托管直发
- **性能分层**：动画核心 Rust/wasm；UI 用轻量现成轮子（依赖少、压缩率高优先）
- **三球动画**：云中心 Frenet 偏移（转弯同弧）+ EMA 时序滤波 + 调速器（速度无钝点）+ 25 档曲线模板
