import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// 纯 CSR：产物 = 静态文件（EdgeOne Makers / CF Pages 直发，零服务端开销）
export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: "dist",
    target: "es2020",
    // wasm 作为 asset 保留（wasm-bindgen 的 new URL 引用由 vite 自动处理）
    assetsInlineLimit: 0,
  },
});
