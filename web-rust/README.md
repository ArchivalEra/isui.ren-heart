# web-rust — isui.ren/heart（Rust/WASM 版）

纯 CSR（**零服务端渲染**），Leptos + WebAssembly。
目标：极致低占用 + Firefox 优先（Mozilla 是 WASM 发起者，Firefox 的 WASM 引擎优化最深）。

## 结构（解耦）

```
src/
├─ lib.rs             入口（wasm-bindgen start，mount_to_body）
├─ app.rs             路由（/ → /heart，/home）
├─ config/            全部可配置参数（改这里即改行为）
│  ├─ params.rs       概率/排列/颜色/速度/透视
│  └─ templates.rs    16 种玩耍模板（增删改即变种类）
├─ animation/         动画引擎（Rust 实现，Canvas 2D）
│  ├─ curves.rs       十六种曲线数学 + 法线
│  ├─ engine.rs       主曲线+法线偏移+分块概率+排列弹性+透视渲染
│  └─ balls.rs        Canvas 组件（setInterval 驱动，30fps 省电可配）
└─ pages/
   ├─ heart.rs        /heart（灰阶氛围 + logo + 三球队列 + 打字机）
   └─ home.rs         /home（卡片页雏形）
```

## 构建（一键）

```bash
./build.sh        # cargo build + wasm-bindgen + 静态资源 → dist/
```

产物 `dist/`（index.html + wasm + glue + css）可直接部署：
EdgeOne Makers / CF Pages / Azure Static Web Apps（SPA fallback 指向 /index.html）。

## 语言分工原则

不同语言选最优实现：随机（rand crate）、曲线数学、动画引擎在 Rust；
边缘函数（EdgeOne/CF）仍是 JS/TS；素材复用走对象存储（与语言无关）。
