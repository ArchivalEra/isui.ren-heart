(function () {
"use strict";
if (typeof window === "undefined" || window.__drawerSync) return;

var MOBILE_MAX = 860; // 与 shirone-reader.css 的断点一致

/** active/expanded 重算：读 JSON + 按需水合新激活分支 + 对齐 data-node-id。 */
function applyJson(json) {
  var nav = window.__navStructure;
  if (!json || !json.nodes) return undefined; // 无侧栏形状 ⇒ 不动（保留烘焙态）
  var here = document.body.getAttribute("data-site-path") || "";
  // 共享判定（html 空间）——与构建期 activeIds 同一份实现。
  var state = nav.collectActive(json.nodes, here, true);
  if (typeof nav.hydrateIdsSync === "function") {
    nav.hydrateIdsSync(json.nodes, state.expandedIds);
  }
  var activeIds = {}; for (var i = 0; i < state.activeIds.length; i++) activeIds[state.activeIds[i]] = 1;
  var expandedIds = {}; for (var k = 0; k < state.expandedIds.length; k++) expandedIds[state.expandedIds[k]] = 1;

  var lis = document.querySelectorAll("li[data-node-id]");
  var hit = null;
  for (var j = 0; j < lis.length; j++) {
    var li = lis[j];
    var id = li.getAttribute("data-node-id");
    var on = !!activeIds[id];
    var isGroup = li.classList.contains("drawer-nav-group");
    var liActive = on;
    var liExpanded = isGroup && !!expandedIds[id];
    li.classList.toggle("active", liActive);
    if (isGroup) {
      li.classList.toggle("expanded", liExpanded);
      li.classList.toggle("collapsed", !liExpanded);
    }
    if (liActive && !hit) hit = li.querySelector("a.drawer-nav-link");
  }
  return hit;
}

function recompute() {
  var nav = window.__navStructure;
  var json = nav?.readNavJson ? nav.readNavJson() : null;
  if (json && json.nodes) return applyJson(json);
  return undefined;
}

/** 抽屉滚动到 active 链接可见（居中最佳，clamp 兜底）。 */
function scrollIntoView(link) {
  if (!link) return;
  var area = document.querySelector(".drawer-nav-scroll-area");
  if (!area) return;
  var lr = link.getBoundingClientRect();
  var ar = area.getBoundingClientRect();
  // 链接不在抽屉视口内 ⇒ 滚到居中
  if (lr.top < ar.top || lr.bottom > ar.bottom) {
    area.scrollTop += (lr.top + lr.height / 2) - (ar.top + ar.height / 2);
  }
}

function isMobile() { return window.innerWidth <= MOBILE_MAX; }

/** SPA 换页后：手机关抽屉 → 重算并按需水合新路径 → （重开时）滚到高亮。 */
function onNavigate() {
  if (isMobile()) {
    var d = document.querySelector(".m3-drawer");
    var b = document.querySelector(".drawer-backdrop");
    if (d && d.classList.contains("open")) {
      d.classList.remove("open");
      if (b) b.classList.remove("open");
    }
  }
  var nav = window.__navStructure;
  var finish = function (hit) {
    if (isMobile() && hit) scrollIntoView(hit);
  };
  var cached = nav?.readNavJson ? nav.readNavJson() : null;
  if (cached && cached.nodes) {
    finish(applyJson(cached));
  } else if (nav?.loadNavJson) {
    nav.loadNavJson().then(function (data) { finish(applyJson(data)); });
  }
}

/** 手动刷新：重算 + 滚动（无论端）。 */
function sync() {
  var nav = window.__navStructure;
  var cached = nav?.readNavJson ? nav.readNavJson() : null;
  if (cached && cached.nodes) {
    scrollIntoView(applyJson(cached));
  } else if (nav?.loadNavJson) {
    nav.loadNavJson().then(function (data) { scrollIntoView(applyJson(data)); });
  }
}

window.__drawerSync = { onNavigate: onNavigate, sync: sync };

// 首屏仅当 nav JSON 已同步可用（内嵌块或测试）时自调；正常访问已由构建期按当前页直出 active/expanded，不触发额外网络请求。
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    try { recompute(); } catch (e) { /* 不动 */ }
  });
} else {
  try { recompute(); } catch (e) { /* 不动 */ }
}
})();