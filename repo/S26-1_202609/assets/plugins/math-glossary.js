(/* math-glossary: 符号气泡（独立插件模块，构建期内联） */
function () {
  "use strict";
  var dict = null;
  var pop = null;
  var current = null;
  function ensureDict() {
    if (dict !== null) return dict;
    var tag = document.getElementById("sym-glossary-json");
    if (!tag) return null;
    try { dict = JSON.parse(tag.textContent); } catch (e) { dict = null; }
    return dict;
  }
  function close() {
    if (pop) pop.remove();
    pop = null;
    current = null;
  }
  function openFor(link) {
    var d = ensureDict();
    if (!d) return;
    var term = link.getAttribute("data-term");
    var entry = d.terms && d.terms[term];
    if (!entry) return;
    if (current === link) { close(); return; }
    close();
    pop = document.createElement("div");
    pop.className = "sym-gloss-pop";
    var t = document.createElement("strong");
    t.textContent = entry.title;
    pop.appendChild(t);
    var p = document.createElement("p");
    p.textContent = entry.text;
    pop.appendChild(p);
    if (entry.href) {
      var a = document.createElement("a");
      a.className = "sym-gloss-pop__more";
      a.href = entry.href + "#" + term;
      a.textContent = "详细 \u2197 符号入门";
      pop.appendChild(a);
    }
    document.body.appendChild(pop);
    var r = link.getBoundingClientRect();
    var width = document.documentElement.clientWidth;
    var left = Math.min(Math.max(8, r.left + window.scrollX), window.scrollX + width - pop.offsetWidth - 8);
    var top = r.bottom + window.scrollY + 8;
    if (r.bottom + pop.offsetHeight + 16 > window.innerHeight + window.scrollY) {
      top = r.top + window.scrollY - pop.offsetHeight - 8;
    }
    pop.style.left = left + "px";
    pop.style.top = top + "px";
    current = link;
  }
  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("a.sym-gloss") : null;
    if (link) { e.preventDefault(); openFor(link); return; }
    if (pop && !pop.contains(e.target)) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
  window.addEventListener("hashchange", close);
}());