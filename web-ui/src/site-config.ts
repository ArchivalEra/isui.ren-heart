// site-config.ts —— 共享配置模块（CardWall 与 Heart 共用）——三分层配置（default/cn/global）+ 页面访问规则。
// 数据源：fetch('./config.json')（2s 超时 abort）→ 按 hostname 选段（'cn.' 前缀 → cn；'global.' 前缀 → global；否则 default）
//   → inherit 合并（default + 自身：sites 按 url 去重、default 优先；pages 浅合并、自身 key 覆盖）；
//   matchPage() glob 通配符匹配（仅支持 *）——精确 > 最长具体模式 > 兜底 "*"；无匹配返回 null；
//   pageConfig() 取当前路径规则——无规则默认 { enabled: true }（未配置即默认开放）。
// 红线：零依赖（不引路由/glob 库）；纯白灰阶。

export interface Site {
  title: string;
  url: string;
  desc?: string; // 仅内置 LINKS 带描述；config 书签栏只有标题+地址（副行显示域名）
  // admin 管理页导出布局（百分比——config 可选字段；缺失则该卡自动排）
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface PageRule {
  enabled: boolean;
  params?: Record<string, string>;
}

export interface ConfigSegment {
  inherit?: boolean; // true = 继承 default.sites 并追加自身 sites（同 url 去重，default 优先）；false/缺省 = 完全独立
  sites: Site[];
  pages: Record<string, PageRule>; // 路径模式 → 页面访问规则
}

export interface Config {
  default: ConfigSegment;
  cn?: ConfigSegment;
  global?: ConfigSegment;
}

const FETCH_TIMEOUT_MS = 2000;

// fetch('./config.json')（2s 超时 abort）→ 解析并规范化三段（default/cn/global）。
// 失败/超时/结构非法 → null（调用方自行 fallback，如内置 LINKS / 正常渲染）
export async function fetchConfig(): Promise<Config | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch("./config.json", { signal: ac.signal });
    if (!res.ok) return null;
    return normalizeConfig(await res.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// 结构校验 + 规范化：default 段必需且 sites 为数组；cn/global 可选；pages 缺省给空对象
function normalizeConfig(data: unknown): Config | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const cfg = data as Record<string, unknown>;
  const def = normalizeSegment(cfg.default);
  if (!def) return null;
  const out: Config = { default: def };
  const cn = normalizeSegment(cfg.cn);
  if (cn) out.cn = cn;
  const global = normalizeSegment(cfg.global);
  if (global) out.global = global;
  return out;
}

function normalizeSegment(seg: unknown): ConfigSegment | null {
  if (!seg || typeof seg !== "object" || Array.isArray(seg)) return null;
  const s = seg as Record<string, unknown>;
  if (!Array.isArray(s.sites)) return null;
  const pages =
    s.pages && typeof s.pages === "object" && !Array.isArray(s.pages)
      ? (s.pages as Record<string, PageRule>)
      : {};
  return { inherit: s.inherit === true, sites: s.sites as Site[], pages };
}

// 三分层选段：hostname 以 'cn.' 开头 → cn 段；'global.' 开头 → global 段；否则 default 段
function segmentKeyOf(hostname: string): "cn" | "global" | "default" {
  if (hostname.startsWith("cn.")) return "cn";
  if (hostname.startsWith("global.")) return "global";
  return "default";
}

// 选段 + 合并：hostname 对应段（缺省回 default 段）；inherit=true → default + 自身
//   （sites 按 url 去重、default 优先；pages 浅合并、自身 key 覆盖）；
//   data 为 null → null（调用方保持内置 fallback）
export function resolveSegment(data: Config | null): ConfigSegment | null {
  if (!data) return null;
  const seg = data[segmentKeyOf(window.location.hostname)] ?? data.default;
  if (!seg) return null;
  if (!seg.inherit) return seg;
  const seen = new Set<string>();
  const sites: Site[] = [];
  for (const s of [...data.default.sites, ...seg.sites]) {
    if (seen.has(s.url)) continue;
    seen.add(s.url);
    sites.push(s);
  }
  return { ...seg, sites, pages: { ...data.default.pages, ...seg.pages } };
}

// glob 通配符匹配（仅支持 *）：精确 key 优先 → 最长具体模式优先（模式字符串越长越具体）→ 兜底 "*"。
// 无任何匹配返回 null
export function matchPage(
  pages: Record<string, PageRule> | undefined,
  path: string,
): PageRule | null {
  if (!pages) return null;
  if (pages[path]) return pages[path]; // 精确匹配优先
  let best: { len: number; rule: PageRule } | null = null;
  for (const key of Object.keys(pages)) {
    if (key === path || key === "*" || !key.includes("*")) continue;
    const re = new RegExp("^" + key.split("*").map(escapeRe).join(".*") + "$");
    if (re.test(path) && (!best || key.length > best.len)) {
      best = { len: key.length, rule: pages[key] };
    }
  }
  return (best && best.rule) || pages["*"] || null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 取当前路径的页面访问规则：选段 → 通配符匹配 → 无匹配默认开放（enabled: true）
export function pageConfig(config: Config | null, path: string): PageRule {
  const seg = config ? resolveSegment(config) : null;
  return matchPage(seg?.pages, path) ?? { enabled: true };
}
