(function () {
"use strict";
if (typeof document === "undefined") return;

var PAGE_SELECTORS = {"articleHeadings":".article-content h2, .article-content h3, .article-content h4","articleTitle":".article-content h1","courseChip":".meta-chip","details":"details","glossaryTerm":".katex [data-term]","glossaryBubble":".glossary-bubble, .sym-bubble, [class*=bubble]","searchPanel":"search-panel","searchInput":"search-input","searchResults":"search-results","searchHit":".search-hit","searchHitTitle":".search-hit-title","hitCountRe":new RegExp("共\\s*(\\d+)\\s*页命中")};
var textOf = function textOf(el) {
  return el ? (el.textContent || '').trim() : '';
};
var createPageView = function createPageView(doc, loc) {
  const S = PAGE_SELECTORS;
  const location = loc || (doc && doc.location) || { href: '' };

  /** 当前页的小节清单（标题、层级、锚点）。 */
  function headings() {
    return Array.prototype.slice.call(doc.querySelectorAll(S.articleHeadings))
      .map((h) => ({ level: Number(String(h.tagName || '').slice(1)), title: textOf(h), anchor: h.id }))
      .filter((h) => h.title);
  }

  /** 当前页信息。 */
  function pageInfo() {
    const titleEl = doc.querySelector(S.articleTitle);
    const chip = doc.querySelector(S.courseChip);
    return {
      title: titleEl ? textOf(titleEl) : (doc.title || ''),
      // 课程 chip 的文字形如「📚 电机学」——去掉前缀 emoji 与空白。
      course: chip ? textOf(chip).replace(/^\S+\s*/, '') : '',
      url: location.href || '',
      sections: headings(),
    };
  }

  /**
   * 跳到某小节（按标题片段或锚点 id）。会**展开它所在的折叠面板**（与深链接同一条路径）。
   * @returns {{ok:boolean, title?:string, anchor?:string, reason?:string, available?:string[]}}
   */
  function openSection(byTitle, byAnchor, win) {
    const list = headings();
    let target = null;
    if (byAnchor) {
      target = doc.getElementById(byAnchor);
    } else if (byTitle) {
      const needle = String(byTitle).trim();
      const hit = list.filter((h) => h.title.indexOf(needle) >= 0);
      if (hit.length) target = doc.getElementById(hit[0].anchor);
    }
    if (!target) {
      return { ok: false, reason: 'not_found', available: list.map((h) => h.title).slice(0, 30) };
    }
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS' && !node.open) node.open = true;
    }
    const w = win || (doc.defaultView || null);
    try { target.scrollIntoView({ block: 'start' }); } catch { try { target.scrollIntoView(); } catch { /* 无滚动也能返回锚点 */ } }
    return { ok: true, title: textOf(target), anchor: target.id };
  }

  /** 展开/收起全部折叠面板（不传 open 则切换）。 */
  function togglePanels(open) {
    const ds = Array.prototype.slice.call(doc.querySelectorAll(S.details));
    const want = (open === undefined) ? null : !!open;
    ds.forEach((d) => { d.open = (want === null) ? !d.open : want; });
    return { count: ds.length, open: want === null ? 'toggled' : want };
  }

  /** 页面上首个匹配某符号的可点元素（没命中返回 null）。 */
  function findSymbol(needle) {
    const nodes = Array.prototype.slice.call(doc.querySelectorAll(S.glossaryTerm));
    return nodes.find((n) => (n.getAttribute('data-term') || '').indexOf(needle) >= 0
      || textOf(n).indexOf(needle) >= 0) || null;
  }

  /** 搜索面板里的命中列表与总数（读 DOM，不重跑检索）。 */
  function searchResults() {
    const hits = Array.prototype.slice.call(doc.querySelectorAll(S.searchHit)).map((a) => ({
      title: textOf(a.querySelector(S.searchHitTitle)),
      href: a.getAttribute('href'),
    }));
    const txt = textOf(doc.getElementById(S.searchResults));
    const m = txt.match(S.hitCountRe);
    return { total: m ? Number(m[1]) : hits.length, hits: hits.slice(0, 12) };
  }

  /** 搜索面板的输入框与容器（打开面板用）。 */
  function searchUi() {
    return { panel: doc.getElementById(S.searchPanel), input: doc.getElementById(S.searchInput) };
  }

  return { headings, pageInfo, openSection, togglePanels, findSymbol, searchResults, searchUi };
};
var buildToolDefs = function buildToolDefs(doc, win) {
  const view = createPageView(doc);
  const w = win || (doc && doc.defaultView) || null;

  return [
    {
      name: 'site_get_page_info',
      description: '取当前页的信息：标题、所属课程、小节清单（含锚点）。',
      inputSchema: { type: 'object', properties: {} },
      execute: () => view.pageInfo(),
    },
    {
      name: 'site_open_section',
      description: '跳到本页的某个小节（按标题片段或锚点 id），会自动展开折叠面板。',
      inputSchema: { type: 'object', properties: { title: { type: 'string' }, anchor: { type: 'string' } } },
      execute: (a) => view.openSection(a && a.title, a && a.anchor, w),
    },
    {
      name: 'site_search',
      description: '用页面自带的搜索面板搜全站，返回命中标题与链接。',
      inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
      execute: (a) => {
        const q = String((a && a.query) || '').trim();
        if (!q) return { ok: false, reason: 'empty_query' };
        const { panel, input } = view.searchUi();
        if (!input) return { ok: false, reason: 'search_ui_missing' };
        if (panel) panel.hidden = false;
        input.focus();
        input.value = q;
        // 事件构造器从注入的 win 取（同 show_symbol：浏览器里等价，测试环境也能跑）。
        const win = w || {};
        const InputEvent = win.Event || (typeof Event !== 'undefined' ? Event : null);
        if (InputEvent) input.dispatchEvent(new InputEvent('input', { bubbles: true }));
        // 面板是异步渲染的——等一拍再读（与真人「输入后等一下」同）。
        return new Promise((resolve) => {
          const read = () => {
            const r = view.searchResults();
            if (r.hits.length || r.total) resolve({ ok: true, query: q, ...r });
            else resolve({ ok: true, query: q, ...r });
          };
          (w && w.setTimeout ? w.setTimeout : setTimeout)(read, 1200);
        });
      },
    },
    {
      name: 'site_show_symbol',
      description: '查本页上某个符号的含义（点开它的气泡），返回气泡文字。',
      inputSchema: { type: 'object', properties: { term: { type: 'string' } }, required: ['term'] },
      execute: (a) => {
        const needle = String((a && a.term) || '').trim();
        if (!needle) return { ok: false, reason: 'empty_term' };
        const el = view.findSymbol(needle);
        if (!el) {
          const total = doc.querySelectorAll(PAGE_SELECTORS.glossaryTerm).length;
          return { ok: false, reason: 'symbol_not_on_page', total };
        }
        try { el.scrollIntoView({ block: 'center' }); } catch { /* 无滚动不影响点击 */ }
        // 走与真人点击同一条路径（气泡脚本监听 click）。
        // **事件构造器从注入的 win 取**，不直接用全局 `MouseEvent`——
        // 浏览器里两者等价，但这样测试环境（无 DOM 构造器）也能跑（2026-10-16 测试抓出）。
        const win = w || {};
        const ClickEvent = win.MouseEvent || (typeof MouseEvent !== 'undefined' ? MouseEvent : null);
        if (ClickEvent) {
          el.dispatchEvent(new ClickEvent('click', { bubbles: true, cancelable: true, view: win }));
        } else {
          el.click && el.click();
        }
        // **气泡是异步渲染的**（点击后下一拍才进 DOM）——同步读会恒空。
        // 与 site_search 同款：等一拍再回读（2026-10-16 测试抓出）。
        const read = () => ({
          ok: true,
          term: el.getAttribute('data-term'),
          bubble: textOf(doc.querySelector(PAGE_SELECTORS.glossaryBubble)).slice(0, 400),
        });
        return new Promise((resolve) => {
          (w && w.setTimeout ? w.setTimeout : setTimeout)(() => resolve(read()), 250);
        });
      },
    },
    {
      name: 'site_toggle_panels',
      description: '展开或收起本页全部折叠面板（不传 open 则切换）。',
      inputSchema: { type: 'object', properties: { open: { type: 'boolean' } } },
      execute: (a) => view.togglePanels(a && a.open),
    },
  ];
};
var registerTools = function registerTools(doc, nav) {
  // **两个注册表都要探测**（2026-10-16 修）：
  //   Firefox 原生只有 navigator.modelContext；Chromium 走 polyfill 只有 document.modelContext。
  //   只认 navigator ⇒ Chromium 下第一行就 return、工具一个都没注册（实测踩到）。
  const mc = (doc && doc.modelContext) || (nav && nav.modelContext) || null;
  if (!mc || typeof mc.registerTool !== 'function') return 0;
  const defs = buildToolDefs(doc, (doc && doc.defaultView) || null);
  let attempts = 0;
  for (const d of defs) {
    attempts += 1; // 先记「试了」——单个失败不该把它算漏（2026-10-16 测试抓出的计数偏差）
    try { Promise.resolve(mc.registerTool(d)).catch(() => {}); } catch { /* 单个失败不影响其余 */ }
  }
  return attempts;
};
registerTools(document, typeof navigator !== "undefined" ? navigator : null);
})();