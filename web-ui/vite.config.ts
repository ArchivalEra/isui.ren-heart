import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// 纯 CSR：产物 = 静态文件（EdgeOne Makers 直发，零服务端开销）
// base /heart/：应用固定住在 isui.ren/heart/ 子目录——站点根属于跳转页和
// 404 页，SPA rewrite 已退役，死路径由 EdgeOne 的 404.html 约定接管
export default defineConfig({
  base: "/heart/",
  plugins: [preact()],
  build: {
    outDir: "dist",
    target: "es2020",
    // wasm 作为 asset 保留（wasm-bindgen 的 new URL 引用由 vite 自动处理）
    assetsInlineLimit: 0,
  },
});
