// 屏 2 卡片墙：config.json 驱动 + 自动网格排版
// 容器契约：.card-wall.screen2-card-wall（Heart 放置）——flex wrap 混合排版
// 兼容模式（用户钦定）：字段全可选——
//   · 有 url 即成为可点完整卡片
//   · icon/desc 缺省不渲染（不做 fallback 方块/域名）
//   · 光图标无文字 → .icon-only 贴合图标比例小方卡；无图标光文字 → 纯文字卡片
// FitText（用户钦定：不要省略号——文字放不下就缩小字号，JS 测量二分，
//   零依赖；ResizeObserver 兜底卡片宽度变化）
// 数据：public/config.json { sites: [{ title, url, desc, icon }] }——fetch 2s
// 超时 fallback 内置三站
import { useEffect, useRef, useState } from "preact/hooks";
import type { JSX } from "preact";

interface Site {
  title?: string;
  url?: string;
  desc?: string;
  icon?: string;
}

const FALLBACK: Site[] = [
  { title: "X (Twitter)", url: "https://x.com", desc: "乐队动态", icon: "𝕏" },
  { title: "YouTube", url: "https://youtube.com", desc: "视频与音乐", icon: "▶" },
  { title: "官方网站", url: "https://tayori-official.com", desc: "官网", icon: "◎" },
];

/** 字号自适应：放不下就逐步缩小（下限 62%），绝不省略号 */
function FitText({
  className,
  children,
}: {
  className: string;
  children?: JSX.Element | string;
}): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      if (!el.isConnected) return;
      el.style.fontSize = "";
      const base = parseFloat(getComputedStyle(el).fontSize) || 16;
      let s = base;
      while (s > base * 0.62) {
        el.style.fontSize = s + "px";
        if (
          el.scrollWidth <= el.clientWidth + 1 &&
          el.scrollHeight <= el.clientHeight + 1
        ) {
          break;
        }
        s *= 0.92;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [children]);
  return (
    <span ref={ref} class={className}>
      {children}
    </span>
  );
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
      {sites.map((site) => {
        const hasIcon = !!site.icon;
        const hasTitle = !!site.title;
        const hasDesc = !!site.desc;
        const onlyIcon = hasIcon && !hasTitle && !hasDesc;
        const cls = ["wall-card", "card", "card-lg"];
        if (onlyIcon) cls.push("icon-only");
        return (
          <a
            class={cls.join(" ")}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            key={site.url || site.title || site.icon}
          >
            {hasIcon && (
              <span class="cw-icon" aria-hidden="true">
                {site.icon}
              </span>
            )}
            {(hasTitle || hasDesc) && (
              <span class="card-body">
                {hasTitle && (
                  <FitText className="card-title">{site.title}</FitText>
                )}
                {hasDesc && (
                  <FitText className="card-desc">{site.desc}</FitText>
                )}
              </span>
            )}
            {!onlyIcon && (
              <span class="card-arrow" aria-hidden="true">→</span>
            )}
          </a>
        );
      })}
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
