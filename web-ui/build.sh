#!/usr/bin/env bash
# 一键构建 isui.ren/heart（Rust 动画 wasm + Preact UI）→ web-ui/dist/
# 纯 CSR：产物可直接部署 EdgeOne Makers / CF Pages（零服务端开销）
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"

echo "==> 1/3 cargo build (wasm32 release) — 动画核心"
cd "$ROOT/web-rust"
cargo build --target wasm32-unknown-unknown --release

echo "==> 2/3 wasm-bindgen → web-ui/src/wasm"
rm -rf ../web-ui/src/wasm
wasm-bindgen --target web --out-dir ../web-ui/src/wasm target/wasm32-unknown-unknown/release/isui_ren_heart.wasm
if command -v wasm-opt >/dev/null 2>&1; then
  echo "    wasm-opt -Oz"
  wasm-opt -Oz ../web-ui/src/wasm/isui_ren_heart_bg.wasm -o ../web-ui/src/wasm/isui_ren_heart_bg.wasm
fi

echo "==> 3/3 vite build (Preact UI)"
cd "$ROOT/web-ui"
[ -d node_modules ] || npm install --registry=https://registry.npmmirror.com
npm run build

echo "==> 产物:"
ls -la dist/
echo "完成: dist/ 可一键部署"
