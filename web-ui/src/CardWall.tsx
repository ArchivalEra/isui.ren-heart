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
    <div class="card-wall-wrap">
      <button
        class="card-wall-btn"
        aria-label="卡片墙"
        aria-expanded={open}
        onClick={() => onToggle(!open)}
      >
        {/* Material Symbols folder（M3 线条图标） */}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      </button>
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
