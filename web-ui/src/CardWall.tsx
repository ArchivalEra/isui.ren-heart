// 卡片墙：拟物化按钮（纯 CSS 卡片堆）+ 下拉展开（页面内，不跳转）
import { useState } from "preact/hooks";

const LINKS = [
  { title: "X (Twitter)", url: "https://x.com", icon: "𝕏", desc: "乐队动态" },
  { title: "YouTube", url: "https://youtube.com", icon: "▶", desc: "视频与音乐" },
  { title: "官方网站", url: "https://tayori-official.com", icon: "◎", desc: "官网" },
];

export default function CardWall() {
  const [open, setOpen] = useState(false);
  return (
    <div class="card-wall-wrap">
      <button
        class="card-wall-btn"
        aria-label="卡片墙"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
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
