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

  // SPA 换页钩子：dict 按页烘焙，换页必须清缓存（spa-router 调用）
  window.__glossaryReset = function () { dict = null; close(); };
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
    // 标题与正文一样由构建期渲染：HTML 已转义、$…$ 已出公式（所以两者都用 innerHTML）
    t.innerHTML = entry.title;
    pop.appendChild(t);
    var p = document.createElement("p");
    // 词条文本由构建期处理好：HTML 已转义、$…$ 已渲染成公式（所以这里用 innerHTML），
    // 而文本里若出现 [tex]{#id} 这样的令牌写法，**保持字面**——气泡里不再套气泡。
    p.innerHTML = entry.text;
    pop.appendChild(p);
    // v2 多义项：同一个符号在不同课程/语境下含义不同（$Z$ = 阻抗 or 槽数）。
    // 列出**全部**义项并标出语境——「实时能查到」就是这里：点一个符号看到它的所有含义，
    // 而 entry.ctx 是当前页面所属语境，那一条排在最前并加标记。
    if (entry.senses && entry.senses.length) {
      var ul = document.createElement("ul");
      ul.className = "sym-gloss-pop__senses";
      var list = entry.senses.slice().sort(function (a, b) {
        var ac = a.ctx === entry.ctx ? 0 : 1, bc = b.ctx === entry.ctx ? 0 : 1;
        return ac - bc;
      });
      for (var si = 0; si < list.length; si++) {
        var li = document.createElement("li");
        if (list[si].ctx === entry.ctx) li.className = "is-here";
        var ctx = document.createElement("em");
        ctx.textContent = list[si].ctx + "：";
        li.appendChild(ctx);
        var st = document.createElement("span");
        st.innerHTML = list[si].text;
        li.appendChild(st);
        ul.appendChild(li);
      }
      pop.appendChild(ul);
    }
    if (entry.href) {
      var a = document.createElement("a");
      a.className = "sym-gloss-pop__more";
      // href 是构建期按词条所属课程烘焙好的（可能已含 #锚点，也可能指向别的课程那一页），
      // 只有没带锚点时才补上，否则会拼成 #id#id 这种双锚点。
      a.href = entry.href.indexOf("#") >= 0 ? entry.href : entry.href + "#" + term;
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
  // 公式内命中回退：见 click 处理器里的说明。用 elementsFromPoint 拿该点的完整元素栈，
  // 在其中挑「面积最小」的 [data-term]（越小的盒 = 越具体的目标）。
  // 用 elementsFromPoint 而不是遍历全页符号：只查这一点上的几个元素，与公式规模无关。
  function termAtPoint(x, y) {
    var stack = document.elementsFromPoint
      ? document.elementsFromPoint(x, y)
      : [document.elementFromPoint(x, y)];
    var best = null, bestArea = Infinity, bestDist = Infinity;
    for (var i = 0; i < stack.length; i++) {
      var node = stack[i];
      if (!node || !node.getAttribute) continue;
      var term = node.getAttribute("data-term");
      if (!term) continue;
      var r = node.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      var area = r.width * r.height;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dist = (cx - x) * (cx - x) + (cy - y) * (cy - y);
      // 取最小面积；面积相同时取中心离点击点最近的那个。
      if (area < bestArea - 0.5 || (Math.abs(area - bestArea) <= 0.5 && dist < bestDist)) {
        best = node; bestArea = area; bestDist = dist;
      }
    }
    return best;
  }
  document.addEventListener("click", function (e) {
    var link = e.target.closest
      ? e.target.closest("a.sym-gloss, .ML__latex [data-term], .katex [data-term]")
      : null;
    // 公式内的几何回退（2026-10-12 用户实测「公式框里符号点击范围严重漂移、几乎点不了」）：
    // KaTeX 的透明堆叠结构盒（.vlist 一套，position:relative）会抢走点击让 closest 落空，
    // 相邻/嵌套符号的 inline 盒也会互相覆盖。所以只要点在公式容器里，就按几何重挑一次：
   // 2026-10-29 换引擎后容器类名是 .ML__latex（旧 .katex 保留兼容）。
    // 取「包含该点、面积最小」的 [data-term] 盒——嵌套角标里最小 = 最内层，
    // 重叠邻居里最小 = 更该点的那个；同面积取中心最近。实测把 14 个堆叠公式的
    // 104 个符号从 25 个点不动降到 0。CSS 侧的提层（.katex [data-term] 提 z-index）
    // 是同批的另一半修法，两者互为兜底。
    if (e.target.closest && (e.target.closest(".ML__latex") || e.target.closest(".katex"))) {
      var geo = termAtPoint(e.clientX, e.clientY);
      if (geo) link = geo;
    }
    if (link) { e.preventDefault(); openFor(link); return; }
    if (pop && !pop.contains(e.target)) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
  window.addEventListener("hashchange", close);
}());