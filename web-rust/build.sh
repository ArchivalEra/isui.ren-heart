#!/usr/bin/env bash
# 一键构建 isui.ren/heart（Rust/WASM 纯 CSR）→ 产物在 dist/
# 用法: ./build.sh  （产物 dist/ 可直接部署到 EdgeOne Makers / CF Pages / Azure SWA）
set -euo pipefail
cd "$(dirname "$0")"

echo "==> cargo build (wasm32 release)"
cargo build --target wasm32-unknown-unknown --release

echo "==> wasm-bindgen"
wasm-bindgen --target web --out-dir dist target/wasm32-unknown-unknown/release/isui_ren_heart.wasm

echo "==> 静态资源"
cp index.html dist/index.html
cp src/styles.css dist/styles.css
cp -r assets/. dist/

if command -v wasm-opt >/dev/null 2>&1; then
  echo "==> wasm-opt -Oz"
  wasm-opt -Oz dist/isui_ren_heart_bg.wasm -o dist/isui_ren_heart_bg.wasm
fi

echo "==> 产物:"
ls -la dist/
echo "完成: dist/ 可一键部署"
