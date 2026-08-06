// 屏 2 卡片墙——只读窗口块（管理与展示解耦：展示页 /heart 屏 2 只读绘制；编辑/拖拽/缩放/增删
// 在独立 admin 管理页——本文件零交互逻辑）。
// 数据源：fetch('./config.json')（2s 超时 abort——失败回退内置 LINKS）→ 渲染 config.sites。
// 根 .cards-window：固定设计坐标系 1280×720（同 .stage-window 哲学）——
//   JS 算 scale = min(容器宽/1280, 容器高/720)（容器 = 本组件父元素，Heart 的 .card-wall.screen2-card-wall），
//   inline transform: translate(-50%,-50%) scale(s) + transform-origin:center，window resize 重算；
//   useLayoutEffect 在 paint 前完成初始计算——无缩放闪烁。
// 卡片：.card.card-lg.cw-card（absolute——left/top/width/height 百分比，相对 .cards-window 设计坐标）——
//   config 卡带 x/y/w/h（百分比——admin 管理页导出格式）则按布局放；无布局自动 2 列网格
//   （w=44% h=38%——按数量不重叠）。
// 每卡内容：SiteFavicon（/api/favicon?url=域名——onError 灰阶首字母 fallback）+ 标题 + 域名副行 + 箭头，
//   整体链接 target _blank；favicon img draggable={false}。
// 契约类名（styles.css 由另一小弟统一维护，本文件只声明结构）：
//   .cards-window / .cw-card / .card-favicon / .card-favicon-fallback。
//   .cards-window 需要的 CSS：定位到容器中心以配合 translate(-50%,-50%) 居中（transform-origin:center
//   已由 JS 内联）——推荐 position:absolute; left:50%; top:50%（同 .stage-window 居中锚点思路），
//   且需脱离文档流，避免 1280×720 的占位撑动容器。
// 红线：零依赖；纯白灰阶（站点图标本身彩色是内容不算 UI 违规）；只读（无拖拽/缩放/增删/localStorage）。
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import type { JSX } from "preact";

interface Site {
  title: string;
  url: string;
  desc?: string; // 仅内置 LINKS 带描述；config 书签栏只有标题+地址（副行显示域名）
  // admin 管理页导出布局（百分比——config 可选字段；缺失则该卡自动排）
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface Layout {
  x: number; // 左上角横坐标（容器宽 %）
  y: number; // 左上角纵坐标（容器高 %）
  w: number; // 宽（%）
  h: number; // 高（%）
}

// 设计坐标系（同 .stage-window）——scale = min(容器宽/1280, 容器高/720)
const DESIGN_W = 1280;
const DESIGN_H = 720;
const GRID_W = 44, GRID_H = 38; // 自动排布默认卡尺寸（%）

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

// 自动排布：2 列网格铺开（w=44%、h=38%——与默认大卡视觉接近；按数量不重叠）
function autoLayout(index: number): Layout {
  const col = index % 2;
  const row = Math.floor(index / 2);
  return { x: 3 + col * 50, y: 4 + row * 46, w: GRID_W, h: GRID_H };
}

// 布局解析：config 卡带 x/y/w/h（管理页导出格式）则按布局放；缺任一字段回退自动排
function layoutOf(site: Site, index: number): Layout {
  if (
    typeof site.x === "number" &&
    typeof site.y === "number" &&
    typeof site.w === "number" &&
    typeof site.h === "number"
  ) {
    return { x: site.x, y: site.y, w: site.w, h: site.h };
  }
  return autoLayout(index);
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
      draggable={false} /* 防止 favicon 被浏览器原生拖拽 */
      onError={() => setFailed(true)}
    />
  );
}

export default function CardWall(): JSX.Element {
  // 初始即内置 LINKS——首屏无空白；config 加载成功后替换（失败/超时保持内置）
  const [sites, setSites] = useState<Site[]>(LINKS);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  // config 加载（2s 超时 abort——失败/超时保持内置 LINKS fallback）
  useEffect(() => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 2000);
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

  // 窗口块 fit（同 .stage-window 哲学）：scale = min(容器宽/1280, 容器高/720)——
  // 容器 = 本组件父元素（Heart 的 .card-wall.screen2-card-wall）；window resize 重算
  useLayoutEffect(() => {
    const apply = () => {
      const host = rootRef.current?.parentElement;
      const cw = host?.clientWidth ?? window.innerWidth;
      const ch = host?.clientHeight ?? window.innerHeight;
      setScale(Math.min(cw / DESIGN_W, ch / DESIGN_H));
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return (
    <div
      class="cards-window"
      ref={rootRef}
      style={{
        width: `${DESIGN_W}px`,
        height: `${DESIGN_H}px`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      {sites.map((site, i) => {
        const l = layoutOf(site, i);
        return (
          <div
            key={site.url}
            class="card card-lg cw-card"
            style={{
              left: `${l.x}%`,
              top: `${l.y}%`,
              width: `${l.w}%`,
              height: `${l.h}%`,
            }}
          >
            <a
              class="card-inner"
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiteFavicon url={site.url} title={site.title} />
              <span class="card-body">
                <span class="card-title">{site.title}</span>
                <span class="card-desc">
                  {site.desc ?? hostOf(site.url) ?? site.title}
                </span>
              </span>
              <span class="card-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        );
      })}
    </div>
  );
}
