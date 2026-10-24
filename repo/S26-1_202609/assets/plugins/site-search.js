(function () {
"use strict";
const CJK_CLASS = "\\u3000-\\u303f\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\uff00-\\uffef";
const ALNUM_CLASS = "0-9a-z";
const CJK_RE_SRC = "[\\u3000-\\u303f\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\uff00-\\uffef]";
const foldSearchText = function foldSearchText(input) {
  if (input === null || input === undefined) return '';
  let s = String(input);
  try { s = s.normalize('NFKC'); } catch (_) { /* 无 NFKC 时退化为原样 */ }
  s = s.toLowerCase();
  s = s.replace(/[ \t\u00a0\u3000]+/g, ' ');
  s = s.replace(/ *\n */g, '\n');
  s = s.replace(/\n{2,}/g, '\n');
  // 「第 1 章」「MATLAB 函数」这类空格是排版习惯，用户不会照着敲；汉字与汉字、汉字与
  // 字母数字之间的空格一律吃掉。字母数字之间的空格保留（那里空格是词的一部分）。
  s = s.replace(new RegExp(`([${CJK_CLASS}${ALNUM_CLASS}]) (?=${CJK_RE_SRC})`, 'g'), '$1');
  s = s.replace(new RegExp(`(${CJK_RE_SRC}) (?=[${ALNUM_CLASS}])`, 'g'), '$1');
  return s.trim();
};
const isIndexableGram = function isIndexableGram(gram) {
  return gram.length === 2 && gram.indexOf(' ') < 0 && gram.indexOf('\n') < 0;
};
const queryGrams = function queryGrams(foldedQuery) {
  const bigrams = [];
  const unigrams = [];
  const q = String(foldedQuery || '');
  for (let i = 0; i < q.length; i++) {
    const ch = q[i];
    if (ch !== ' ' && ch !== '\n' && unigrams.indexOf(ch) < 0) unigrams.push(ch);
    if (i + 1 < q.length) {
      const gram = q.slice(i, i + 2);
      if (isIndexableGram(gram)) bigrams.push(gram);
    }
  }
  return { bigrams, unigrams };
};
const hashGram = function hashGram(gram) {
  let h = 0x811c9dc5;
  for (let i = 0; i < gram.length; i++) {
    h ^= gram.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
};
const verifyPhrase = function verifyPhrase(postingsList) {
  if (!postingsList || !postingsList.length) return [];
  let anchor = 0;
  for (let k = 1; k < postingsList.length; k++) {
    if (!postingsList[k] || !postingsList[k].length) return [];
    if (postingsList[k].length < postingsList[anchor].length) anchor = k;
  }
  if (!postingsList[anchor].length) return [];
  const sets = postingsList.map((list) => new Set(list));
  const found = [];
  for (const p of postingsList[anchor]) {
    const base = p - anchor;
    if (base < 0) continue;
    let ok = true;
    for (let k = 0; k < postingsList.length; k++) {
      if (k !== anchor && !sets[k].has(base + k)) { ok = false; break; }
    }
    if (ok) found.push(base);
  }
  found.sort((a, b) => a - b);
  return found;
};
const sectionForPosition = function sectionForPosition(headings, position) {
  if (!headings || !headings.length) return null;
  let found = null;
  for (const heading of headings) {
    if (heading.s <= position) found = heading;
    else break;
  }
  return found;
};
const countOccurrences = function countOccurrences(text, needle) {
  if (!text || !needle) return 0;
  let count = 0;
  let from = 0;
  for (;;) {
    const at = text.indexOf(needle, from);
    if (at < 0) return count;
    count += 1;
    from = at + needle.length;
  }
};
const makeSnippet = function makeSnippet(text, needle, options) {
  const opts = options || {};
  const radius = opts.radius || 42;
  const maxMarks = opts.maxMarks || 6;
  const total = countOccurrences(text, needle);
  const at = text.indexOf(needle);
  if (at < 0) return { html: '', total: 0 };
  const start = Math.max(0, at - radius);
  const end = Math.min(text.length, at + needle.length + radius);
  const segment = text.slice(start, end);
  let html = '';
  let cursor = 0;
  let marks = 0;
  for (;;) {
    const hit = segment.indexOf(needle, cursor);
    if (hit < 0 || marks >= maxMarks) break;
    html += escapeHtmlText(segment.slice(cursor, hit)) + '<mark>' + escapeHtmlText(needle) + '</mark>';
    cursor = hit + needle.length;
    marks += 1;
  }
  html += escapeHtmlText(segment.slice(cursor));
  html = html.replace(/\n/g, ' ');
  return { html: (start > 0 ? '…' : '') + html + (end < text.length ? '…' : ''), total };
};
const scoreSearchHit = function scoreSearchHit(entry) {
  let score = 0;
  if (entry.titleHit) score += 1000;
  if (entry.titleExact) score += 500;
  score += Math.min(entry.headingHits || 0, 3) * 220;
  score += Math.min(entry.total || 0, 8) * 14;
  if (entry.firstPos >= 0) score += Math.max(0, 36 - Math.floor(entry.firstPos / 240));
  const density = (entry.total || 0) / Math.max(400, entry.chars || 0);
  score += Math.min(70, Math.round(density * 4000));
  return score;
};
const escapeHtmlText = function escapeHtmlText(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
};

const toggleBtn = document.getElementById("search-toggle");
const panel = document.getElementById("search-panel");
const input = document.getElementById("search-input");
const results = document.getElementById("search-results");
const closeBtn = document.getElementById("search-close");

window.__siteSearch = {
  foldSearchText, queryGrams, hashGram, verifyPhrase, sectionForPosition,
  makeSnippet, scoreSearchHit, countOccurrences
};
if (!toggleBtn || !panel || !input || !results) return;

let activeIndex = -1;
let currentHits = [];
let searchSeq = 0;
let indexData = null;
const bucketCache = new Map();
const textCache = new Map();

// 站点根：从当前页地址按 data-depth 逐级上跳（与 build.mjs 的 rootRel 同一套约定）。
function siteRootUrl() {
  const depth = parseInt(document.documentElement.dataset.depth || "0", 10);
  let dir = location.pathname.replace(/[^/]*$/, "");
  for (let i = 0; i < depth; i++) dir = dir.replace(/[^/]+\/$/, "");
  if (!dir.endsWith("/")) dir += "/";
  return location.origin + dir;
}

function assetUrl(path) {
  return siteRootUrl() + path;
}

function loadIndex() {
  if (indexData) return Promise.resolve(indexData);
  return fetch(assetUrl("search/index.json"))
    .then((res) => {
      if (!res.ok) throw new Error("index " + res.status);
      return res.json();
    })
    .then((data) => { indexData = data; return data; });
}

function loadBucket(number) {
  if (bucketCache.has(number)) return bucketCache.get(number);
  const promise = fetch(assetUrl("search/g/" + number + ".json"))
    .then((res) => (res.ok ? res.json() : { grams: {}, uni: {} }))
    .catch(() => ({ grams: {}, uni: {} }));
  bucketCache.set(number, promise);
  return promise;
}

function loadText(id) {
  if (textCache.has(id)) return textCache.get(id);
  const promise = fetch(assetUrl("search/t/" + id + ".json"))
    .then((res) => (res.ok ? res.json() : { text: "" }))
    .catch(() => ({ text: "" }));
  textCache.set(id, promise);
  return promise;
}

function openPanel() {
  panel.hidden = false;
  document.body.classList.add("search-open");
  input.focus();
}
function closePanel() {
  panel.hidden = true;
  document.body.classList.remove("search-open");
  activeIndex = -1;
}

function showProgress(percent, label) {
  results.innerHTML =
    '<div class="search-progress"><div class="search-progress-label">' + escapeHtmlText(label) +
    '</div><div class="search-progress-track"><div class="search-progress-bar" style="width:' +
    percent + '%"></div></div></div>';
}

function hitHref(hit) {
  // 索引里的 url 是**相对站点根**的路径（不带前导斜杠），这里补上站点根，
  // 于是 /repo/xxx/ 这类部署前缀下也能正确跳转。
  return siteRootUrl() + hit.url + (hit.anchor ? "#" + hit.anchor : "");
}

function renderHits(hits, query, options) {
  const opts = options || {};
  currentHits = hits;
  activeIndex = -1;
  if (!hits.length && !opts.partial) {
    results.innerHTML = '<p class="search-hint">没有找到「' + escapeHtmlText(query) + '」相关内容。换个说法或只搜关键词试试。</p>';
    return;
  }
  const list = hits.map((hit, i) => {
    const section = hit.sectionText
      ? '<span class="search-hit-section">' + escapeHtmlText(hit.sectionText) + "</span>"
      : "";
    const excerpt = hit.snippet
      ? hit.snippet
      : '<span class="search-panel-empty">命中 ' + (hit.total || 0) + " 处" +
        (hit.headingHitText ? "（小标题：" + escapeHtmlText(hit.headingHitText) + "）" : "") + "…</span>";
    return '<a class="search-hit" href="' + escapeHtmlText(hitHref(hit)) + '" data-index="' + i + '">' +
      section +
      '<span class="search-hit-title">' + escapeHtmlText(hit.title || hit.url) + "</span>" +
      '<span class="search-hit-excerpt">' + excerpt + "</span></a>";
  }).join("");
  const more = opts.partial
    ? '<div class="search-progress search-progress-inline"><div class="search-progress-label">正在载入更多结果…</div><div class="search-progress-track"><div class="search-progress-bar search-progress-bar-indeterminate"></div></div></div>'
    : "";
  const truncated = opts.totalPages && opts.totalPages > hits.length
    ? '<p class="search-panel-empty">仅显示相关度最高的 ' + hits.length + " 页（共 " + opts.totalPages + " 页命中）。</p>"
    : "";
  results.innerHTML = list + truncated + more;
}

function setActive(next) {
  const items = results.querySelectorAll(".search-hit");
  if (!items.length) return;
  if (activeIndex >= 0 && items[activeIndex]) items[activeIndex].classList.remove("active");
  activeIndex = (next + items.length) % items.length;
  items[activeIndex].classList.add("active");
  items[activeIndex].scrollIntoView({ block: "nearest" });
}

// 候选 → 命中。先只算位置与权重（不需要正文），正文摘要随后按需拉取。
function collectHits(data, bucketsByNumber, query) {
  const grams = queryGrams(query);
  const bucketOf = (gram) => bucketsByNumber.get(hashGram(gram) % data.buckets);
  const postingsFor = (gram) => {
    const bucket = bucketOf(gram);
    return bucket && bucket.grams ? bucket.grams[gram] : undefined;
  };
  const unigramDocsFor = (ch) => {
    const bucket = bucketOf(ch);
    return bucket && bucket.uni ? bucket.uni[ch] : undefined;
  };

  const hits = [];
  for (const doc of data.docs) {
    const positions = [];
    let total = 0;
    let firstPos = -1;
    let matchedByBody = false;

    if (grams.bigrams.length) {
      const perGram = grams.bigrams.map(postingsFor);
      if (perGram.some((postings) => !postings || !postings[doc.id])) {
        // 有 gram 缺口：这个文档不可能是连续命中，但标题仍可能命中，交给下面的标题判断
      } else {
        const found = verifyPhrase(perGram.map((postings) => postings[doc.id]));
        if (found.length) {
          matchedByBody = true;
          total = found.length;
          firstPos = found[0];
          for (const p of found) positions.push(p);
        }
      }
    } else if (grams.unigrams.length) {
      const lists = grams.unigrams.map(unigramDocsFor);
      if (!lists.some((list) => !list || list.indexOf(doc.id) < 0)) {
        matchedByBody = true;
        total = 0; // 单字查询不数次数，拉正文后再算
      }
    }

    const foldedTitle = foldSearchText(doc.title || "");
    const titleHit = foldedTitle.indexOf(query) >= 0;
    const headingHits = [];
    for (const heading of doc.headings || []) {
      if (heading.t && heading.t.indexOf(query) >= 0) headingHits.push(heading);
    }
    if (!matchedByBody && !titleHit && !headingHits.length) continue;

    const section = firstPos >= 0 ? sectionForPosition(doc.headings, firstPos) : (headingHits[0] || null);
    hits.push({
      id: doc.id,
      url: doc.url,
      title: doc.title,
      chars: doc.chars,
      positions,
      total,
      firstPos,
      titleHit,
      titleExact: foldedTitle === query,
      headingHits: headingHits.length,
      headingHitText: headingHits.length ? (headingHits[0].d || headingHits[0].t) : "",
      anchor: section ? section.a : "",
      sectionText: section ? (section.d || section.t) : "",
      snippet: "",
      score: 0
    });
  }
  for (const hit of hits) hit.score = scoreSearchHit(hit);
  hits.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
  return { hits, grams };
}

async function runSearch(rawQuery) {
  const query = foldSearchText(rawQuery);
  if (!query) {
    results.innerHTML = '<p class="search-hint">输入关键词开始搜索。中文按字面子串匹配（搜「沙路法则」只出真正连着出现的地方），结果按相关度排序，回车打开第一条。</p>';
    return;
  }
  const seq = ++searchSeq;
  const firstLoad = !indexData;
  if (firstLoad) showProgress(15, "正在加载搜索索引…");

  let data;
  try {
    data = await loadIndex();
  } catch (err) {
    results.innerHTML = '<p class="search-hint">搜索索引未能加载（本地直接打开文件时不可用，请通过站点地址访问）。</p>';
    return;
  }
  if (seq !== searchSeq) return;

  const grams = queryGrams(query);
  const needed = [];
  for (const gram of grams.bigrams.concat(grams.unigrams)) {
    const number = hashGram(gram) % data.buckets;
    if (needed.indexOf(number) < 0) needed.push(number);
  }
  if (firstLoad) showProgress(45, "正在检索…");
  const loaded = await Promise.all(needed.map(loadBucket));
  if (seq !== searchSeq) return;
  const bucketsByNumber = new Map();
  needed.forEach((number, i) => bucketsByNumber.set(number, loaded[i]));

  const collected = collectHits(data, bucketsByNumber, query);
  if (!collected.hits.length) { renderHits([], rawQuery); return; }

  const top = collected.hits.slice(0, 12);
  const totalPages = collected.hits.length;
  renderHits(top, rawQuery, { partial: true, totalPages });

  // 摘要要正文，只给前 8 条拉，拉到一条刷新一次。
  const wantText = top.slice(0, 8);
  let arrived = 0;
  await Promise.all(wantText.map(async (hit) => {
    let payload;
    try { payload = await loadText(hit.id); } catch (_) { return; }
    if (seq !== searchSeq) return;
    const text = payload.text || "";
    const snippet = makeSnippet(text, query, { radius: 44 });
    if (snippet.html) {
      hit.snippet = snippet.html;
      hit.total = snippet.total;
    } else if (hit.positions.length) {
      const around = makeSnippet(text, text.slice(hit.positions[0], hit.positions[0] + query.length) || query, { radius: 44 });
      hit.snippet = around.html || "";
    } else {
      hit.total = countOccurrences(text, query);
    }
    arrived += 1;
    if (arrived === 1 || arrived % 3 === 0 || arrived === wantText.length) {
      renderHits(top, rawQuery, { partial: arrived < top.length, totalPages });
    }
  }));
  if (seq === searchSeq) renderHits(top, rawQuery, { totalPages });
}

let debounceTimer = null;
input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runSearch(input.value), 160);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const items = results.querySelectorAll(".search-hit");
    const target = activeIndex >= 0 ? items[activeIndex] : items[0];
    if (target) { e.preventDefault(); target.click(); }
  } else if (e.key === "ArrowDown") {
    e.preventDefault(); setActive(activeIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault(); setActive(activeIndex - 1);
  } else if (e.key === "Escape") {
    closePanel();
  }
});

toggleBtn.addEventListener("click", () => { if (panel.hidden) openPanel(); else closePanel(); });
if (closeBtn) closeBtn.addEventListener("click", closePanel);
panel.addEventListener("click", (e) => { if (e.target === panel) closePanel(); });

document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement && document.activeElement.tagName) || "");
  if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
    e.preventDefault();
    openPanel();
  } else if (e.key === "Escape" && !panel.hidden) {
    closePanel();
  }
});
})();