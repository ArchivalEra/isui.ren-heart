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
    var opened = false;
    for (var node = el; node; node = node.parentElement) {
      if (node.tagName === "DETAILS" && !node.open) { node.open = true; opened = true; }
    }
    // 展开改变了布局：原生锚点滚动按「展开前」几何算的落点已经不准，重滚一次。
    // rAF 等一帧，确保 <details> 展开（含 accordion 同组兄弟收起）的布局已完成；
    // 顶栏留白由 CSS 的 scroll-margin-top 提供。面板本就开着时不抢用户的滚动。
    if (opened) {
      requestAnimationFrame(function () {
        try { el.scrollIntoView({ block: "start" }); } catch (e) { el.scrollIntoView(); }
      });
    }
  }

  // SPA 换页钩子：手动触发深链接展开（spa-router 调用；hash 可选）
  window.__disclosureOpen = function (hash) {
    if (hash) { try { location.hash = hash; } catch (e) {} }
    openTarget();
  };
  window.addEventListener("DOMContentLoaded", openTarget);
  window.addEventListener("hashchange", openTarget);
}());