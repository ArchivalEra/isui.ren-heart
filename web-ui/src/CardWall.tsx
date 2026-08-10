// 屏 2 卡片墙（最终形态）：config.json 驱动 + 自动网格排版
// 容器契约：.card-wall.screen2-card-wall（Heart 放置）——.screen2-card-wall 负责
// 网格布局（auto-fill minmax——数量自适应）；卡片 .wall-card（白底细边圆角大卡）
// 数据：public/config.json { sites: [{ title, url, desc, icon }] }——fetch 2s
// 超时 fallback 内置三站；icon 缺省取域名首字母（纯灰阶、零依赖、不联网取 favicon）
import { useEffect, useState } from "preact/hooks";
import type { JSX } from "preact";

interface Site {
  title: string;
  url: string;
  desc?: string;
  icon?: string;
}

const FALLBACK: Site[] = [
  { title: "X (Twitter)", url: "https://x.com", desc: "乐队动态", icon: "𝕏" },
  { title: "YouTube", url: "https://youtube.com", desc: "视频与音乐", icon: "▶" },
  { title: "官方网站", url: "https://tayori-official.com", desc: "官网", icon: "◎" },
];

/** icon 缺省 → 域名首字母（灰阶方块——不联网） */
function iconFor(site: Site): string {
  if (site.icon) return site.icon;
  const host = (site.url || "").replace(/^https?:\/\//, "").split("/")[0];
  return (host && host[0] ? host[0] : "?").toUpperCase();
}

/** desc 缺省 → 域名（去 www） */
function descFor(site: Site): string {
  if (site.desc) return site.desc;
  return (site.url || "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

export default function CardWall(
  _props: { open?: boolean; onToggle?: (v: boolean) => void },
): JSX.Element {
  const [sites, setSites] = useState<Site[]>(FALLBACK);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2000);
    fetch("./config.json", { signal: ctrl.signal })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((data) => {
        if (alive && Array.isArray(data?.sites)) setSites(data.sites);
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  return (
    <>
      {sites.map((site) => (
        <a
          class="wall-card card card-lg"
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          key={site.url || site.title}
        >
          <span class="cw-icon" aria-hidden="true">
            {iconFor(site)}
          </span>
          <span class="card-body">
            <span class="card-title">{site.title}</span>
            <span class="card-desc">{descFor(site)}</span>
          </span>
          <span class="card-arrow" aria-hidden="true">→</span>
        </a>
      ))}
      {/* 幽灵占位卡：非链接——凑满网格、暗示更多内容（设计元素，永远存在） */}
      <div class="wall-card placeholder" aria-hidden="true">
        <span class="cw-icon">＋</span>
        <span class="card-body">
          <span class="card-title">更多即将到来</span>
          <span class="card-desc">敬请期待</span>
        </span>
      </div>
    </>
  );
}
