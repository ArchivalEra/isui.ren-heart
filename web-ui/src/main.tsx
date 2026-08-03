// 入口：纯 CSR hash 路由（两个页面，手写 ~20 行——依赖少优先，不上路由库）
import "./styles.css";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import Heart from "./Heart";
import Home from "./Home";

function currentRoute(): string {
  const h = window.location.hash;
  if (h.startsWith("#/home")) return "home";
  return "heart"; // 默认 / 与未知路径 → heart
}

function App() {
  const [route, setRoute] = useState(currentRoute());
  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route === "home" ? <Home /> : <Heart />;
}

render(<App />, document.getElementById("app")!);
