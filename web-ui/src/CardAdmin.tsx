// 卡片管理编辑器（cn.isui.ren/admin#xxx——Heart.tsx hash 路由挂载的全屏覆盖层）
// 管理与展示解耦：展示端（/heart 屏 2）只读渲染 config.json；管理端负责编辑——
// 可视化拖拽/缩放/增删/属性编辑——导出 JSON 贴回仓库 public/config.json 部署即热更新。
// 红线：零依赖（原生 Pointer Events）；纯白灰阶（favicon 彩色是内容不算 UI）；
//       不写 localStorage（导出 JSON 是唯一输出——刷新即回到 config 原始态）。
// 数据：启动 fetch('./config.json')（失败空列表）→ 内存编辑状态（改动不自动持久化）。
// 坐标：1280×720 设计坐标系（.admin-canvas）——卡片 absolute 百分比（x/y/w/h）。
// 交互：拖（卡片任意处——setPointerCapture——x/y 百分比 clamp——松手吸附 2% 网格）；
//       缩放（右下角 .card-resize 手柄——w/h clamp 宽 20-90%/高 15-70%）；
//       选中（点击高亮——左下角属性面板实时编辑标题/URL）；删除（Delete 键或面板按钮）。
import { useEffect, useRef, useState } from "preact/hooks";
import type { JSX } from "preact";

interface Site {
  title: string;
  url: string;
}

interface Card extends Site {
  x: number; // 左上角横坐标（canvas 宽 %）
  y: number; // 左上角纵坐标（canvas 高 %）
  w: number; // 宽（%）
  h: number; // 高（%）
}

const SNAP = 2; // 松手吸附网格粒度（%）
const MIN_W = 20, MAX_W = 90; // 宽 clamp
const MIN_H = 15, MAX_H = 70; // 高 clamp
const DEFAULT_W = 44, DEFAULT_H = 38; // 添加默认卡尺寸（%）

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

const round2 = (v: number): number => Math.round(v * 100) / 100;

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// 自动排布：2 列网格铺开（默认卡 44×38%——与添加默认尺寸一致）
function autoLayout(index: number): { x: number; y: number; w: number; h: number } {
  const col = index % 2;
  const row = Math.floor(index / 2);
  return { x: 3 + col * 50, y: 4 + row * 46, w: DEFAULT_W, h: DEFAULT_H };
}

// 添加新卡找空位：2 列网格从左上往右下扫，取首个不与现有卡重叠的格子
function findFreeSpot(cards: Card[]): { x: number; y: number; w: number; h: number } {
  for (let i = 0; i < 400; i++) {
    const spot = autoLayout(i);
    const hit = cards.some(
      (o) =>
        o.x < spot.x + spot.w - 0.5 &&
        spot.x < o.x + o.w - 0.5 &&
        o.y < spot.y + spot.h - 0.5 &&
        spot.y < o.y + o.h - 0.5,
    );
    if (!hit) return spot;
  }
  return autoLayout(cards.length);
}

// 站点图标：浏览器书签栏式 favicon（站点图标本身彩色是内容，不算 UI 灰阶违规）
function SiteFavicon({ url, title }: { url: string; title: string }): JSX.Element {
  const [failed, setFailed] = useState(false);
  const host = hostOf(url);
  const letter = (title.trim().charAt(0) || "?").toUpperCase();
  if (failed || host === null || !url) {
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
      draggable={false} /* 防止拖拽卡片时 favicon 被浏览器原生拖拽 */
      onError={() => setFailed(true)}
    />
  );
}

export default function CardAdmin(): JSX.Element {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number | null>(null); // 数组下标（url 可编辑——用 index 作 id）
  const [draft, setDraft] = useState({ title: "", url: "" }); // 属性面板输入（选中卡实时编辑）
  const [scale, setScale] = useState(1); // 画布 fit 缩放
  const [toast, setToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLElement>(null);
  // 拖拽会话（orig 固定=按下瞬间值——move 用 delta 计算，不随帧漂移）
  const dragRef = useRef<{ idx: number; px: number; py: number; ox: number; oy: number } | null>(null);
  // 缩放会话（同上——含原始宽高）
  const resizeRef = useRef<{ idx: number; px: number; py: number; ox: number; oy: number; ow: number; oh: number } | null>(null);
  const toastTimer = useRef(0);

  // 加载 config（失败空列表）——重置时重新调用
  const loadConfig = () => {
    const ac = new AbortController();
    fetch("./config.json", { signal: ac.signal })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)),
      )
      .then((data) => {
        if (Array.isArray(data?.sites)) {
          const sites = data.sites as Array<{
            title?: unknown;
            url?: unknown;
            x?: unknown;
            y?: unknown;
            w?: unknown;
            h?: unknown;
          }>;
          setCards(
            sites
              .filter((s) => s && typeof s.url === "string")
              .map((s, i) => ({
                title: typeof s.title === "string" ? s.title : "",
                url: s.url as string,
                x: typeof s.x === "number" ? s.x : autoLayout(i).x,
                y: typeof s.y === "number" ? s.y : autoLayout(i).y,
                w: typeof s.w === "number" ? s.w : autoLayout(i).w,
                h: typeof s.h === "number" ? s.h : autoLayout(i).h,
              })),
          );
        }
      })
      .catch(() => {
        setCards([]); // 失败/超时——空列表（不写 localStorage，刷新即恢复）
      });
    return ac;
  };

  useEffect(() => {
    const ac = loadConfig();
    return () => ac.abort();
  }, []);

  // 画布 fit：scale = min(视口宽/1280, (视口高 - 工具条高)/720)——居中
  useEffect(() => {
    const fit = () => {
      const tb = toolbarRef.current?.offsetHeight ?? 56;
      const s = Math.min(
        window.innerWidth / 1280,
        (window.innerHeight - tb) / 720,
      );
      setScale(Math.max(0.1, s));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Delete 键删除选中卡
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selected !== null) deleteSelected();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  const select = (idx: number) => {
    setSelected(idx);
    const c = cards[idx];
    if (c) setDraft({ title: c.title, url: c.url });
  };

  const patchCard = (idx: number, patch: Partial<Card>) =>
    setCards((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  // ── 拖拽 ──
  const onCardDown = (e: PointerEvent, idx: number, card: Card) => {
    if (e.button !== 0 && e.pointerType === "mouse") return; // 只响应左键
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { idx, px: e.clientX, py: e.clientY, ox: card.x, oy: card.y };
    select(idx);
  };

  const onCardMove = (e: PointerEvent, idx: number) => {
    const d = dragRef.current;
    if (!d || d.idx !== idx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const x = round2(clamp(d.ox + ((e.clientX - d.px) / rect.width) * 100, 0, 100 - c.w));
        const y = round2(clamp(d.oy + ((e.clientY - d.py) / rect.height) * 100, 0, 100 - c.h));
        return { ...c, x, y };
      }),
    );
  };

  const onCardUp = (e: PointerEvent, idx: number) => {
    const d = dragRef.current;
    if (!d || d.idx !== idx) return;
    dragRef.current = null;
    // 松手吸附 2% 网格
    setCards((prev) =>
      prev.map((c, i) =>
        i === idx
          ? { ...c, x: Math.round(c.x / SNAP) * SNAP, y: Math.round(c.y / SNAP) * SNAP }
          : c,
      ),
    );
  };

  // ── 缩放（右下角手柄）──
  const onResizeDown = (e: PointerEvent, idx: number, card: Card) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation(); // 不触发卡片拖拽
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resizeRef.current = {
      idx,
      px: e.clientX,
      py: e.clientY,
      ox: card.x,
      oy: card.y,
      ow: card.w,
      oh: card.h,
    };
    select(idx);
  };

  const onResizeMove = (e: PointerEvent, idx: number) => {
    const r = resizeRef.current;
    if (!r || r.idx !== idx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const w = clamp(r.ow + ((e.clientX - r.px) / rect.width) * 100, MIN_W, MAX_W);
        const h = clamp(r.oh + ((e.clientY - r.py) / rect.height) * 100, MIN_H, MAX_H);
        return {
          ...c,
          x: round2(clamp(r.ox, 0, 100 - w)),
          y: round2(clamp(r.oy, 0, 100 - h)),
          w: round2(w),
          h: round2(h),
        };
      }),
    );
  };

  const onResizeUp = (e: PointerEvent, idx: number) => {
    if (resizeRef.current?.idx !== idx) return;
    resizeRef.current = null;
  };

  // ── 增删 ──
  const addCard = () => {
    const spot = findFreeSpot(cards);
    const card: Card = { title: "新站点", url: "", ...spot };
    setCards((prev) => [...prev, card]);
    setSelected(cards.length);
    setDraft({ title: card.title, url: card.url });
  };

  const deleteSelected = () => {
    if (selected === null) return;
    setCards((prev) => prev.filter((_, i) => i !== selected));
    setSelected(null);
    setDraft({ title: "", url: "" });
  };

  // ── 导出 JSON（clipboard → textarea fallback）──
  const exportJson = () => {
    const json = JSON.stringify(
      {
        sites: cards.map((c) => ({
          title: c.title,
          url: c.url,
          x: c.x,
          y: c.y,
          w: c.w,
          h: c.h,
        })),
      },
      null,
      2,
    );
    const done = () => showToast("已复制——贴回仓库 public/config.json 部署即热更新");
    const fail = () => showToast("复制失败——请检查剪贴板权限");
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).then(done).catch(() => fallbackCopy(json, done, fail));
    } else {
      fallbackCopy(json, done, fail);
    }
  };

  const fallbackCopy = (text: string, ok: () => void, bad: () => void) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      ok();
    } catch {
      bad();
    }
    document.body.removeChild(ta);
  };

  // ── 工具条 ──
  const exit = () => {
    window.location.hash = ""; // 清 hash → Heart 恢复展示页
  };

  const reset = () => {
    loadConfig(); // 重新 fetch config（丢弃内存编辑）
    setSelected(null);
    setDraft({ title: "", url: "" });
  };

  return (
    <div class="admin-overlay">
      <header class="admin-toolbar" ref={toolbarRef}>
        <span class="admin-toolbar-title">卡片管理</span>
        <button class="admin-btn" onClick={exit}>返回</button>
        <button class="admin-btn" onClick={reset}>重置</button>
        <button class="admin-btn primary" onClick={exportJson}>导出 JSON</button>
      </header>
      <div class="admin-canvas-wrap">
        <div class="admin-canvas" ref={canvasRef} style={{ transform: `scale(${scale})` }}>
          {cards.map((c, i) => (
            <div
              key={i}
              class={`cw-card${selected === i ? " selected" : ""}`}
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.w}%`,
                height: `${c.h}%`,
              }}
              onPointerDown={(e) => onCardDown(e, i, c)}
              onPointerMove={(e) => onCardMove(e, i)}
              onPointerUp={(e) => onCardUp(e, i)}
              onPointerCancel={(e) => onCardUp(e, i)}
            >
              <SiteFavicon url={c.url} title={c.title} />
              <span class="card-body">
                <span class="card-title">{c.title || "（未命名）"}</span>
                <span class="card-desc">{hostOf(c.url) ?? (c.url || "待填 URL")}</span>
              </span>
              {selected === i && (
                <span
                  class="card-resize"
                  aria-hidden="true"
                  onPointerDown={(e) => onResizeDown(e, i, c)}
                  onPointerMove={(e) => onResizeMove(e, i)}
                  onPointerUp={(e) => onResizeUp(e, i)}
                  onPointerCancel={(e) => onResizeUp(e, i)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {selected !== null && (
        <aside class="admin-props">
          <label>
            标题
            <input
              value={draft.title}
              onInput={(e) => {
                const v = (e.target as HTMLInputElement).value;
                setDraft((d) => ({ ...d, title: v }));
                patchCard(selected!, { title: v });
              }}
            />
          </label>
          <label>
            URL
            <input
              value={draft.url}
              onInput={(e) => {
                const v = (e.target as HTMLInputElement).value;
                setDraft((d) => ({ ...d, url: v }));
                patchCard(selected!, { url: v });
              }}
            />
          </label>
          <div class="admin-props-actions">
            <button class="admin-btn danger" onClick={deleteSelected}>删除</button>
          </div>
        </aside>
      )}
      {toast && <div class="admin-toast">{toast}</div>}
    </div>
  );
}
