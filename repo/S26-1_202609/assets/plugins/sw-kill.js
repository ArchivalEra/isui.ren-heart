(function () {
"use strict";
try {
  if (localStorage.getItem("sw_killed") === "1") return;
} catch (e) { /* 无 localStorage（隐私模式）——每次都扫，无害 */ }

// 无 ServiceWorker API 的环境（老浏览器/非安全上下文）只剩 caches 可清
var sweep = [];

if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
  sweep.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
    return Promise.all(regs.map(function (r) {
      return r.unregister().catch(function () { /* 单个失败不挡其余 */ });
    }));
  }));
}

if ("caches" in window && window.caches.keys) {
  sweep.push(window.caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      return window.caches.delete(k).catch(function () { /* 同上 */ });
    }));
  }));
}

Promise.all(sweep).then(function () {
  try { localStorage.setItem("sw_killed", "1"); } catch (e) { /* 标记失败就下次再扫 */ }
}).catch(function () { /* 清理失败不打扰页面 */ });
})();