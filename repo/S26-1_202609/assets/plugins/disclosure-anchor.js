(/* disclosure-anchor: 深链接到收起面板时自动展开（独立插件模块，构建期内联） */
function () {
  "use strict";
  function openTarget() {
    var raw = window.location.hash.slice(1);
    if (!raw) return;
    var id;
    try { id = decodeURIComponent(raw); } catch (e) { id = raw; }
    var el = document.getElementById(id);
    if (!el) return;
    // 目标面板与它的祖先面板都要展开，否则目标仍然不可见
    for (var node = el; node; node = node.parentElement) {
      if (node.tagName === "DETAILS" && !node.open) node.open = true;
    }
  }
  window.addEventListener("DOMContentLoaded", openTarget);
  window.addEventListener("hashchange", openTarget);
}());