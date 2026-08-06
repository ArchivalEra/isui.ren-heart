// 统一卡片管理编辑器（cn.isui.ren/admin#heart——Heart.tsx hash 路由挂载的全屏覆盖层）
// 管理与展示解耦：展示端（/heart 屏 2）只读渲染 config.json；管理端负责编辑——
// 可视化拖拽/缩放/增删/属性编辑——导出 JSON 贴回仓库 public/config.json 部署即热更新。
// 统一管理页（用户钦定架构）：三个横向栏目——通用配置 / cn 配置 / global 配置——
// 各自独立编辑卡片（拖拽/缩放/增删/属性面板——原单栏逻辑按栏复用，每栏独立的选中态/拖拽状态）；
// cn/global 栏有「继承通用」开关：勾选 → 该栏 canvas 顶部提示「继承中」并把 default.sites
// 以半透明只读参照铺在画布底层（参照不可交互）——本栏编辑的仍是自己的 sites——导出时 inherit 字段写入；
// 导出整体三段 JSON：{ default:{sites,pages}, cn:{inherit,sites,pages}, global:{inherit,sites,pages} }——
// pages = 页面规则（Record<path,{enabled,params}>：通配符 path + 启用开关 + k=v 参数——每栏独立）。
// 红线：零依赖（原生 Pointer Events + ResizeObserver）；纯白灰阶（favicon 彩色是内容不算 UI）；
//       不写 localStorage（导出 JSON 是唯一输出——刷新即回到 config 原始态）。
// 数据：启动 fetch('./config.json')（兼容旧格式 {sites} → 当 default 段；失败空列表）→
//       三段内存编辑状态（defaultSites/cnSites/globalSites + defaultPages/cnPages/globalPages
//       + inheritCb/inheritGb——改动不自动持久化）。
// 坐标：每栏独立 1280×720 设计坐标系（.admin-canvas）——卡片 absolute 百分比（x/y/w/h）；
//       每栏 canvas 按各自容器 fit 缩放（ResizeObserver 监听 .admin-canvas-wrap）。
// 交互：拖（卡片任意处——setPointerCapture——x/y 百分比 clamp——松手吸附 2% 网格）；
//       缩放（右下角 .card-resize 手柄——w/h clamp 宽 20-90%/高 15-70%）；
//       选中（点击高亮——栏内左下角属性面板实时编辑标题/URL）；删除（Delete 键或面板按钮）。
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

// 页面规则：path 通配符模式（如 /heart、/card/*、*）+ 启用开关 + 键值参数（k=v）
// 有序数组编辑（可上下移——匹配按顺序优先、具体规则放前）——导出时转 Record 保序
interface PageRule {
  path: string;
  enabled: boolean;
  params: Record<string, string>;
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

// ── 单个栏目（三个 .admin-pane 并排——每栏独立编辑状态/拖拽会话/选中态）──
// 受控组件：cards/selected/draft 由父组件持有（导出/重置需要统一读取）；
// 栏内只管理 scale/fit 与 Pointer 会话 ref。
interface AdminPaneProps {
  title: string; // 栏名（通用配置 / cn 配置 / global 配置）
  cards: Card[];
  onCards: (updater: (prev: Card[]) => Card[]) => void;
  pages: PageRule[]; // 页面规则（有序——导出转 Record 保序，匹配按顺序优先）
  onPages: (updater: (prev: PageRule[]) => PageRule[]) => void;
  selected: number | null;
  onSelected: (i: number | null) => void;
  draft: { title: string; url: string };
  onDraft: (d: { title: string; url: string }) => void;
  inherit?: boolean; // 继承通用开关（仅 cn/global 栏有）
  onInherit?: (v: boolean) => void;
  reference?: Card[]; // 继承勾选时半透明只读参照（default.sites）
}

function AdminPane({
  title,
  cards,
  onCards,
  selected,
  onSelected,
  draft,
  onDraft,
  pages,
  onPages,
  inherit = false,
  onInherit,
  reference = [],
}: AdminPaneProps): JSX.Element {
  const [scale, setScale] = useState(1); // 画布 fit 缩放（每栏独立）
  const [tab, setTab] = useState<"sites" | "rules">("sites"); // 栏内 tab：站点卡片 / 页面规则
  const [search, setSearch] = useState(""); // 页面规则搜索（按 path 简单 includes）

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  // 拖拽会话（orig 固定=按下瞬间值——move 用 delta 计算，不随帧漂移）
  const dragRef = useRef<{ idx: number; px: number; py: number; ox: number; oy: number } | null>(null);
  // 缩放会话（同上——含原始宽高）
  const resizeRef = useRef<{ idx: number; px: number; py: number; ox: number; oy: number; ow: number; oh: number } | null>(null);

  // 画布 fit：scale = min(容器宽/1280, 容器高/720)——ResizeObserver 监听 .admin-canvas-wrap
  //（三栏并排时容器宽度随视口/横向滚动变化，ResizeObserver 比 window resize 更稳）
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const apply = () => {
      const s = Math.min(
        wrap.clientWidth / 1280,
        wrap.clientHeight / 720,
      );
      setScale(Math.max(0.1, s));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [tab]); // 依赖 tab：切回「站点卡片」时 canvas-wrap 重新挂载——需重新 apply + observe（否则 fit 失效）

  // Delete 键删除本栏选中卡（每栏独立注册——只在自己有选中时生效）
  useEffect(() => {
    if (tab !== "sites" || selected === null) return; // 仅「站点卡片」tab 响应 Delete
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        e.preventDefault();
        onCards((prev) => prev.filter((_, i) => i !== selected));
        onSelected(null);
        onDraft({ title: "", url: "" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, tab]);

  const select = (idx: number) => {
    onSelected(idx);
    const c = cards[idx];
    if (c) onDraft({ title: c.title, url: c.url });
  };

  const patchCard = (idx: number, patch: Partial<Card>) =>
    onCards((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

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
    onCards((prev) =>
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
    onCards((prev) =>
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
    onCards((prev) =>
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
    onCards((prev) => [...prev, card]);
    onSelected(cards.length);
    onDraft({ title: card.title, url: card.url });
  };

  const deleteSelected = () => {
    if (selected === null) return;
    onCards((prev) => prev.filter((_, i) => i !== selected));
    onSelected(null);
    onDraft({ title: "", url: "" });
  };

  // ── 页面规则编辑（栏内有序数组——搜索过滤 + 上下移保序）──
  // 搜索过滤：按 path 简单 includes（空搜索 = 全量）
  const q = search.trim().toLowerCase();
  const filtered = q ? pages.filter((r) => r.path.toLowerCase().includes(q)) : pages;

  const switchTab = (t: "sites" | "rules") => {
    setTab(t);
    if (t === "rules" && selected !== null) {
      // 规则 tab 与卡片选中无关——切走时清空选中/草稿
      onSelected(null);
      onDraft({ title: "", url: "" });
    }
  };

  const patchRule = (i: number, patch: Partial<PageRule>) =>
    onPages((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addRule = () =>
    onPages((prev) => [...prev, { path: "*", enabled: true, params: {} }]);

  const delRule = (i: number) => onPages((prev) => prev.filter((_, idx) => idx !== i));

  // 上下移：在过滤列表内相邻交换（对象引用映射回原数组——搜索过滤下相对顺序不变）
  const moveRule = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= filtered.length) return;
    const from = pages.indexOf(filtered[i]);
    const to = pages.indexOf(filtered[j]);
    if (from < 0 || to < 0) return;
    onPages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  // 参数键值对编辑（对象存储——改名=删旧键+插新键，保持顺序）
  const renameParam = (i: number, oldKey: string, newKey: string) =>
    onPages((prev) =>
      prev.map((r, idx) => {
        if (idx !== i || newKey === oldKey) return r; // 未改名不触碰（避免键重排）
        const params = { ...r.params };
        delete params[oldKey];
        params[newKey] = r.params[oldKey];
        return { ...r, params };
      }),
    );

  const setParamVal = (i: number, key: string, val: string) =>
    onPages((prev) =>
      prev.map((r, idx) =>
        idx === i ? { ...r, params: { ...r.params, [key]: val } } : r,
      ),
    );

  const delParam = (i: number, key: string) =>
    onPages((prev) =>
      prev.map((r, idx) => {
        if (idx !== i) return r;
        const params = { ...r.params };
        delete params[key];
        return { ...r, params };
      }),
    );

  const addParam = (i: number) =>
    onPages((prev) =>
      prev.map((r, idx) => {
        if (idx !== i) return r;
        const params = { ...r.params };
        let n = 1;
        let k = `参数${n}`;
        while (k in params) {
          n += 1;
          k = `参数${n}`;
        }
        params[k] = "";
        return { ...r, params };
      }),
    );

  return (
    <section class="admin-pane">
      <div class="admin-pane-head">
        <span class="admin-pane-title">{title}</span>
        <span class="admin-tabs">
          <button
            class={`admin-tab${tab === "sites" ? " active" : ""}`}
            onClick={() => switchTab("sites")}
          >
            站点卡片
          </button>
          <button
            class={`admin-tab${tab === "rules" ? " active" : ""}`}
            onClick={() => switchTab("rules")}
          >
            页面规则
          </button>
        </span>
        <span class="admin-pane-spacer" />
        {onInherit && (
          <label class="admin-check">
            <input
              type="checkbox"
              checked={inherit}
              onChange={(e) => onInherit((e.target as HTMLInputElement).checked)}
            />
            继承通用
          </label>
        )}
        {tab === "sites" ? (
          <button class="admin-btn" onClick={addCard}>＋ 添加</button>
        ) : (
          <button class="admin-btn" onClick={addRule}>＋ 添加规则</button>
        )}
      </div>
      {tab === "sites" ? (
        <div class="admin-canvas-wrap" ref={wrapRef}>
          <div class="admin-canvas" ref={canvasRef} style={{ transform: `scale(${scale})` }}>
          {inherit &&
            reference.map((c, i) => (
              <div
                key={`ref-${i}`}
                class="cw-card inherit-ref"
                style={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  width: `${c.w}%`,
                  height: `${c.h}%`,
                }}
              >
                <span class="card-body">
                  <span class="card-title">{c.title || "（未命名）"}</span>
                  <span class="card-desc">{hostOf(c.url) ?? (c.url || "待填 URL")}</span>
                </span>
              </div>
            ))}
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
        {inherit && (
          <div class="admin-inherit-hint">继承中——通用配置半透明只读参照（编辑的仍是本栏 sites）</div>
        )}
        {selected !== null && (
          <aside class="admin-props">
            <label>
              标题
              <input
                value={draft.title}
                onInput={(e) => {
                  const v = (e.target as HTMLInputElement).value;
                  onDraft({ ...draft, title: v });
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
                  onDraft({ ...draft, url: v });
                  patchCard(selected!, { url: v });
                }}
              />
            </label>
            <div class="admin-props-actions">
              <button class="admin-btn danger" onClick={deleteSelected}>删除</button>
            </div>
          </aside>
        )}
        </div>
      ) : (
        <div class="admin-rules">
          <input
            class="admin-search"
            type="search"
            placeholder="搜索规则（按 path 过滤）"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          />
          <div class="admin-rules-list">
            {filtered.length === 0 && (
              <div class="admin-rules-empty">
                {pages.length === 0 ? "无规则——全部 fallback default" : "没有匹配的规则"}
              </div>
            )}
            {filtered.map((r, i) => (
              <div class="admin-rule" key={pages.indexOf(r)}>
                <div class="admin-rule-head">
                  <input
                    class="admin-rule-path"
                    value={r.path}
                    placeholder="/heart、/card/*、*"
                    onInput={(e) =>
                      patchRule(pages.indexOf(r), { path: (e.target as HTMLInputElement).value })
                    }
                  />
                  <label class="admin-check admin-rule-enabled">
                    <input
                      type="checkbox"
                      checked={r.enabled}
                      onChange={(e) =>
                        patchRule(pages.indexOf(r), {
                          enabled: (e.target as HTMLInputElement).checked,
                        })
                      }
                    />
                    enabled
                  </label>
                  <span class="admin-rule-order">
                    <button
                      class="admin-rule-move"
                      disabled={i === 0}
                      onClick={() => moveRule(i, -1)}
                      title="上移（匹配更优先）"
                    >↑</button>
                    <button
                      class="admin-rule-move"
                      disabled={i === filtered.length - 1}
                      onClick={() => moveRule(i, 1)}
                      title="下移"
                    >↓</button>
                  </span>
                  <button class="admin-btn danger" onClick={() => delRule(pages.indexOf(r))}>删除</button>
                </div>
                <div class="admin-rule-params">
                  {Object.entries(r.params).map(([k, v], pi) => (
                    <div class="admin-rule-param" key={pi}>
                      <input
                        class="admin-rule-param-key"
                        value={k}
                        placeholder="参数名"
                        onInput={(e) =>
                          renameParam(pages.indexOf(r), k, (e.target as HTMLInputElement).value)
                        }
                      />
                      <span class="admin-rule-param-eq">=</span>
                      <input
                        class="admin-rule-param-val"
                        value={v}
                        placeholder="值"
                        onInput={(e) =>
                          setParamVal(pages.indexOf(r), k, (e.target as HTMLInputElement).value)
                        }
                      />
                      <button
                        class="admin-rule-param-del"
                        onClick={() => delParam(pages.indexOf(r), k)}
                        title="删除参数"
                      >×</button>
                    </div>
                  ))}
                  <button class="admin-btn" onClick={() => addParam(pages.indexOf(r))}>＋ 参数</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function CardAdmin(): JSX.Element {
  // 三段数据（内存编辑状态——导出是唯一输出，刷新即回 config 原始态）
  const [defaultSites, setDefaultSites] = useState<Card[]>([]);
  const [cnSites, setCnSites] = useState<Card[]>([]);
  const [globalSites, setGlobalSites] = useState<Card[]>([]);
  const [defaultPages, setDefaultPages] = useState<PageRule[]>([]);
  const [cnPages, setCnPages] = useState<PageRule[]>([]);
  const [globalPages, setGlobalPages] = useState<PageRule[]>([]);
  const [inheritCb, setInheritCb] = useState(false); // cn 继承通用
  const [inheritGb, setInheritGb] = useState(false); // global 继承通用
  // 每栏独立选中态/属性面板草稿
  const [selD, setSelD] = useState<number | null>(null);
  const [selC, setSelC] = useState<number | null>(null);
  const [selG, setSelG] = useState<number | null>(null);
  const [draftD, setDraftD] = useState({ title: "", url: "" });
  const [draftC, setDraftC] = useState({ title: "", url: "" });
  const [draftG, setDraftG] = useState({ title: "", url: "" });
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef(0);

  // config 段 → Card[]（坐标缺失自动排布）
  const parseSites = (sec: { sites?: unknown } | null | undefined): Card[] => {
    if (!sec || !Array.isArray(sec.sites)) return [];
    const sites = sec.sites as Array<{
      title?: unknown;
      url?: unknown;
      x?: unknown;
      y?: unknown;
      w?: unknown;
      h?: unknown;
    }>;
    return sites
      .filter((s) => s && typeof s.url === "string")
      .map((s, i) => ({
        title: typeof s.title === "string" ? s.title : "",
        url: s.url as string,
        x: typeof s.x === "number" ? s.x : autoLayout(i).x,
        y: typeof s.y === "number" ? s.y : autoLayout(i).y,
        w: typeof s.w === "number" ? s.w : autoLayout(i).w,
        h: typeof s.h === "number" ? s.h : autoLayout(i).h,
      }));
  };

  // 页面规则段 → PageRule[]（Record<path,{enabled,params}> → 有序数组——Object.entries 保插入顺序）
  const parsePages = (sec: { pages?: unknown } | null | undefined): PageRule[] => {
    if (
      !sec ||
      typeof sec.pages !== "object" ||
      sec.pages === null ||
      Array.isArray(sec.pages)
    ) {
      return [];
    }
    return Object.entries(sec.pages as Record<string, unknown>).map(([path, raw]) => {
      const rule =
        raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
      const params: Record<string, string> = {};
      if (
        rule &&
        rule.params &&
        typeof rule.params === "object" &&
        !Array.isArray(rule.params)
      ) {
        for (const [k, v] of Object.entries(rule.params as Record<string, unknown>)) {
          params[k] = typeof v === "string" ? v : String(v);
        }
      }
      return { path, enabled: Boolean(rule?.enabled), params };
    });
  };

  // 加载 config（旧格式 {sites} → 当 default 段；失败/超时——空列表，刷新即恢复）
  const loadConfig = () => {
    const ac = new AbortController();
    fetch("./config.json", { signal: ac.signal })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)),
      )
      .then((data) => {
        const def = Array.isArray(data?.sites) ? data : data?.default;
        setDefaultSites(parseSites(def));
        setCnSites(parseSites(data?.cn));
        setGlobalSites(parseSites(data?.global));
        setDefaultPages(parsePages(def));
        setCnPages(parsePages(data?.cn));
        setGlobalPages(parsePages(data?.global));
        setInheritCb(Boolean(data?.cn?.inherit));
        setInheritGb(Boolean(data?.global?.inherit));
      })
      .catch(() => {
        setDefaultSites([]);
        setCnSites([]);
        setGlobalSites([]);
        setDefaultPages([]);
        setCnPages([]);
        setGlobalPages([]);
      });
    return ac;
  };

  useEffect(() => {
    const ac = loadConfig();
    return () => ac.abort();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // ── 导出整体三段 JSON（clipboard → textarea fallback）──
  const exportJson = () => {
    const toPlain = (c: Card) => ({
      title: c.title,
      url: c.url,
      x: c.x,
      y: c.y,
      w: c.w,
      h: c.h,
    });
    // 页面规则 → Record（保插入顺序 = 编辑顺序——空 path/空参数名无效，跳过不导出）
    const toPages = (
      rules: PageRule[],
    ): Record<string, { enabled: boolean; params: Record<string, string> }> => {
      const rec: Record<string, { enabled: boolean; params: Record<string, string> }> = {};
      for (const r of rules) {
        const path = r.path.trim();
        if (!path) continue;
        const params: Record<string, string> = {};
        for (const [k, v] of Object.entries(r.params)) {
          if (k.trim() === "") continue;
          params[k] = v;
        }
        rec[path] = { enabled: r.enabled, params };
      }
      return rec;
    };
    const json = JSON.stringify(
      {
        default: { sites: defaultSites.map(toPlain), pages: toPages(defaultPages) },
        cn: { inherit: inheritCb, sites: cnSites.map(toPlain), pages: toPages(cnPages) },
        global: { inherit: inheritGb, sites: globalSites.map(toPlain), pages: toPages(globalPages) },
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
    window.location.href = "/"; // 路径路由（/admin）→ 回首页恢复展示页
  };

  const reset = () => {
    loadConfig(); // 重新 fetch config（丢弃内存编辑）
    setSelD(null);
    setSelC(null);
    setSelG(null);
    setDraftD({ title: "", url: "" });
    setDraftC({ title: "", url: "" });
    setDraftG({ title: "", url: "" });
  };

  return (
    <div class="admin-overlay">
      <header class="admin-toolbar">
        <span class="admin-toolbar-title">配置管理</span>
        <button class="admin-btn" onClick={exit}>返回</button>
        <button class="admin-btn" onClick={reset}>重置</button>
        <button class="admin-btn primary" onClick={exportJson}>导出 JSON</button>
      </header>
      <div class="admin-panes">
        <AdminPane
          title="通用配置"
          cards={defaultSites}
          onCards={setDefaultSites}
          pages={defaultPages}
          onPages={setDefaultPages}
          selected={selD}
          onSelected={setSelD}
          draft={draftD}
          onDraft={setDraftD}
        />
        <AdminPane
          title="cn 配置"
          cards={cnSites}
          onCards={setCnSites}
          pages={cnPages}
          onPages={setCnPages}
          selected={selC}
          onSelected={setSelC}
          draft={draftC}
          onDraft={setDraftC}
          inherit={inheritCb}
          onInherit={setInheritCb}
          reference={defaultSites}
        />
        <AdminPane
          title="global 配置"
          cards={globalSites}
          onCards={setGlobalSites}
          pages={globalPages}
          onPages={setGlobalPages}
          selected={selG}
          onSelected={setSelG}
          draft={draftG}
          onDraft={setDraftG}
          inherit={inheritGb}
          onInherit={setInheritGb}
          reference={defaultSites}
        />
      </div>
      {toast && <div class="admin-toast">{toast}</div>}
    </div>
  );
}
