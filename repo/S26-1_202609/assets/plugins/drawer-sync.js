(function () {
"use strict";
if (typeof window === "undefined" || window.__drawerSync) return;

var MOBILE_MAX = 860; // 与 shirone-reader.css 的断点一致

/** active/expanded 重算：读 JSON + 共享判定按当前页重算 id，再对齐到 DOM 的 data-node-id。 */
function recompute() {
  var nav = window.__navStructure;
  var json = nav && nav.readNavJson ? nav.readNavJson() : null;
  if (!json || !json.nodes) return undefined; // 无侧栏形状 ⇒ 不动（保留烘焙态）
  var here = document.body.getAttribute("data-site-path") || "";
  // 共享判定（html 空间）——与构建期 activeIds 同一份实现。
  var state = nav.collectActive(json.nodes, here, true);
  var activeIds = {}; for (var i = 0; i < state.activeIds.length; i++) activeIds[state.activeIds[i]] = 1;
  var expandedIds = {}; for (var k = 0; k < state.expandedIds.length; k++) expandedIds[state.expandedIds[k]] = 1;

  var lis = document.querySelectorAll("li[data-node-id]");
  var hit = null;
  for (var j = 0; j < lis.length; j++) {
    var li = lis[j];
    var id = li.getAttribute("data-node-id");
    var on = !!activeIds[id];
    // ⚠️ 2026-10-21 阶段一：**组节点也能 active**。
    // 旧世界组节点无链接、永远不是当前页，所以这里写死 drawer-nav-item 就够了；
    // 现在组节点带 indexHref（索引页可达），停在索引页时该组必须高亮——
    // 否则「点索引 › 进去，左侧一片没有强调」，正是用户会立刻发现的那种坏。
    var isGroup = li.classList.contains("drawer-nav-group");
    var liActive = on;
    var liExpanded = isGroup && !!expandedIds[id];
    li.classList.toggle("active", liActive);
    if (isGroup) {
      li.classList.toggle("expanded", liExpanded);
      li.classList.toggle("collapsed", !liExpanded);
    }
    // 组标题链接化后（票 B，2026-10-22）组与叶子同用 a.drawer-nav-link，
    // 第一条查询已覆盖全部形态，不再需要第二选择器兜底。
    if (liActive && !hit) hit = li.querySelector("a.drawer-nav-link");
  }
  return hit;
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

/** SPA 换页后：重算 → 手机关抽屉 → （重开时）滚到高亮。 */
function onNavigate() {
  var hit = recompute();
  if (isMobile()) {
    // 点完链接自动合上抽屉——正文直接可见，这是移动端 SPA 的核心交互
    var d = document.querySelector(".m3-drawer");
    var b = document.querySelector(".drawer-backdrop");
    if (d && d.classList.contains("open")) {
      d.classList.remove("open");
      if (b) b.classList.remove("open");
    }
    // 记住高亮位置：用户重开抽屉时滚动到位（shirone 的 toggleDrawer 只开合不滚动）
    if (hit) scrollIntoView(hit);
  }
}

/** 手动刷新：重算 + 滚动（无论端）。 */
function sync() {
  scrollIntoView(recompute());
}

window.__drawerSync = { onNavigate: onNavigate, sync: sync };

// 首屏自调一次（2026-10-21 阶段一补）：active 从「构建期烘焙」改成「运行时按 nav JSON 算」，
// 首屏就没人算了——以前 build.mjs 直接把 active 类写进 HTML，所以不需要这一步。
// 不补的症状：每个页面首屏强调栏全空，只有 SPA 换页后才亮。
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    try { recompute(); } catch (e) { /* 不动 */ }
  });
} else {
  try { recompute(); } catch (e) { /* 不动 */ }
}
})();