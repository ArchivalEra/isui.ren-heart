// NotFound —— 灰阶 404 页（页面访问规则 enabled=false 或未知路径时展示）。
// 契约类名（styles.css 由另一小弟统一维护，本文件只声明结构）：
//   .not-found 容器 / .not-found-title（大号 404 灰字）/ .not-found-text / .not-found-link（返回首页 href="/"）
// 红线：纯白灰阶（无彩色）；零依赖。
import type { JSX } from "preact";

export default function NotFound(): JSX.Element {
  return (
    <div class="not-found">
      <p class="not-found-title" aria-hidden="true">404</p>
      <p class="not-found-text">页面未开放或不存在</p>
      <a class="not-found-link" href="/">返回首页</a>
    </div>
  );
}
