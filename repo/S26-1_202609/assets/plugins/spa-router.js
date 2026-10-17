(function () {
"use strict";
if (typeof window === "undefined" || window.__spaRouter) return;

// 只接管站内链接：同源、.html（或目录尾斜杠→index.html）、非下载、非新窗口
function sameSite(url) {
  try { return new URL(url, location.href).origin === location.origin; } catch (e) { return false; }
}

function isPageLink(a) {
  if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
  var href = a.getAttribute("href") || "";
  if (!href || href.charAt(0) === "#") return false;
  if (/^(mailto:|javascript:|tel:)/i.test(href)) return false;
  if (!sameSite(href)) return false;
  var u = new URL(href, location.href);
  if (/\.(png|jpe?g|webp|gif|svg|jxl|pdf|zip|doc|docx|txt|mp3|mp4)$/i.test(u.pathname)) return false;
  return true;
}

// 换页：fetch → 解析 → 替换三块 → reset 钩子
var inflight = null;
function navigate(rawUrl, hash, push) {
  // URL 规范化：防拼接污染（hash 误粘进 path 之类）；hash 一律走 URL.hash，不手拼字符串
  var u = new URL(rawUrl, location.href);
  u.hash = hash ? encodeURIComponent(hash) : "";
  var url = u.pathname + u.search;
  hash = hash || "";
  if (inflight) inflight.abort();
  var ctl = ("AbortController" in window) ? new AbortController() : null;
  inflight = ctl;
  var opts = ctl ? { signal: ctl.signal, credentials: "same-origin" } : { credentials: "same-origin" };
  var doFetch = function (extra) { return fetch(url, Object.assign({}, opts, extra || {})); };
  return doFetch().catch(function (err) {
    // 网络/缓存竞态先绕过 SW 重试一次（cache:reload 直连网络），移动端整页跳代价最大
    if (err && err.name === "AbortError") throw err;
    return doFetch({ cache: "reload" });
  }).then(function (res) {
    if (!res || !res.ok) throw new Error("HTTP " + (res ? res.status : "unknown"));
    return res.text();
  }).then(function (html) {
    if (inflight !== ctl) return; // 已被更新的一次导航取代
    inflight = null;
    var doc = new DOMParser().parseFromString(html, "text/html");

    // ① 正文：article-content（容器 article-container 一并换，保 frontmatter 区域结构）
    var nextMain = doc.querySelector(".article-content");
    var curMain = document.querySelector(".article-content");
    if (!nextMain || !curMain) { location.href = url; return; } // 结构不符 → 整页跳转兜底
    curMain.replaceWith(nextMain);

    // ② TOC：m3-toc（aside）
    var nextToc = doc.querySelector(".m3-toc");
    var curToc = document.querySelector(".m3-toc");
    if (nextToc && curToc) curToc.replaceWith(nextToc);

    // ③ 标题
    if (doc.title) document.title = doc.title;

    // ④ 侧栏 active 态（drawer 里当前页高亮由 theme 脚本管；这里触发它的重扫）
    // （shirone-reader 的 active 类基于 URL data 属性——换页后由 __readerRescan 处理）

    if (push) history.pushState({ spa: true }, "", u.href);
    if (hash) {
      // 锚点落位要等正文渲染稳定（KaTeX/TOC 会改文档高度，立刻滚会漂——§8.23 同款）。
      // 两段式：先展开折叠面板（钩子），300ms 后再滚；scroll-margin-top 由主题 CSS 管。
      try { if (window.__disclosureOpen) window.__disclosureOpen(hash); } catch (e) {}
      setTimeout(function () {
        var el = document.getElementById(hash);
        if (el) el.scrollIntoView({ block: "start" });
      }, 300);
    } else {
      window.scrollTo(0, 0);
    }

    // 抽屉导航（active 重算/自动关/滚到高亮）统一由 drawer-sync 负责
    try { if (window.__drawerSync) window.__drawerSync.onNavigate(); } catch (e) {}

    // reset 钩子（全部可选存在）
    try { if (window.__glossaryReset) window.__glossaryReset(); } catch (e) {}
    try { if (window.__readerRescan) window.__readerRescan(); } catch (e) {}
    try { if (window.__disclosureOpen) window.__disclosureOpen(hash); } catch (e) {}
  }).catch(function (err) {
    inflight = null;
    if (err && err.name === "AbortError") return;
    // 网络/解析失败 → 整页跳转兜底（保底可用性优先于不重载）
    location.href = url;
  });
}

// 点击委托（document 级——SPA 换正文不丢绑定）
document.addEventListener("click", function (ev) {
  if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  var a = ev.target.closest ? ev.target.closest("a") : null;
  if (!isPageLink(a)) return;
  var u = new URL(a.href, location.href);
  var hash = u.hash ? u.hash.slice(1) : "";
  var target = u.pathname + u.search;
  if (target === location.pathname + location.search) {
    // 同页锚点：不换正文，直接滚
    if (hash) {
      var el = document.getElementById(hash);
      if (el) { ev.preventDefault(); el.scrollIntoView({ block: "start" });
        try { if (window.__disclosureOpen) window.__disclosureOpen(hash); } catch (e) {} }
    }
    return; // 同页无锚点 → 让默认行为（一般不会发生）
  }
  ev.preventDefault();
  navigate(target, hash, true);
});

// 前进/后退
window.addEventListener("popstate", function () {
  navigate(location.pathname + location.search, location.hash ? location.hash.slice(1) : "", false);
});

window.__spaRouter = { navigate: navigate };
})();