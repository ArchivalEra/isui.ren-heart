// 卡片墙：拟物化按钮（纯 CSS 卡片堆）+ 下拉展开（页面内，不跳转）
// 受控组件：open/onToggle 由 Heart 提升（展开时打字机文字粉化分散）
import type { JSX } from "preact";

const LINKS = [
  { title: "X (Twitter)", url: "https://x.com", icon: "𝕏", desc: "乐队动态" },
  { title: "YouTube", url: "https://youtube.com", icon: "▶", desc: "视频与音乐" },
  { title: "官方网站", url: "https://tayori-official.com", icon: "◎", desc: "官网" },
];

export default function CardWall({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: (v: boolean) => void;
}): JSX.Element {
  return (
    <div class={`card-wall-wrap${open ? " open" : ""}`}>
      <button
        class="card-wall-btn"
        aria-label="卡片墙"
        aria-expanded={open}
        onClick={() => onToggle(!open)}
      ></button>
      <div class={`card-wall${open ? " card-wall-open" : ""}`}>
        {LINKS.map((item) => (
          <a
            class="wall-card"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            key={item.url}
          >
            <span class="wall-card-icon" aria-hidden="true">{item.icon}</span>
            <span class="wall-card-body">
              <span class="wall-card-title">{item.title}</span>
              <span class="wall-card-desc">{item.desc}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
