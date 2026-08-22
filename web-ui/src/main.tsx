// 入口：纯 CSR 渲染（原 path/hash 迷你路由已随 /home demo 页移除；
// 以后加新页面时再引入路由：if (p.startsWith("/blogs")) return "blogs" 式判断，
// 部署层 SPA fallback（/* → /index.html）自动兜底任意路径）
import { render } from "preact";
import "./styles.css";
import Heart from "./Heart";

render(<Heart />, document.getElementById("app")!);
