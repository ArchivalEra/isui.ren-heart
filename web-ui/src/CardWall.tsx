// 屏 2 卡片墙：大卡（纯 CSS 灰阶卡片——站名大字 + 描述 + 箭头）
// 容器 .screen2-card-wall 由 Heart 放置；布局/大卡样式（.card-lg）在 styles.css
// （保留旧 open/onToggle 可选 props——屏 1 旧下拉交互已下线，双屏翻页后不再使用）
import type { JSX } from "preact";

const LINKS = [
  { title: "X (Twitter)", url: "https://x.com", icon: "𝕏", desc: "乐队动态" },
  { title: "YouTube", url: "https://youtube.com", icon: "▶", desc: "视频与音乐" },
  { title: "官方网站", url: "https://tayori-official.com", icon: "◎", desc: "官网" },
];

export default function CardWall(
  _props: { open?: boolean; onToggle?: (v: boolean) => void },
): JSX.Element {
  return (
    <>
      {LINKS.map((item) => (
        <a
          class="card card-lg"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          key={item.url}
        >
          <span class="card-icon" aria-hidden="true">{item.icon}</span>
          <span class="card-body">
            <span class="card-title">{item.title}</span>
            <span class="card-desc">{item.desc}</span>
          </span>
          <span class="card-arrow" aria-hidden="true">→</span>
        </a>
      ))}
      <div class="card card-lg placeholder">
        <span class="card-icon" aria-hidden="true">＋</span>
        <span class="card-body">
          <span class="card-title">更多即将到来</span>
          <span class="card-desc">敬请期待</span>
        </span>
      </div>
    </>
  );
}
