(function () {
"use strict";
if (typeof document === "undefined") return;

var MAX_MESSAGE_CHARS = 20000;
var parseInline = function parseInline(src) {
  const s = String(src || '');
  const ops = [];
  let i = 0;
  let textBuf = '';
  const flush = () => { if (textBuf) { ops.push({ kind: 'text', text: textBuf }); textBuf = ''; } };

  while (i < s.length) {
    const ch = s[i];

    // 转义
    if (ch === '\\' && i + 1 < s.length) {
      textBuf += s[i + 1];
      i += 2;
      continue;
    }

    // 行内公式 $…$
    if (ch === '$' && isMathOpen(s, i)) {
      const end = findClosingDollar(s, i + 1);
      if (end < 0) {
        // 未闭合：整段尾巴留着（流式时会补上）
        flush();
        return { ops, pendingTail: s.slice(i) };
      }
      const tex = s.slice(i + 1, end);
      if (tex.trim()) { flush(); ops.push({ kind: 'math', tex: tex.trim(), display: false }); }
      else textBuf += s.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    // 行内代码 `…`
    if (ch === '`') {
      const end = s.indexOf('`', i + 1);
      if (end < 0) { flush(); return { ops, pendingTail: s.slice(i) }; }
      flush();
      ops.push({ kind: 'code', text: s.slice(i + 1, end) });
      i = end + 1;
      continue;
    }

    // 粗体 **…**
    if (s.startsWith('**', i)) {
      const end = s.indexOf('**', i + 2);
      if (end < 0) { flush(); return { ops, pendingTail: s.slice(i) }; }
      flush();
      ops.push({ kind: 'strong', text: s.slice(i + 2, end) });
      i = end + 2;
      continue;
    }

    // 斜体 *…*（避开 ** ）
    if (ch === '*' && s[i + 1] !== '*') {
      const end = s.indexOf('*', i + 1);
      if (end > i + 1 && s[end + 1] !== '*') {
        flush();
        ops.push({ kind: 'em', text: s.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // 链接 [text](href)
    if (ch === '[') {
      const m = s.slice(i).match(/^\[([^\]]*)\]\(([^)\s]*)\)/);
      if (m) {
        const href = safeHref(m[2]);
        flush();
        if (href) ops.push({ kind: 'link', href, text: m[1] });
        else textBuf += m[1];       // 不安全协议：只留文字
        i += m[0].length;
        continue;
      }
    }

    // 图片 ![alt](src)：只接受同源相对路径，否则丢弃
    if (ch === '!' && s[i + 1] === '[') {
      const m = s.slice(i).match(/^!\[([^\]]*)\]\(([^)\s]*)\)/);
      if (m) {
        const src = safeSrc(m[2]);
        flush();
        if (src) ops.push({ kind: 'img', src, alt: m[1] });
        else textBuf += m[1];
        i += m[0].length;
        continue;
      }
    }

    textBuf += ch;
    i += 1;
  }

  flush();
  return { ops, pendingTail: '' };
};
var safeHref = function safeHref(href) {
  const h = String(href || '').trim();
  if (!h) return null;
  if (!SAFE_HREF_RE.test(h)) return null;
  // 额外拦一下 javascript: 的变形（虽然上面的正则已经排除）
  if (/^javascript:/i.test(h)) return null;
  return h;
};
var safeSrc = function safeSrc(src) {
  const s = String(src || '').trim();
  if (!s) return null;
  if (/^(https?:)?\/\//i.test(s)) return null;   // 外链图丢弃
  if (/^data:/i.test(s)) return null;            // data URI 也丢弃（体积与安全）
  if (/^javascript:/i.test(s)) return null;
  return s;
};
var isMathOpen = function isMathOpen(text, i) {
  const prev = i > 0 ? text[i - 1] : '';
  const next = text[i + 1] || '';
  if (/[0-9A-Za-z]/.test(prev)) return false;
  if (/\s/.test(next)) return false;
  return true;
};
var findClosingDollar = function findClosingDollar(s, from) {
  for (let i = from; i < s.length; i++) {
    if (s[i] === '\\') { i += 1; continue; }
    if (s[i] === '$') {
      // 闭合 $ 后面不能紧跟数字（`$5 and $10` 这种）
      const next = s[i + 1] || '';
      if (/[0-9]/.test(next)) continue;
      return i;
    }
  }
  return -1;
};
var splitRow = function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
};
var parseIncremental = function parseIncremental(buffer) {
  const text = String(buffer || '').slice(0, MAX_MESSAGE_CHARS);
  const blocks = [];
  let i = 0;
  const n = text.length;

  /** 从 i 起读一行（含行尾换行），返回 {line, next}。 */
  const readLine = (at) => {
    const nl = text.indexOf('\n', at);
    if (nl < 0) return { line: text.slice(at), next: n, complete: false };
    return { line: text.slice(at, nl), next: nl + 1, complete: true };
  };

  while (i < n) {
    // ① 空行：跳过
    if (text[i] === '\n') { i += 1; continue; }

    // ② 代码块围栏
    if (text.startsWith('```', i)) {
      const open = readLine(i);
      const lang = open.line.slice(3).trim();
      let j = open.next;
      let body = '';
      let closed = false;
      while (j < n) {
        const l = readLine(j);
        if (!l.complete) break;                    // 最后一行没有换行 → 未闭合
        if (l.line.trim() === '```') { j = l.next; closed = true; break; }
        body += l.line + '\n';
        j = l.next;
      }
      if (!closed) return { blocks, rest: text.slice(i), restStart: i };
      blocks.push({ kind: 'code', lang, text: body.replace(/\n$/, '') });
      i = j;
      continue;
    }

    // ③ 块级公式 $$…$$
    if (text.startsWith('$$', i)) {
      const end = text.indexOf('$$', i + 2);
      if (end < 0) return { blocks, rest: text.slice(i), restStart: i };
      const tex = text.slice(i + 2, end).trim();
      if (tex) blocks.push({ kind: 'math', tex, display: true });
      i = end + 2;
      continue;
    }

    // ④ 裸写的 \begin{…}…\end{…}：模型常这么写，包成块级公式
    if (text.startsWith('\\begin{', i)) {
      const env = text.slice(i + 7).match(/^([a-zA-Z*]+)\}/);
      if (env) {
        const close = '\\end{' + env[1] + '}';
        const end = text.indexOf(close, i);
        if (end < 0) return { blocks, rest: text.slice(i), restStart: i };
        const tex = text.slice(i, end + close.length);
        blocks.push({ kind: 'math', tex, display: true });
        i = end + close.length;
        continue;
      }
    }

    // ⑤ 标题
    const hm = text.slice(i).match(/^(#{1,6})[ \t]+([^\n]*)\n/);
    if (hm) {
      blocks.push({ kind: 'h', level: hm[1].length, text: hm[2].trim() });
      i += hm[0].length;
      continue;
    }

    // ⑥ 表格：当前行含 `|`，且下一行是分隔行
    const line1 = readLine(i);
    if (line1.line.includes('|') && line1.complete) {
      const line2 = readLine(line1.next);
      const isSep = /^\s*\|?[\s:-]+\|[\s:|-]*$/.test(line2.line) && line2.complete;
      if (isSep) {
        const rows = [splitRow(line1.line)];
        let j = line2.next;
        let terminated = false;   // 遇到了表格之外的行（或空行）⇒ 表格确实结束了
        while (j < n) {
          const l = readLine(j);
          if (!l.complete) { j = -1; break; }           // 最后一行未结束 → 等下一个 delta
          if (!l.line.includes('|') || l.line.trim() === '') { terminated = true; break; }
          rows.push(splitRow(l.line));
          j = l.next;
        }
        // j === -1 表示撞到不完整的尾巴；没 terminated 表示读到了文本末尾（也没结束）
        if (j < 0 || (!terminated && j >= n)) return { blocks, rest: text.slice(i), restStart: i };
        blocks.push({ kind: 'table', header: rows[0], rows: rows.slice(1) });
        i = j;
        continue;
      }
    }

    // ⑦ 列表：连续的行以 `- `/`* `/`N. ` 开头
    // ⚠️ 2026-10-22 修：必须允许**前导缩进**。上游模型的回答里嵌套子列表很常见
    // （`1. **最紧急**：…` 下面跟 `   - 子项 A`），旧正则 `^(?:[-*]|\d+\.)`
    // 匹配不到缩进行 ⇒ 列表提前 terminated ⇒ 后续内容全被吞进段落，
    // 面板上会看到字面的 "   - 子项 A\n   - 子项 B\n3. "。
    // 现在记录每项的缩进层级（depth），渲染侧据此嵌套。
    const li0 = text.slice(i).match(/^([ \t]*)(?:[-*]|\d+\.)[ \t]+/);
    if (li0) {
      const items = [];
      let j = i;
      let terminated = false;
      while (j < n) {
        const l = readLine(j);
        if (!l.complete) { j = -1; break; }             // 最后一行未结束 → 等
        const m = l.line.match(/^([ \t]*)(?:[-*]|\d+\.)[ \t]+(.*)$/);
        if (!m) { terminated = true; break; }
        // 缩进 → 层级（每 2 空格或 1 tab 算一级，上限 4 级防跑飞）
        const indent = m[1].replace(/\t/g, '  ').length;
        const depth = Math.min(4, Math.floor(indent / 2));
        items.push({ text: m[2], depth });
        j = l.next;
      }
      if (j < 0 || (!terminated && j >= n)) return { blocks, rest: text.slice(i), restStart: i };
      blocks.push({ kind: 'list', ordered: /^\d/.test(li0[0].trim()), items });
      i = j;
      continue;
    }

    // ⑧ 段落：读到空行或特殊块开头为止
    {
      let j = i;
      let buf = '';
      let hitSpecial = false;
      while (j < n) {
        const l = readLine(j);
        if (!l.complete) break;                         // 最后一行未结束 → 先不渲染
        if (l.line.trim() === '') { j = l.next; break; }
        if (/^(#{1,6}[ \t]|```|\$\$|\\begin\{)/.test(l.line)) { hitSpecial = true; break; }
        buf += (buf ? '\n' : '') + l.line;
        j = l.next;
      }

      // ⚠️ 两种情况必须分开处理（2026-10-19 实测死循环）：
      //   · 撞到特殊块开头（且段内还没内容）⇒ 不能 i=j（j 没动），
      //     要落到下面「兜底前进」——但那会让特殊块被当文本吃掉。
      //     正确做法：直接 continue，让外层重新进入分支判断（i 未变，但下一轮会走 ②-⑦）。
      //     为避免再次进入段落分支，这里在撞特殊块且 buf 为空时**显式跳过一行**的语义不对，
      //     所以我们改为：撞特殊块时把已累积的段落先产出，然后 i 前进到 j；
      //     若 buf 为空（i 本身就是特殊块开头）说明上面的 ②-⑦ 没匹配上，
      //     那是未支持的语法（如 `> 引用`），兜底当普通段落吃掉一行。
      if (buf) {
        blocks.push({ kind: 'p', text: buf });
        i = j;
        continue;
      }
      if (hitSpecial) {
        // 走到了这里说明 ②-⑦ 都不认这个「特殊块」（例如 `> 引用`、`---` 分隔线）。
        // 兜底：吃一整行当段落，保证 i 前进。行没结束时**不能**吃掉——
        // 否则不完整的半行会被当成一段渲染，补全后再来一遍就重了。
        const l = readLine(i);
        if (!l.complete) return { blocks, rest: text.slice(i), restStart: i };
        const raw = l.line.trim();
        if (raw) blocks.push({ kind: 'p', text: raw });
        i = l.next;
        continue;
      }
      // 段落没遇到空行就到底了 ⇒ 还没完整，整段留 rest 等下一个 delta。
      // ⚠️ 判据是「最后一行的 readLine 不完整」（没有换行符），不是 j >= n——
      // 后者在 `'x'`（长度 1、j=0）时为假，会 i=j=0 死循环（2026-10-19 实测）。
      const last = readLine(j === i ? i : Math.max(i, j - 1));
      if (!last.complete) return { blocks, rest: text.slice(i), restStart: i };
      i = j;
    }
  }

  return { blocks, rest: '', restStart: n };
};
var renderBlockToOps = function renderBlockToOps(block) {
  if (!block) return [];
  switch (block.kind) {
    case 'h':
      return [{ kind: 'heading', level: block.level, ops: parseInline(block.text).ops }];
    case 'p':
      return [{ kind: 'para', ops: parseInline(block.text).ops }];
    case 'list':
      return [{
        kind: 'list',
        ordered: !!block.ordered,
        // items 现为 {text, depth}（2026-10-22 嵌套支持）；兼容旧形态的纯字符串
        items: block.items.map((it) => {
          const text = typeof it === 'string' ? it : it.text;
          const depth = typeof it === 'string' ? 0 : (it.depth || 0);
          return { ops: parseInline(text).ops, depth };
        }),
      }];
    case 'code':
      return [{ kind: 'codeblock', lang: block.lang || '', text: block.text }];
    case 'math':
      return [{ kind: 'mathblock', tex: block.tex }];
    case 'table':
      return [{
        kind: 'table',
        header: block.header.map((c) => parseInline(c).ops),
        rows: block.rows.map((r) => r.map((c) => parseInline(c).ops)),
      }];
    default:
      return [];
  }
};
var applyOps = function applyOps(doc, el, ops, maths) {
  const mk = (tag) => doc.createElement(tag);

  /** 行内 ops → 一串节点。 */
  const inlineNodes = (list) => {
    const out = [];
    for (const o of (list || [])) {
      switch (o.kind) {
        case 'text': {
          out.push(doc.createTextNode(o.text));
          break;
        }
        case 'strong': { const n = mk('strong'); n.textContent = o.text; out.push(n); break; }
        case 'em': { const n = mk('em'); n.textContent = o.text; out.push(n); break; }
        case 'code': { const n = mk('code'); n.textContent = o.text; out.push(n); break; }
        case 'math': {
          const n = mk('span');
          n.className = 'chat-math';
          renderMathInto(doc, n, o.tex, false, maths);
          out.push(n);
          break;
        }
        case 'link': {
          const n = mk('a');
          n.setAttribute('href', o.href);
          if (/^https?:/i.test(o.href)) { n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener noreferrer'); }
          n.textContent = o.text;
          out.push(n);
          break;
        }
        case 'img': {
          const n = mk('img');
          n.setAttribute('src', o.src);
          n.setAttribute('alt', o.alt || '');
          n.setAttribute('loading', 'lazy');
          n.style.maxWidth = '100%';
          out.push(n);
          break;
        }
        default: break;
      }
    }
    return out;
  };

  for (const op of (ops || [])) {
    let node = null;
    switch (op.kind) {
      case 'heading': {
        const lvl = Math.min(4, Math.max(1, op.level || 2));
        node = mk('h' + lvl);
        for (const c of inlineNodes(op.ops)) node.appendChild(c);
        break;
      }
      case 'para': {
        node = mk('p');
        for (const c of inlineNodes(op.ops)) node.appendChild(c);
        break;
      }
      case 'list': {
        node = mk(op.ordered ? 'ol' : 'ul');
        for (const item of op.items) {
          const li = mk('li');
          const childOps = item && item.ops ? item.ops : (Array.isArray(item) ? item : []);
          const depth = (item && item.depth) || 0;
          if (depth > 0) li.style.marginLeft = (depth * 1.1) + 'em';
          for (const c of inlineNodes(childOps)) li.appendChild(c);
          node.appendChild(li);
        }
        break;
      }
      case 'codeblock': {
        node = mk('pre');
        const code = mk('code');
        if (op.lang) code.className = 'language-' + op.lang;
        code.textContent = op.text;
        node.appendChild(code);
        break;
      }
      case 'mathblock': {
        node = mk('div');
        node.className = 'chat-math-block';
        renderMathInto(doc, node, op.tex, true, maths);
        break;
      }
      case 'table': {
        node = mk('table');
        const thead = mk('thead');
        const trh = mk('tr');
        for (const cell of op.header) {
          const th = mk('th');
          for (const c of inlineNodes(cell)) th.appendChild(c);
          trh.appendChild(th);
        }
        thead.appendChild(trh);
        node.appendChild(thead);
        if (op.rows && op.rows.length) {
          const tbody = mk('tbody');
          for (const row of op.rows) {
            const tr = mk('tr');
            for (const cell of row) {
              const td = mk('td');
              for (const c of inlineNodes(cell)) td.appendChild(c);
              tr.appendChild(td);
            }
            tbody.appendChild(tr);
          }
          node.appendChild(tbody);
        }
        var tableWrap = mk('div');
        tableWrap.className = 'chat-table-wrap';
        tableWrap.appendChild(node);
        node = tableWrap;
        break;
      }
      default: break;
    }
    if (node) el.appendChild(node);
  }
};
var renderMathInto = function renderMathInto(doc, node, tex, display, maths) {
  if (!maths || typeof maths.convertLatexToMarkup !== 'function') {
    node.textContent = (display ? '$$' : '$') + tex + (display ? '$$' : '$');
    return;
  }
  try {
    // 显示公式用外层容器控制横向滚动（与正文 `.math-display` 同一套做法）
    const src = display ? `\\displaystyle ${tex}` : tex;
    const html = maths.convertLatexToMarkup(src);
    if (/ML__error/.test(html)) throw new Error('公式无法排版');
    if (display) {
      node.innerHTML = '<div class="chat-math-display">' + html + '</div>';
    } else {
      node.innerHTML = html;
    }
  } catch (e) {
    node.className = (node.className ? node.className + ' ' : '') + 'chat-math-err';
    node.textContent = (display ? '$$' : '$') + tex + (display ? '$$' : '$');
  }
};

var BRIDGE = "http://127.0.0.1:9345";

var SITE_HOSTS = ["isui.ren", "archivalera.github.io"];
var LOCAL_ONLY = (function () {
  try {
    var h = location.hostname;
    if (h === "127.0.0.1" || h === "localhost" || h === "[::1]" || h === "::1") return true;
    for (var i = 0; i < SITE_HOSTS.length; i++) if (h === SITE_HOSTS[i]) return true;
  } catch (e) {}
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.get("assistant") === "1") return true;
  } catch (e) {}
  try {
    if (localStorage.getItem("webmcp_bridge") === "on") return true;
  } catch (e) {}
  return false;
})();

// ── 运行时状态（冷启动默认未初始化）──
var initialized = false;
var open = false;
var busy = false;
var currentSessionId = null;
var sessionsList = [];

var dockEl = null;
var bmListEl = null;
var mobileHandle = null;
var backdrop = null;

var panel = null;
var logEl = null;
var inputEl = null;
var sendBtn = null;
var jumpBtn = null;
var attachBtn = null;
var attachBar = null;
var fileInput = null;


var stream = null;
var stuck = true;
var msgEls = [];
var pending_attach = [];
var stopAnswerRef = function () {};
var transport = null;

var TOOL_LABEL = {"site_get_page_info":"确认当前页面","site_read":"读取页面正文","site_index":"查看站点目录","site_navigate":"翻到目标页面","site_search":"检索资料库","site_show_symbol":"查符号释义","site_panels":"展开折叠内容","site_view":"显示设置","site_list_images":"查找页面配图","site_image":"查看图片","site_capture_view":"截图查看版面"};

// ── 基础工具 ──
var tokenPromise = null;
function tokenAsync(force) {
  if (!force && tokenPromise) return tokenPromise;
  tokenPromise = new Promise(function (resolve) {
    if (!LOCAL_ONLY) return resolve("");
    var t = "";
    try { t = window.__bridgeToken || localStorage.getItem("webmcp_bridge_token") || ""; } catch (e) {}
    if (t) { window.__bridgeToken = t; return resolve(t); }
    var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timer = setTimeout(function () { try { ctrl && ctrl.abort(); } catch (e) {} }, 3000);
    fetch(BRIDGE + "/bootstrap", { cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { clearTimeout(timer); return r.ok ? r.json() : null; })
      .then(function (j) {
        var v = (j && j.token) ? String(j.token) : "";
        if (v) {
          window.__bridgeToken = v;
          try { localStorage.setItem("webmcp_bridge_token", v); } catch (e) {}
        }
        resolve(v);
      })
      .catch(function () { clearTimeout(timer); resolve(""); });
  });
  return tokenPromise;
}

function withToken(u, t) {
  return t ? (u + (u.indexOf("?") >= 0 ? "&" : "?") + "token=" + encodeURIComponent(t)) : u;
}

// 公式引擎懒加载（2026-10-29 换引擎）：MathLive 的 **SSR 版**模块。
// 为什么用 SSR 版而不是浏览器版：398KB vs 843KB，而聊天只需要「TeX → 静态 HTML」
// 这一个能力（convertLatexToMarkup），不需要可编辑的 math-field 元素。
// 实测在浏览器里经 module script 加载即可用。
var mathsLoading = null;
function ensureMaths() {
  if (window.__maths) return Promise.resolve(window.__maths);
  if (mathsLoading) return mathsLoading;
  mathsLoading = new Promise(function (resolve) {
    var root = document.documentElement.getAttribute("data-root") || "./";
    var s = document.createElement("script");
    s.type = "module";
    s.textContent = 'import * as M from "' + root + 'assets/mathlive/mathlive-ssr.min.mjs";'
      + 'window.__maths = M; window.dispatchEvent(new Event("maths-ready"));';
    document.head.appendChild(s);
    var done = function () { resolve(window.__maths || null); };
    window.addEventListener("maths-ready", done, { once: true });
    setTimeout(done, 8000);   // 兜底：模块加载失败也不能让提问永久挂住
  });
  return mathsLoading;
}

function sniffImage(bytes) {
  var b = bytes;
  if (b.length < 12) return "unknown";
  if (b[0] === 0xFF && b[1] === 0xD8) return "jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return "png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "gif";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46
      && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
    var brand = "";
    for (var i = 8; i < 12; i++) brand += String.fromCharCode(b[i]);
    if (/^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)$/.test(brand)) return "heic";
  }
  return "unknown";
}

function transcodeToJpeg(dataUrl, maxEdge) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.onload = function () {
      var w = img.naturalWidth || img.width;
      var h = img.naturalHeight || img.height;
      if (!w || !h) return reject(new Error("图片尺寸为 0"));
      var scale = Math.min(1, (maxEdge || 2048) / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * scale));
      var ch = Math.max(1, Math.round(h * scale));
      var canvas = document.createElement("canvas");
      canvas.width = cw; canvas.height = ch;
      var g = canvas.getContext("2d");
      if (!g) return reject(new Error("canvas 不可用"));
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, cw, ch);
      g.drawImage(img, 0, 0, cw, ch);
      try {
        resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.9), mimeType: "image/jpeg" });
      } catch (e) { reject(e); }
    };
    img.onerror = function () { reject(new Error("图片无法解码")); };
    img.src = dataUrl;
  });
}

function prepareImage(file) {
  return new Promise(function (resolve, reject) {
    if (file.size > 12 * 1024 * 1024) return reject(new Error("图片太大（上限 12 MB）"));
    var reader = new FileReader();
    reader.onload = function () {
      var dataUrl = String(reader.result || "");
      var b64 = dataUrl.split(",")[1] || "";
      var head;
      try {
        var bin = atob(b64.slice(0, 16));
        head = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) head[i] = bin.charCodeAt(i);
      } catch (e) { head = new Uint8Array(0); }
      var kind = sniffImage(head);
      if (kind === "jpeg") return resolve({ dataUrl: dataUrl, mimeType: "image/jpeg" });
      if (kind === "png") return resolve({ dataUrl: dataUrl, mimeType: "image/png" });
      transcodeToJpeg(dataUrl, 2048).then(resolve, function () {
        resolve({
          dataUrl: dataUrl,
          mimeType: kind === "heic" ? "image/heic"
            : kind === "gif" ? "image/gif"
            : kind === "webp" ? "image/webp"
            : "application/octet-stream",
          needsServerConvert: true,
        });
      });
    };
    reader.onerror = function () { reject(new Error("读文件失败")); };
    reader.readAsDataURL(file);
  });
}

function uploadAttachment(item, tk) {
  if (!LOCAL_ONLY) return Promise.reject(new Error("学习助手只在你自己电脑上可用"));
  var b64 = String(item.dataUrl || "").split(",")[1] || "";
  return fetch(withToken(BRIDGE + "/upload", tk), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: b64,
      mimeType: item.mimeType,
      filename: item.name,
    }),
  }).then(function (r) { return r.json(); }).then(function (j) {
    if (!j || !j.ok) throw new Error((j && j.error) || "上传失败");
    item.fileInfo = j.fileInfo;
    item.status = "ready";
    return item;
  }).catch(function (e) {
    item.status = "failed";
    item.error = String((e && e.message) || e);
    throw e;
  });
}

function renderAttachBar() {
  if (!attachBar) return;
  while (attachBar.firstChild) attachBar.removeChild(attachBar.firstChild);
  for (var i = 0; i < pending_attach.length; i++) {
    (function (item) {
      var box = document.createElement("div");
      box.className = "chat-attach-item" + (item.status === "uploading" ? " uploading" : "")
        + (item.status === "failed" ? " failed" : "");
      box.title = item.status === "failed" ? ("上传失败：" + (item.error || "")) : item.name;
      var img = document.createElement("img");
      img.src = item.dataUrl;
      img.alt = item.name;
      img.onerror = function () {
        img.style.display = "none";
        if (!box.querySelector(".chat-attach-fallback")) {
          var fb = document.createElement("span");
          fb.className = "chat-attach-fallback";
          fb.textContent = (item.name || "").split(".").pop().toUpperCase() || "IMG";
          box.appendChild(fb);
        }
      };
      box.appendChild(img);
      var x = document.createElement("button");
      x.type = "button";
      x.className = "chat-attach-x";
      x.textContent = "×";
      x.setAttribute("aria-label", "移除这张图");
      x.onclick = function () {
        var k = pending_attach.indexOf(item);
        if (k >= 0) pending_attach.splice(k, 1);
        renderAttachBar();
      };
      box.appendChild(x);
      attachBar.appendChild(box);
    })(pending_attach[i]);
  }
}

function acceptFiles(files) {
  var list = Array.prototype.slice.call(files || []);
  if (!list.length) return;
  list.forEach(function (f) {
    if (!f || !/^image\//.test(f.type || "")) {
      if (!/\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(f.name || "")) return;
    }
    var item = { id: "a" + Date.now() + Math.random().toString(16).slice(2, 6), name: f.name || "image", status: "uploading" };
    pending_attach.push(item);
    renderAttachBar();
    prepareImage(f)
      .then(function (prep) {
        item.dataUrl = prep.dataUrl;
        item.mimeType = prep.mimeType;
        renderAttachBar();
        return tokenAsync(false);
      })
      .then(function (tk) { return uploadAttachment(item, tk); })
      .then(function () { renderAttachBar(); })
      .catch(function (e) {
        item.status = "failed";
        item.error = String((e && e.message) || e);
        renderAttachBar();
      });
  });
}

function nearBottom() {
  if (!logEl) return true;
  return logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 48;
}
function scrollToBottom() {
  if (!logEl) return;
  logEl.scrollTop = logEl.scrollHeight;
}
function onUserScroll() {
  if (!logEl) return;
  stuck = nearBottom();
  if (stuck && jumpBtn) jumpBtn.remove();
}

function addMsg(role) {
  var wrap = document.createElement("div");
  wrap.className = "chat-msg chat-msg--" + role;
  var body = document.createElement("div");
  body.className = "chat-body";
  wrap.appendChild(body);
  logEl.appendChild(wrap);
  msgEls.push({ role: role, body: body, raw: "", restStart: 0 });
  if (stuck) scrollToBottom();
  return msgEls[msgEls.length - 1];
}

function attachStatusSlot(msg) {
  var el = document.createElement("div");
  el.className = "chat-status";
  el.textContent = "正在思考…";
  msg.body.parentNode.insertBefore(el, msg.body);
  msg.statusEl = el;
  msg.statusBase = "正在思考…";
  msg.queryStartedAt = Date.now();
  if (!msg.statusTick) {
    msg.statusTick = setInterval(function () {
      if (!msg.statusEl || !msg.queryStartedAt) return;
      var secs = Math.round((Date.now() - msg.queryStartedAt) / 1000);
      if (secs < 2) return;
      msg.statusEl.textContent = msg.statusBase + "（" + secs + " 秒）";
    }, 1000);
  }
  return el;
}

function renderMessage(msg, final) {
  var parsed = parseIncremental(msg.raw.slice(msg.restStart || 0));
  for (var i = 0; i < parsed.blocks.length; i++) {
    applyOps(document, msg.body, renderBlockToOps(parsed.blocks[i]), window.__maths);
  }
  msg.restStart = (msg.restStart || 0) + parsed.restStart;

  if (msg.tailEl) { msg.tailEl.remove(); msg.tailEl = null; }
  if (!final && parsed.rest) {
    var tail = document.createElement("span");
    tail.textContent = parsed.rest;
    tail.className = "chat-tail";
    msg.body.appendChild(tail);
    msg.tailEl = tail;
  } else if (final && parsed.rest) {
    var lastP = document.createElement("p");
    lastP.textContent = parsed.rest;
    msg.body.appendChild(lastP);
    msg.restStart = msg.raw.length;
  }
  if (final) msg.body.classList.remove("chat-cursor");
  else msg.body.classList.add("chat-cursor");

  if (final && msg.raw && !msg.body.textContent.trim()) {
    msg.body.textContent = msg.raw;
  }

  if (stuck) scrollToBottom();
  else if (!jumpBtn) showJump();
}

function scheduleRender(msg) {
  if (msg.pending) return;
  msg.pending = true;
  var run = function () {
    msg.pending = false;
    if (!msg.done) renderMessage(msg, false);
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
  else setTimeout(run, 16);
}

function flushRender(msg) {
  if (msg.done) return;
  msg.done = true;
  renderMessage(msg, true);
}

function setStatus(msg, text) {
  if (!msg.statusEl) { attachStatusSlot(msg); if (!msg.statusEl) return; }
  msg.statusBase = String(text).replace(/（\s*\d+\s*秒\s*）/g, "").trim();
  if (!msg.queryStartedAt) msg.queryStartedAt = Date.now();
  msg.statusEl.textContent = msg.statusBase;
}

function clearStatus(msg) {
  if (msg.statusTick) { clearInterval(msg.statusTick); msg.statusTick = null; }
  msg.queryStartedAt = 0;
  if (msg.statusEl && msg.statusEl.parentNode) msg.statusEl.parentNode.removeChild(msg.statusEl);
  msg.statusEl = null;
}

function attachTimings(msg, timings) {
  var total = 0;
  var parts = [];
  for (var i = 0; i < timings.length; i++) {
    var t = timings[i] || {};
    var ms = typeof t.ms === "number" ? t.ms : 0;
    total += ms;
    var seg = "第" + (t.round || i + 1) + "轮 " + (ms / 1000).toFixed(1) + "s";
    if (t.attempts > 1) seg += "（重试 " + (t.attempts - 1) + " 次）";
    if (t.calls) seg += " · " + t.calls + " 个工具";
    parts.push(seg);
  }
  var el = document.createElement("div");
  el.className = "chat-timings";
  el.textContent = "耗时：" + parts.join("；") + "（合计 " + (total / 1000).toFixed(1) + "s）";
  msg.body.appendChild(el);
}

function statusText(ev) {
  var phase = ev && ev.phase;
  var what = ev && ev.tool ? (TOOL_LABEL[ev.tool] || ev.tool) : "";
  if (phase === "thinking") return "正在理解问题…";
  if (phase === "generating") return "正在检索资料并组织回答…";
  if (phase === "tool") return "正在" + (what || "查询") + "…";
  if (phase === "tool-ok") return (what || "查询") + "完成，继续整理…";
  if (phase === "tool-fail") return (what || "查询") + "失败，换一种方式…";
  return null;
}

function showJump() {
  if (!jumpBtn || !panel) return;
  jumpBtn = document.createElement("button");
  jumpBtn.className = "chat-jump";
  jumpBtn.textContent = "有新消息 ↓";
  jumpBtn.onclick = function () {
    stuck = true;
    scrollToBottom();
    if (jumpBtn) { jumpBtn.remove(); jumpBtn = null; }
  };
  panel.appendChild(jumpBtn);
}

function showToast(text, duration) {
  var t = document.createElement("div");
  t.className = "chat-toast";
  t.textContent = String(text || "");
  document.body.appendChild(t);
  setTimeout(function () {
    t.classList.add("fade-out");
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 220);
  }, duration || 3000);
}

// ── 会话管理（中性契约）──
function renderBookmarks() {
  if (!bmListEl) return;
  var prevScroll = bmListEl.scrollTop;
  while (bmListEl.firstChild) bmListEl.removeChild(bmListEl.firstChild);

  var newBtn = document.createElement("button");
  newBtn.type = "button";
  newBtn.className = "bm-item bm-new";
  newBtn.setAttribute("aria-label", "新建会话");
  var newText = document.createElement("span");
  newText.className = "bm-title";
  newText.textContent = "+ 新会话";
  newBtn.appendChild(newText);
  newBtn.onclick = function (e) {
    e.stopPropagation();
    newSession();
  };
  bmListEl.appendChild(newBtn);

  if (!sessionsList || sessionsList.length === 0) {
    var emptyDiv = document.createElement("div");
    emptyDiv.className = "bm-empty";
    emptyDiv.textContent = "暂无会话";
    bmListEl.appendChild(emptyDiv);
    bmListEl.scrollTop = prevScroll;
    return;
  }

  sessionsList.forEach(function (sess) {
    var item = document.createElement("div");
    item.className = "bm-item" + (sess.id === currentSessionId ? " active" : "");
    item.setAttribute("data-session-id", sess.id);
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");

    var titleSpan = document.createElement("span");
    titleSpan.className = "bm-title";
    titleSpan.textContent = sess.title || "未命名会话";
    titleSpan.title = sess.title || "";
    item.appendChild(titleSpan);

    var delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "bm-del";
    delBtn.setAttribute("aria-label", "删除会话「" + (sess.title || "未命名") + "」");
    delBtn.title = "删除会话";
    delBtn.textContent = "×";
    delBtn.onclick = function (e) {
      e.stopPropagation();
      deleteSession(sess.id);
    };
    item.appendChild(delBtn);

    item.onclick = function () {
      selectSession(sess.id);
    };
    item.onkeydown = function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectSession(sess.id);
      }
    };
    bmListEl.appendChild(item);
  });
  bmListEl.scrollTop = prevScroll;
}

function loadSessions() {
  if (window.__MOCK_SESSIONS__ && Array.isArray(window.__MOCK_SESSIONS__)) {
    sessionsList = window.__MOCK_SESSIONS__.slice();
    renderBookmarks();
    return Promise.resolve(sessionsList);
  }
  if (!LOCAL_ONLY) {
    sessionsList = [];
    renderBookmarks();
    return Promise.resolve([]);
  }
  return tokenAsync(false).then(function (tk) {
    return fetch(withToken(BRIDGE + "/chat/sessions", tk), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then(function (res) {
      if (!res.ok) return { ok: false };
      return res.json();
    }).then(function (data) {
      if (data && data.ok && Array.isArray(data.sessions)) {
        sessionsList = data.sessions;
      } else {
        sessionsList = [];
      }
      renderBookmarks();
      return sessionsList;
    }).catch(function () {
      sessionsList = [];
      renderBookmarks();
      return [];
    });
  }).catch(function () {
    sessionsList = [];
    renderBookmarks();
    return [];
  });
}

function selectSession(id) {
  if (!id) return Promise.resolve();
  if (busy) {
    try { stopAnswerRef(); } catch (e) {}
  }
  currentSessionId = id;
  if (bmListEl) {
    var items = bmListEl.querySelectorAll(".bm-item");
    for (var bi = 0; bi < items.length; bi++) {
      var it = items[bi];
      it.classList.toggle("active", it.getAttribute("data-session-id") === id);
    }
  }
  openPanel();

  if (logEl) {
    while (logEl.firstChild) logEl.removeChild(logEl.firstChild);
    var skeleton = document.createElement("div");
    skeleton.className = "chat-skeleton";
    skeleton.textContent = "加载历史消息…";
    logEl.appendChild(skeleton);
  }
  msgEls = [];

  if (window.__MOCK_MESSAGES__ && window.__MOCK_MESSAGES__[id]) {
    renderHistoryMessages(window.__MOCK_MESSAGES__[id]);
    return Promise.resolve();
  }

  return tokenAsync(false).then(function (tk) {
    return fetch(withToken(BRIDGE + "/chat/sessions/" + encodeURIComponent(id) + "/messages", tk), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then(function (res) {
      if (!res.ok) return { ok: false };
      return res.json();
    }).then(function (data) {
      if (logEl && logEl.querySelector(".chat-skeleton")) {
        logEl.removeChild(logEl.querySelector(".chat-skeleton"));
      }
      if (data && data.ok && Array.isArray(data.messages)) {
        renderHistoryMessages(data.messages);
      } else {
        var notice = addMsg("bot");
        notice.body.textContent = "这一场的记录暂时读不到";
        notice.done = true;
      }
    }).catch(function () {
      if (logEl && logEl.querySelector(".chat-skeleton")) {
        logEl.removeChild(logEl.querySelector(".chat-skeleton"));
      }
      var notice = addMsg("bot");
      notice.body.textContent = "这一场的记录暂时读不到";
      notice.done = true;
    });
  });
}

function renderHistoryMessages(messages) {
  if (!logEl) return;
  while (logEl.firstChild) logEl.removeChild(logEl.firstChild);
  msgEls = [];
  messages.forEach(function (m) {
    var r = m.role === "assistant" ? "bot" : "user";
    var msgObj = addMsg(r);
    msgObj.raw = m.text || "";
    if (r === "user") {
      msgObj.body.textContent = msgObj.raw;
    } else {
      flushRender(msgObj);
    }
  });
  stuck = true;
  scrollToBottom();
}

function newSession() {
  if (busy) {
    try { stopAnswerRef(); } catch (e) {}
  }
  if (!LOCAL_ONLY) {
    currentSessionId = null;
    if (logEl) {
      while (logEl.firstChild) logEl.removeChild(logEl.firstChild);
      showLocalOnlyNotice();
    }
    openPanel();
    return Promise.resolve(null);
  }
  return tokenAsync(false).then(function (tk) {
    return fetch(withToken(BRIDGE + "/chat/sessions/new", tk), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(function (res) {
      if (!res.ok) return { ok: false };
      return res.json();
    }).then(function (data) {
      if (data && data.ok && data.id) {
        currentSessionId = data.id;
        if (logEl) while (logEl.firstChild) logEl.removeChild(logEl.firstChild);
        msgEls = [];
        showEmpty();
        renderBookmarks();
        openPanel();
        if (inputEl && !(window.innerWidth <= 860)) inputEl.focus();
        loadSessions();
        return data.id;
      } else {
        showToast("开新会话失败");
        return null;
      }
    }).catch(function () {
      showToast("开新会话失败");
      return null;
    });
  });
}

function deleteSession(id) {
  if (!id) return Promise.resolve();
  sessionsList = sessionsList.filter(function (s) { return s.id !== id; });
  renderBookmarks();
  showToast("已从列表移除");

  if (currentSessionId === id) {
    currentSessionId = null;
    if (logEl) while (logEl.firstChild) logEl.removeChild(logEl.firstChild);
    msgEls = [];
    showEmpty();
  }

  if (!LOCAL_ONLY) return Promise.resolve();

  return tokenAsync(false).then(function (tk) {
    return fetch(withToken(BRIDGE + "/chat/sessions/" + encodeURIComponent(id) + "/delete", tk), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(function () {
      return loadSessions();
    }).catch(function () {
      return loadSessions();
    });
  });
}

// ── SSE 问答交互 ──
function askChat(text) {
  if (busy) return;
  if (!LOCAL_ONLY) {
    var nope = addMsg("bot");
    nope.body.textContent = "学习助手只在你自己电脑上可用（要连本地桥进程）。";
    nope.done = true;
    return;
  }
  var userMsg = addMsg("user");
  userMsg.body.textContent = text;

  var ready = [];
  var stillUploading = 0;
  for (var ai = 0; ai < pending_attach.length; ai++) {
    var a = pending_attach[ai];
    if (a.status === "ready" && a.fileInfo) ready.push(a.fileInfo);
    else if (a.status === "uploading") stillUploading += 1;
  }
  pending_attach = pending_attach.filter(function (x) {
    return x.status === "uploading" || x.status === "failed";
  });
  renderAttachBar();
  if (stillUploading && !ready.length && !text) {
    var wait = addMsg("bot");
    wait.body.textContent = "（图片还在上传，稍等一下再发）";
    wait.done = true;
    return;
  }

  var botMsg = addMsg("bot");
  attachStatusSlot(botMsg);
  busy = true;
  if (sendBtn) {
    sendBtn.classList.add("stop");
    sendBtn.disabled = false;
    sendBtn.textContent = "■";
    sendBtn.setAttribute("aria-label", "停止回答");
    sendBtn.title = "停止回答";
  }
  if (attachBtn) attachBtn.disabled = true;
  stream = (typeof AbortController !== "undefined") ? new AbortController() : null;

  try { if (window.__webmcpEnable) window.__webmcpEnable(); } catch (e) {}

  // ⚠️ 2026-10-26（身份闸门抓到）：这里原来把 currentSessionId 作为 sessionId
  // 塞进发问 payload。两处都错：
  //   ① sessionId 是自造名（一处约定：会话身份只用后端发放的那一个值，不另起名）；
  //   ② 10-25 定案后桥只持有**一场**对话，发问根本不需要会话标识——
  //      切会话走 /chat/sessions/:id/messages 读历史，新建走 /chat/sessions/new。
  // currentSessionId 只保留为**本地 UI 状态**（判断哪个书签高亮），不再跨边界传播。
  // （注：本文件是模板字符串，注释里写代码名用直角引号——反引号会提前闭合。）
  var payload = { text: text };
  if (ready.length) payload.attachments = ready;
  var body = JSON.stringify(payload);

  function handleEventPlain(ev) {
    if (ev.type === "delta") {
      clearStatus(botMsg);
      botMsg.raw += String(ev.text || "");
      if (botMsg.raw.length > MAX_MESSAGE_CHARS) botMsg.raw = botMsg.raw.slice(0, MAX_MESSAGE_CHARS);
      scheduleRender(botMsg);
    } else if (ev.type === "status") {
      var s = statusText(ev);
      if (s) setStatus(botMsg, s);
    } else if (ev.type === "done") {
      clearStatus(botMsg);
      if (Array.isArray(ev.timings) && ev.timings.length) {
        try { attachTimings(botMsg, ev.timings); } catch (e) {}
      }
      if (ev.text) {
        var clean = String(ev.text);
        if (clean !== botMsg.raw) {
          botMsg.raw = clean;
          botMsg.restStart = 0;
          while (botMsg.body.firstChild) botMsg.body.removeChild(botMsg.body.firstChild);
          botMsg.tailEl = null;
        }
      }
      flushRender(botMsg);
      loadSessions();
    } else if (ev.type === "error") {
      clearStatus(botMsg);
      botMsg.raw = botMsg.raw || ("（" + describeFailure(new Error(ev.reason || "未知")) + "）");
      flushRender(botMsg);
    }
  }

  function finish() {
    clearStatus(botMsg);
    if (!botMsg.raw) {
      botMsg.body.textContent = "（没有收到回答）";
      botMsg.done = true;
    } else {
      flushRender(botMsg);
    }
    busy = false;
    resetSendButton();
    if (attachBtn) attachBtn.disabled = false;
    stream = null;
  }

  function stopAnswer() {
    if (!busy) return;
    var tk = (function () {
      try { return window.__bridgeToken || localStorage.getItem("webmcp_bridge_token") || ""; } catch (e) { return ""; }
    })();
    var cancelReq = fetch(withToken(BRIDGE + "/chat/cancel", tk), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(function () {});
    setTimeout(function () {
      if (stream) { try { stream.abort(); } catch (e) {} }
    }, 0);
    return cancelReq;
  }
  stopAnswerRef = stopAnswer;

  if (transport) {
    var tp = transport;
    var stopRef = null;
    stopAnswerRef = function () {
      try { if (stopRef) stopRef(); } catch (e) {}
      finish();
    };
    try {
      stopRef = function () { try { tp.cancel(); } catch (e) {} };
      var tpRes = tp.ask(payload, handleEventPlain);
      if (tpRes && typeof tpRes.then === 'function') {
        tpRes.then(function (r) {
          if (r && r.ok === false && r.reason) handleEventPlain({ type: "error", reason: String(r.reason) });
          finish();
        }).catch(function (e) {
          handleEventPlain({ type: "error", reason: String((e && e.message) || e) });
          finish();
        });
      } else {
        finish();
      }
    } catch (e) {
      handleEventPlain({ type: "error", reason: String((e && e.message) || e) });
      finish();
    }
    return;
  }

  function attempt(n) {
    return tokenAsync(n > 1).then(function (tk) {
      return fetch(withToken(BRIDGE + "/chat", tk), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        signal: stream ? stream.signal : undefined,
      });
    }).then(function (res) {
      if ((res.status === 401 || res.status === 403) && n === 1) return attempt(2);
      return res;
    });
  }

  attempt(1).then(function (res) {
    if (!res.ok || !res.body) throw new Error("HTTP " + res.status);
    var reader = res.body.getReader();
    var dec = new TextDecoder();
    var buf = "";
    function pump() {
      return reader.read().then(function (r) {
        if (r.done) return finish();
        buf += dec.decode(r.value, { stream: true });
        var parts = buf.split("\n\n");
        buf = parts.pop();
        for (var i = 0; i < parts.length; i++) handleEvent(parts[i]);
        return pump();
      });
    }
    function handleEvent(raw) {
      var line = raw.split("\n").filter(function (l) { return l.indexOf("data:") === 0; })[0];
      if (!line) return;
      var ev;
      try { ev = JSON.parse(line.slice(5).trim()); } catch (e) { return; }
      handleEventPlain(ev);
    }
    return pump();
  }).catch(function (e) {
    clearStatus(botMsg);
    if (e && e.name === "AbortError") {
      flushRender(botMsg);
      if (!botMsg.raw) {
        botMsg.body.textContent = "（已停止）";
      } else {
        var tail = document.createElement("span");
        tail.className = "chat-stopped";
        tail.textContent = "（已停止）";
        botMsg.body.appendChild(tail);
      }
    } else {
      botMsg.raw = "";
      botMsg.done = true;
      botMsg.body.textContent = "连不上助手（" + describeFailure(e) + "）";
    }
    busy = false;
    resetSendButton();
    if (attachBtn) attachBtn.disabled = false;
    stream = null;
  });
}

function resetSendButton() {
  if (!sendBtn) return;
  sendBtn.classList.remove("stop");
  sendBtn.disabled = false;
  sendBtn.textContent = "↑";
  sendBtn.setAttribute("aria-label", "发送");
  sendBtn.title = "";
  stopAnswerRef = function () {};
}

function describeFailure(e) {
  var msg = String((e && e.message) || e);
  var m = msg.match(/^HTTP (\d{3})$/);
  if (m) {
    var code = Number(m[1]);
    if (code === 401 || code === 403) return "本地桥拒绝了这次请求，刷新页面再试（token 可能已更换）";
    if (code === 404) return "本地桥没有 /chat 端点，先更新桥脚本";
    if (code === 413) return "这条消息太长";
    if (code === 429) return "发得太快了，等几秒再问";
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) {
    return "连不上助手：检查油猴脚本是否已安装并启用（脚本没生效时不会建立通道）";
  }
  return msg;
}

// ── 宽度调整 ──
var SESS_W = "chat-sessions-width";
var SESS_W_KEY = "shirone-chat-sessions-width";
var SESS_W_DEFAULT = 280;
var SESS_W_MIN = 200;
var SESS_W_MAX = 420;

var CHAT_W = "chat-dialog-width";
var CHAT_W_KEY = "shirone-chat-dialog-width";
var CHAT_W_LEGACY_KEY = "shirone-chat-width";
var CHAT_W_DEFAULT = 380;
var CHAT_W_MIN = 300;
var CHAT_W_MAX = 720;
var CHAT_MAIN_MIN = 420;

function chatMaxWidth() {
  var sidebar = 0;
  var d = (typeof document.querySelector === "function") ? document.querySelector(".m3-drawer") : null;
  if (d && window.innerWidth > 860) sidebar = d.getBoundingClientRect().width || 0;
  var room = Math.floor(window.innerWidth - sidebar - CHAT_MAIN_MIN);
  if (room < CHAT_W_MIN) return CHAT_W_MIN;
  return Math.min(CHAT_W_MAX, room);
}

function applySessionsWidth(w, persist) {
  var v = Math.round(w);
  if (v < SESS_W_MIN) v = SESS_W_MIN;
  if (v > SESS_W_MAX) v = SESS_W_MAX;
  document.documentElement.style.setProperty("--" + SESS_W, v + "px");
  if (persist) {
    try { localStorage.setItem(SESS_W_KEY, String(v)); } catch (e) {}
  }
  return v;
}

function applyChatWidth(w, persist) {
  var max = chatMaxWidth();
  var v = Math.round(w);
  if (v < CHAT_W_MIN) v = CHAT_W_MIN;
  if (v > max) v = max;
  document.documentElement.style.setProperty("--" + CHAT_W, v + "px");
  document.documentElement.style.setProperty("--chat-width", v + "px");
  if (persist) {
    try {
      localStorage.setItem(CHAT_W_KEY, String(v));
      localStorage.setItem(CHAT_W_LEGACY_KEY, String(v));
    } catch (e) {}
  }
  return v;
}

function restoreChatWidth() {
  if (window.innerWidth <= 860) return;
  try {
    var sw = localStorage.getItem(SESS_W_KEY);
    if (sw) {
      var sn = parseInt(sw, 10);
      if (!isNaN(sn) && sn >= SESS_W_MIN) applySessionsWidth(sn, false);
    }
  } catch (e) {}
  try {
    var s = localStorage.getItem(CHAT_W_KEY) || localStorage.getItem(CHAT_W_LEGACY_KEY);
    if (!s) return;
    var n = parseInt(s, 10);
    if (isNaN(n) || n < CHAT_W_MIN) return;
    applyChatWidth(n, false);
  } catch (e) {}
}

function buildSessionsResizer() {
  var el = document.createElement("div");
  el.className = "chat-resizer chat-resizer-right";
  el.id = "chat-sessions-resizer";
  el.title = "按住拖拽调整会话列表宽度，双击恢复默认";

  var dragging = false;
  var startX = 0;
  var startW = 0;

  el.addEventListener("mousedown", function (e) {
    if (window.innerWidth <= 860) return;
    dragging = true;
    startX = e.clientX;
    startW = dockEl ? dockEl.getBoundingClientRect().width : SESS_W_DEFAULT;
    el.classList.add("dragging");
    document.body.classList.add("chat-resizing");
    e.preventDefault();
  });

  window.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    applySessionsWidth(startW + (e.clientX - startX), false);
  });

  window.addEventListener("mouseup", function () {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("dragging");
    document.body.classList.remove("chat-resizing");
    if (dockEl) applySessionsWidth(dockEl.getBoundingClientRect().width, true);
  });

  el.addEventListener("dblclick", function () {
    applySessionsWidth(SESS_W_DEFAULT, true);
  });

  el.addEventListener("touchstart", function (e) {
    if (window.innerWidth <= 860 || !e.touches.length) return;
    dragging = true;
    startX = e.touches[0].clientX;
    startW = dockEl ? dockEl.getBoundingClientRect().width : SESS_W_DEFAULT;
    el.classList.add("dragging");
    document.body.classList.add("chat-resizing");
  }, { passive: true });
  el.addEventListener("touchmove", function (e) {
    if (!dragging || !e.touches.length) return;
    applySessionsWidth(startW + (e.touches[0].clientX - startX), false);
  }, { passive: true });
  el.addEventListener("touchend", function () {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("dragging");
    document.body.classList.remove("chat-resizing");
    if (dockEl) applySessionsWidth(dockEl.getBoundingClientRect().width, true);
  });

  return el;
}

function buildResizer() {
  var el = document.createElement("div");
  el.className = "chat-resizer chat-resizer-left";
  el.id = "chat-resizer";
  el.title = "按住拖拽调整助手宽度，双击恢复默认";

  var dragging = false;
  var startX = 0;
  var startW = 0;

  el.addEventListener("mousedown", function (e) {
    if (window.innerWidth <= 860) return;
    dragging = true;
    startX = e.clientX;
    startW = panel ? panel.getBoundingClientRect().width : CHAT_W_DEFAULT;
    el.classList.add("dragging");
    document.body.classList.add("chat-resizing");
    e.preventDefault();
  });

  window.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    applyChatWidth(startW + (startX - e.clientX), false);
  });

  window.addEventListener("mouseup", function () {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("dragging");
    document.body.classList.remove("chat-resizing");
    if (panel) applyChatWidth(panel.getBoundingClientRect().width, true);
  });

  el.addEventListener("dblclick", function () {
    applyChatWidth(CHAT_W_DEFAULT, true);
  });

  el.addEventListener("touchstart", function (e) {
    if (window.innerWidth <= 860 || !e.touches.length) return;
    dragging = true;
    startX = e.touches[0].clientX;
    startW = panel ? panel.getBoundingClientRect().width : CHAT_W_DEFAULT;
    el.classList.add("dragging");
    document.body.classList.add("chat-resizing");
  }, { passive: true });
  el.addEventListener("touchmove", function (e) {
    if (!dragging || !e.touches.length) return;
    applyChatWidth(startW + (startX - e.touches[0].clientX), false);
  }, { passive: true });
  el.addEventListener("touchend", function () {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("dragging");
    document.body.classList.remove("chat-resizing");
    if (panel) applyChatWidth(panel.getBoundingClientRect().width, true);
  });

  return el;
}

// ── DOM 挂载 ──
function buildDock() {
  if (dockEl) return;
  dockEl = document.createElement("aside");
  dockEl.id = "chat-dock";
  dockEl.className = "chat-sessions";
  dockEl.setAttribute("aria-label", "会话列表");

  var edge = document.createElement("div");
  edge.className = "chat-edge";
  edge.setAttribute("tabindex", "0");
  edge.setAttribute("aria-label", "会话列表");

  mobileHandle = document.createElement("button");
  mobileHandle.type = "button";
  mobileHandle.className = "chat-mobile-handle";
  mobileHandle.setAttribute("aria-label", "会话列表");
  mobileHandle.setAttribute("aria-expanded", "false");
  mobileHandle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
  mobileHandle.onclick = function (e) {
    e.stopPropagation();
    var isOpen = dockEl.classList.toggle("open");
    mobileHandle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  var bmBar = document.createElement("aside");
  bmBar.className = "chat-bookmarks";
  bmBar.setAttribute("aria-label", "会话书签");

  bmListEl = document.createElement("div");
  bmListEl.className = "bm-list";
  bmBar.appendChild(bmListEl);

  dockEl.appendChild(edge);
  dockEl.appendChild(mobileHandle);
  dockEl.appendChild(bmBar);
  dockEl.appendChild(buildSessionsResizer());

  var siteShell = (typeof document.querySelector === "function") ? document.querySelector(".site-shell") : null;
  if (siteShell) {
    var drawer = (typeof siteShell.querySelector === "function") ? siteShell.querySelector(".m3-drawer") : null;
    if (drawer && drawer.parentNode === siteShell) {
      if (typeof drawer.after === "function") {
        drawer.after(dockEl);
      } else {
        siteShell.insertBefore(dockEl, drawer.nextSibling);
      }
    } else {
      siteShell.insertBefore(dockEl, siteShell.firstChild);
    }
  } else {
    document.body.appendChild(dockEl);
  }

  var openTimer = null;
  var closeTimer = null;

  function onEdgeEnter() {
    if (window.innerWidth <= 860) return;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    if (!openTimer) {
      openTimer = setTimeout(function () {
        openTimer = null;
        dockEl.classList.add("open");
      }, 80);
    }
  }

  function onDockLeave() {
    if (window.innerWidth <= 860) return;
    if (openTimer) { clearTimeout(openTimer); openTimer = null; }
    if (!closeTimer) {
      closeTimer = setTimeout(function () {
        closeTimer = null;
        dockEl.classList.remove("open");
      }, 500);
    }
  }

  edge.addEventListener("mouseenter", onEdgeEnter);
  dockEl.addEventListener("mouseenter", function () {
    if (window.innerWidth <= 860) return;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  });
  dockEl.addEventListener("mouseleave", onDockLeave);

  edge.addEventListener("focus", function () { dockEl.classList.add("open"); });
}

function buildPanel() {
  if (panel) return;
  panel = document.createElement("aside");
  panel.id = "chat-panel";
  panel.className = "chat-panel chat-dialog";
  panel.setAttribute("aria-label", "学习助手");

  var head = document.createElement("div");
  head.className = "chat-head";
  var title = document.createElement("span");
  title.className = "chat-title";
  title.textContent = "学习助手";
  var closeBtn = document.createElement("button");
  closeBtn.className = "chat-head-btn";
  closeBtn.setAttribute("aria-label", "关闭");
  var x = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  x.setAttribute("width", "16"); x.setAttribute("height", "16");
  x.setAttribute("viewBox", "0 0 24 24"); x.setAttribute("fill", "none");
  x.setAttribute("stroke", "currentColor"); x.setAttribute("stroke-width", "2");
  x.setAttribute("stroke-linecap", "round");
  var xp = document.createElementNS("http://www.w3.org/2000/svg", "path");
  xp.setAttribute("d", "M18 6L6 18M6 6l12 12");
  x.appendChild(xp);
  closeBtn.appendChild(x);
  closeBtn.onclick = close;
  head.appendChild(title); head.appendChild(closeBtn);

  logEl = document.createElement("div");
  logEl.className = "chat-log";
  logEl.setAttribute("role", "log");
  logEl.setAttribute("aria-live", "polite");
  logEl.addEventListener("scroll", onUserScroll, { passive: true });
  logEl.addEventListener("wheel", function () { stuck = false; }, { passive: true });
  logEl.addEventListener("touchmove", function () { stuck = false; }, { passive: true });

  var form = document.createElement("form");
  form.className = "chat-input";

  attachBar = document.createElement("div");
  attachBar.className = "chat-attach-bar";

  fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.multiple = true;
  fileInput.style.display = "none";
  fileInput.addEventListener("change", function () {
    acceptFiles(fileInput.files);
    fileInput.value = "";
  });

  attachBtn = document.createElement("button");
  attachBtn.type = "button";
  attachBtn.className = "chat-attach-btn";
  attachBtn.setAttribute("aria-label", "添加图片");
  attachBtn.title = "添加图片（也可以直接粘贴或拖进来）";
  (function () {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "18"); svg.setAttribute("height", "18");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    var p1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p1.setAttribute("d", "M21.4 11.6l-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.7 3.7 0 0 1 5.2 5.2l-8.5 8.5a1.8 1.8 0 0 1-2.6-2.6l7.8-7.8");
    svg.appendChild(p1);
    attachBtn.appendChild(svg);
  })();
  attachBtn.addEventListener("click", function () { fileInput.click(); });

  inputEl = document.createElement("textarea");
  inputEl.className = "chat-textarea";
  inputEl.rows = 1;
  inputEl.placeholder = "问学习助手…";
  inputEl.addEventListener("input", function () {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(132, inputEl.scrollHeight) + "px";
  });
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit ? form.requestSubmit() : sendNow();
    }
  });
  inputEl.addEventListener("paste", function (e) {
    var items = (e.clipboardData && e.clipboardData.items) || [];
    var files = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].kind === "file" && /^image\//.test(items[i].type)) {
        var f = items[i].getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) { e.preventDefault(); acceptFiles(files); }
  });

  sendBtn = document.createElement("button");
  sendBtn.className = "chat-send";
  sendBtn.type = "submit";
  sendBtn.setAttribute("aria-label", "发送");
  sendBtn.textContent = "↑";

  form.appendChild(attachBtn); form.appendChild(inputEl); form.appendChild(sendBtn);
  form.appendChild(fileInput);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) { stopAnswerRef(); return; }
    sendNow();
  });

  panel.addEventListener("dragover", function (e) {
    if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") < 0) return;
    e.preventDefault();
    panel.classList.add("chat-dragover");
  });
  panel.addEventListener("dragleave", function (e) {
    if (e.target === panel) panel.classList.remove("chat-dragover");
  });
  panel.addEventListener("drop", function (e) {
    panel.classList.remove("chat-dragover");
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault();
    acceptFiles(e.dataTransfer.files);
  });

  panel.appendChild(head);
  panel.appendChild(logEl);
  panel.appendChild(attachBar);
  panel.appendChild(form);
  panel.appendChild(buildResizer());

  var siteShell = (typeof document.querySelector === "function") ? document.querySelector(".site-shell") : null;
  if (siteShell) {
    siteShell.appendChild(panel);
  } else {
    document.body.appendChild(panel);
  }

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "chat-backdrop";
    backdrop.addEventListener("click", function () {
      close();
      if (dockEl) dockEl.classList.remove("open");
    });
    document.body.appendChild(backdrop);
  }
}

function sendNow() {
  var t = String(inputEl && inputEl.value || "").trim();
  if (busy) return;
  var hasReadyImage = false;
  for (var i = 0; i < pending_attach.length; i++) {
    if (pending_attach[i].status === "ready") { hasReadyImage = true; break; }
  }
  if (!t && !hasReadyImage) return;
  if (!t) t = "图里有什么？";
  inputEl.value = "";
  inputEl.style.height = "auto";
  askChat(t.slice(0, MAX_MESSAGE_CHARS));
}

function showEmpty() {
  var box = document.createElement("div");
  box.className = "chat-empty";
  var p = document.createElement("p");
  p.textContent = "我可以帮你在这套课程资料里找东西、读页面、看图。试试：";
  var ul = document.createElement("ul");
  ["这一页讲了什么？", "电机学有哪些课堂笔记？", "跳到「铁芯损耗」那一节"].forEach(function (s) {
    var li = document.createElement("li");
    li.textContent = s;
    ul.appendChild(li);
  });
  box.appendChild(p); box.appendChild(ul);
  logEl.appendChild(box);
}

function showLocalOnlyNotice() {
  if (inputEl) { inputEl.disabled = true; inputEl.placeholder = "仅本机可用"; }
  if (sendBtn) sendBtn.disabled = true;
  if (attachBtn) attachBtn.disabled = true;
  var box = document.createElement("div");
  box.className = "chat-empty chat-local-only";
  var p1 = document.createElement("p");
  p1.textContent = "学习助手要连你电脑上的油猴脚本，所以只在你自己电脑上打开本站时可用。";
  var p2 = document.createElement("p");
  p2.textContent = "在线版可以正常阅读全部课程资料；需要用助手时，先安装并启用学习助手脚本（油猴），再打开本站。";
  box.appendChild(p1); box.appendChild(p2);
  logEl.appendChild(box);
}

// ── 唤醒流水线（按需冷启动）──
function ensureInitialized() {
  if (initialized) return;
  initialized = true;

  buildDock();
  buildPanel();
  if (typeof window !== "undefined" && window.innerWidth > 860) {
    if (dockEl) void dockEl.offsetWidth;
    if (panel) void panel.offsetWidth;
  }

  try { if (window.__webmcpEnable) window.__webmcpEnable(); } catch (e) {}
  ensureMaths();
  loadSessions();
}

function openPanel() {
  ensureInitialized();
  open = true;
  if (!document.body.dataset) document.body.dataset = {};
  if (document.body.dataset.sidebarWasCollapsed === undefined) {
    document.body.dataset.sidebarWasCollapsed = (document.body.classList && document.body.classList.contains("sidebar-collapsed")) ? "true" : "false";
  }
  document.body.classList.add("sidebar-collapsed");
  document.body.classList.add("chat-open");
  restoreChatWidth();
  var btn = document.getElementById("assistant-toggle");
  if (btn) btn.setAttribute("aria-expanded", "true");
  if (logEl && !logEl.children.length) {
    if (LOCAL_ONLY) showEmpty();
    else showLocalOnlyNotice();
  }
  if (inputEl && LOCAL_ONLY && !(window.innerWidth <= 860)) inputEl.focus();
  stuck = true;
  scrollToBottom();
}

function close() {
  open = false;
  document.body.classList.remove("chat-open");
  if (dockEl) dockEl.classList.remove("open");
  if (mobileHandle) mobileHandle.setAttribute("aria-expanded", "false");
  var wasCollapsed = document.body.dataset && document.body.dataset.sidebarWasCollapsed === "true";
  if (document.body.dataset) delete document.body.dataset.sidebarWasCollapsed;
  if (!wasCollapsed) {
    document.body.classList.remove("sidebar-collapsed");
  }
  var btn = document.getElementById("assistant-toggle");
  if (btn) btn.setAttribute("aria-expanded", "false");
  if (inputEl) inputEl.blur();
}

function toggle() {
  ensureInitialized();
  open ? close() : openPanel();
}

// ── 事件绑定（冷态监听）──
var toggleBtn = document.getElementById("assistant-toggle");
if (toggleBtn) {
  toggleBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    toggle();
  });
}

window.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    toggle();
  }
});

// SPA 导航钩子：面板与书签树驻留 body，仅同步位置
window.__chatSync = function () {
  if (!open) return;
  stuck = true;
  scrollToBottom();
};

var resizeQueued = false;
window.addEventListener("resize", function () {
  if (resizeQueued) return;
  resizeQueued = true;
  requestAnimationFrame(function () {
    resizeQueued = false;
    if (!open || window.innerWidth <= 860) return;
    if (panel) applyChatWidth(panel.getBoundingClientRect().width, false);
  });
}, { passive: true });

window.__chatPanel = {
  open: openPanel,
  close: close,
  toggle: toggle,
  ask: askChat,
  get isOpen() { return open; },
  getState: function () {
    return {
      initialized: initialized,
      open: open,
      busy: busy,
      currentSessionId: currentSessionId,
      sessions: sessionsList.slice(),
    };
  },
  selectSession: function (id) {
    ensureInitialized();
    return selectSession(id);
  },
  deleteSession: function (id) {
    ensureInitialized();
    return deleteSession(id);
  },
  newSession: function () {
    ensureInitialized();
    return newSession();
  },
};

window.__chatPanel.setTransport = function (fn) {
  var prev = transport;
  transport = fn || null;
  if (busy) {
    try { stopAnswerRef(); } catch (e) {}
    try { if (prev && typeof prev.abandon === "function") prev.abandon("连接方式已切换"); } catch (e) {}
    setTimeout(function () {
      if (busy) { busy = false; resetSendButton(); if (attachBtn) attachBtn.disabled = false; stream = null; }
    }, 2000);
  }
};

window.__chatPanel.showNotice = function (text) {
  ensureInitialized();
  var notice = addMsg("bot");
  notice.body.textContent = String(text || "");
  notice.done = true;
};
})();