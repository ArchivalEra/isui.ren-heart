(function () {
"use strict";
if (typeof window === "undefined" || window.__drawerSync) return;

var MOBILE_MAX = 860; // 与 shirone-reader.css 的断点一致

/** active 重算 + 返回 active 链接（无匹配返回 null；旧侧栏返回 undefined=没动）。 */
function recompute() {
  var links = document.querySelectorAll(".m3-drawer a.drawer-nav-link[href]");
  if (!links.length) return null;
  // 「无证据时不动」：任一链接缺 data-path ⇒ 旧缓存页，保留烘焙态（防强调栏被清空）
  for (var i = 0; i < links.length; i++) {
    if (!links[i].getAttribute("data-path")) return undefined;
  }
  var here = decodeURIComponent(location.pathname);
  var hit = null;
  links.forEach(function (a) {
    var isOn = "/" + decodeURIComponent(a.getAttribute("data-path")) === here;
    a.classList.toggle("active", isOn);
    var li = a.closest("li");
    if (li) li.classList.toggle("active", isOn);
    if (isOn) hit = a;
  });
  if (hit) {
    for (var g = hit.closest("li") || hit; g; g = g.parentElement) {
      if (g.classList && g.classList.contains("drawer-nav-group")) g.classList.add("expanded");
    }
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
})();