// 入口：纯 CSR 路由（path 为主 + hash 兼容——手写 ~25 行——依赖少优先，不上路由库）
// 部署层：Makers edgeone.json SPA fallback（/* → /index.html）已覆盖所有路径——
// 直接访问 /blogs 等任意路径都会回 index.html 再交前端路由（静态资源绝对路径 /assets/ 不受影响）
import "./styles.css";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import Heart from "./Heart";
import Home from "./Home";

// ⚠️ 以后加新页面（如 /blogs）：两步——
//   1. 这里加一行：if (p.startsWith("/blogs")) return "blogs";
//   2. 渲染处加 <Blogs />（import 进来）
//    部署层零配置（SPA fallback 自动兜底）
function currentRoute(): string {
  const p = window.location.pathname;
  const h = window.location.hash;
  // if (p.startsWith("/blogs")) return "blogs";   ← 未来博客页加这里
  if (p.startsWith("/home") || h.startsWith("#/home")) return "home";
  return "heart"; // 默认 /、/heart 与未知路径 → heart
}

function App() {
  const [route, setRoute] = useState(currentRoute());
  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);
  return route === "home" ? <Home /> : <Heart />;
}

render(<App />, document.getElementById("app")!);
