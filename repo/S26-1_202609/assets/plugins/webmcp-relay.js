(function () {
"use strict";
if (typeof navigator === "undefined" || typeof document === "undefined") return;
var on = false;
try {
  var qs = new URLSearchParams(location.search);
  on = qs.get("relay") === "1" || localStorage.getItem("webmcp_relay") === "on";
} catch (e) {}
if (!on) return;

var s = document.currentScript;
if (!s || !s.src) {
  var all = document.querySelectorAll("script[src*='webmcp-relay']");
  s = all[all.length - 1];
}
if (!s || !s.src) { window.__webmcpRelay = "no-base"; return; }
var src = new URL("../vendor/webmcp/relay-embed.js", new URL(s.src, location.href)).href;

if (document.readyState === "loading") {
  // 解析期：document.write 让 currentScript 对 embed.js 有效
  document.write('<script src="' + src + '" data-auto-connect="true"><\/script>');
  window.__webmcpRelay = "written";
} else {
  // 解析已结束：只能动态插入；embed 拿不到 currentScript，但它会退化为「不建 widget」。
  // 这种情况下给用户一个明确信号，而不是静默失败。
  var el = document.createElement("script");
  el.src = src;
  el.setAttribute("data-auto-connect", "true");
  el.onerror = function () { window.__webmcpRelay = "failed"; };
  el.onload = function () { window.__webmcpRelay = "loaded-late"; };
  document.head.appendChild(el);
  window.__webmcpRelay = "late";
}
})();