(function () {
"use strict";
if (typeof navigator === "undefined" || typeof document === "undefined") return;

var qs = null;
try { qs = new URLSearchParams(location.search); } catch (e) {}
// 「要不要页面工具」由用户**显式表达**：?relay=1（连中继）或 ?webmcp=1（启用），
// 或 localStorage 里的持久开关。**不看浏览器原生能力**——零 pref 的普通 Firefox
// 两者都没有，而那正是 polyfill 要造出来的东西（按原生判断会漏掉这批用户）。
var wanted = false;
try {
  wanted = (qs && (qs.get("relay") === "1" || qs.get("webmcp") === "1"))
    || localStorage.getItem("webmcp") === "on"
    || localStorage.getItem("webmcp_relay") === "on";
} catch (e) {}

var hasDoc = !!document.modelContext;

function baseDir() {
  var s = document.currentScript;
  if (!s || !s.src) {
    var all = document.querySelectorAll("script[src*='webmcp-loader']");
    s = all[all.length - 1];
  }
  return new URL(".", new URL(s.src, location.href)).href;
}

function inject(rel) {
  var el = document.createElement("script");
  el.src = baseDir() + rel;
  el.async = false;
  document.head.appendChild(el);
  return el;
}

function injectPlugins() {
  inject("webmcp-shim.js");
  inject("webmcp-tools.js");
}

if (hasDoc) {                       // 形态 1：原生已有 document 注册表 → 直接用
  window.__webmcpMode = "native-document";
  injectPlugins();
} else if (wanted) {                // 形态 2：用户要 → 载 polyfill 造出 document 注册表
  window.__webmcpMode = "polyfill+wanted";
  var p = inject("../vendor/webmcp/polyfill.iife.js");
  p.onload = function () { injectPlugins(); };
  p.onerror = function () { window.__webmcpMode = "polyfill-failed"; };
} else {                            // 形态 3：普通读者没要 → 一个字节都不拉
  window.__webmcpMode = "absent";
}
})();