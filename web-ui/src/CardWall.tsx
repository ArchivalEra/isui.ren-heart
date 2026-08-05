// 屏 2 卡片墙：大卡（纯 CSS 灰阶卡片——站名大字 + 描述 + 箭头）
// 容器 .screen2-card-wall 由 Heart 放置；布局/大卡样式（.card.card-lg）在 styles.css
// 数据源 = 浏览器书签栏式 config（public/config.json）——启动 fetch 相对路径加载：
// 成功用 config.sites 渲染；失败/慢（>2s 超时）fallback 内置 LINKS（同内容）——
// 站主直接改 JSON 部署即热更新，不用重新构建。
// 图标区 = favicon 自动获取（/api/favicon?url=域名，书签栏式）；
// 失败/非法域名 → 灰阶首字母 fallback（span.card-favicon-fallback）。
// （保留旧 open/onToggle 可选 props——屏 1 旧下拉交互已下线，双屏翻页后不再使用）
import { useEffect, useState } from "preact/hooks";
import type { JSX } from "preact";

interface Site {
  title: string;
  url: string;
  desc?: string; // 仅内置 LINKS 带描述；config 书签栏只有标题+地址（副行显示域名）
}

// 内置 fallback 三站（同内容——config.json 加载失败/超时兜底）
const LINKS: Site[] = [
  { title: "X (Twitter)", url: "https://x.com", desc: "乐队动态" },
  { title: "YouTube", url: "https://youtube.com", desc: "视频与音乐" },
  { title: "官方网站", url: "https://tayori-official.com", desc: "官网" },
];

// 域名提取：非法 URL 返回 null（卡片照常渲染，favicon 直接落首字母 fallback）
function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// 站点图标：浏览器书签栏式 favicon（站点图标本身彩色是内容，不算 UI 灰阶违规）
function SiteFavicon({ url, title }: { url: string; title: string }): JSX.Element {
  const [failed, setFailed] = useState(false);
  const host = hostOf(url);
  const letter = (title.trim().charAt(0) || "?").toUpperCase();
  if (failed || host === null) {
    return (
      <span class="card-favicon card-favicon-fallback" aria-hidden="true">
        {letter}
      </span>
    );
  }
  return (
    <img
      class="card-favicon"
      src={`/api/favicon?url=${encodeURIComponent(host)}`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function CardWall(
  _props: { open?: boolean; onToggle?: (v: boolean) => void },
): JSX.Element {
  // 初始即内置 LINKS——首屏无空白；config 加载成功后替换（失败/超时保持内置）
  const [sites, setSites] = useState<Site[]>(LINKS);

  useEffect(() => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 2000); // 2s 超时：慢 → 保持内置 fallback
    fetch("./config.json", { signal: ac.signal })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)),
      )
      .then((data) => {
        if (Array.isArray(data?.sites)) setSites(data.sites as Site[]);
      })
      .catch(() => {
        /* 失败/超时：什么都不做——保持内置 LINKS */
      })
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, []);

  return (
    <>
      {sites.map((item) => (
        <a
          class="card card-lg"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          key={item.url}
        >
          <SiteFavicon url={item.url} title={item.title} />
          <span class="card-body">
            <span class="card-title">{item.title}</span>
            <span class="card-desc">{item.desc ?? hostOf(item.url) ?? item.title}</span>
          </span>
          <span class="card-arrow" aria-hidden="true">→</span>
        </a>
      ))}
      {/* 占位卡「更多即将到来」：config 有空位（站点不满 4 张）时保留 */}
      {sites.length < 4 && (
        <div class="card card-lg placeholder">
          <span class="card-favicon card-favicon-fallback" aria-hidden="true">＋</span>
          <span class="card-body">
            <span class="card-title">更多即将到来</span>
            <span class="card-desc">敬请期待</span>
          </span>
        </div>
      )}
    </>
  );
}
