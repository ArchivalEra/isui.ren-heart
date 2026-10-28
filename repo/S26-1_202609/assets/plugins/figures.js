(function () {
  "use strict";
  var SVG_NS = "http://www.w3.org/2000/svg";

  function clearSelection(fig) {
    var i;
    var prev = fig.querySelectorAll(".is-selected");
    for (i = 0; i < prev.length; i++) prev[i].classList.remove("is-selected");
    var hot = fig.querySelectorAll(".is-hot");
    for (i = 0; i < hot.length; i++) hot[i].classList.remove("is-hot");
  }

  /** 把一条网络涉及的线段全点亮（同名 data-net 的所有 path）。 */
  function highlightNet(fig, net) {
    var wires = fig.querySelectorAll('.fig-wire[data-net="' + net.replace(/"/g, '') + '"]');
    for (var i = 0; i < wires.length; i++) wires[i].classList.add("is-hot");
    return wires.length;
  }

  /** 侧栏面板：显示选中物的结构事实（与 <details> 结构表同一份 IR）。 */
  function showPanel(fig, html) {
    var box = fig.querySelector(".fig-inspector");
    if (!box) {
      box = document.createElement("div");
      box.className = "fig-inspector";
      fig.appendChild(box);
    }
    box.innerHTML = html;
    box.hidden = false;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function onFigureClick(e) {
    var fig = e.currentTarget;
    var t = e.target;

    // 符号气泡优先：它自己会处理，别抢
    if (t.closest && t.closest("a.sym-gloss")) return;

    // 点元件
    var comp = t.closest && t.closest(".fig-comp");
    if (comp) {
      clearSelection(fig);
      comp.classList.add("is-selected");
      var ins = (comp.getAttribute("data-ins") || "").split(",").filter(Boolean);
      var outs = (comp.getAttribute("data-outs") || "").split(",").filter(Boolean);
      var op = comp.getAttribute("data-op") || "";
      // 顺带把它的输入网络也点亮：读者一眼看到「这个门吃的是哪几根线」
      for (var i = 0; i < ins.length; i++) highlightNet(fig, ins[i]);
      showPanel(fig,
        "<strong>" + esc(comp.getAttribute("data-comp")) + "</strong> · " +
        esc(op.toUpperCase()) +
        "<br>输入：" + esc(ins.join("、") || "—") +
        "<br>输出：" + esc(outs.join("、") || "—"));
      return;
    }

    // 点连线
    var wire = t.closest && t.closest(".fig-wire");
    if (wire) {
      clearSelection(fig);
      var net = wire.getAttribute("data-net") || "";
      var n = highlightNet(fig, net);
      showPanel(fig,
        "网络 <strong>" + esc(net) + "</strong><br>连到 " + n + " 处端点");
      return;
    }

    // 点空白：取消
    clearSelection(fig);
    var box = fig.querySelector(".fig-inspector");
    if (box) box.hidden = true;
  }

  /** 键盘：元件可聚焦与选中（不能只让鼠标能操作）。 */
  function onFigureKey(e) {
    var fig = e.currentTarget;
    if (e.key !== "Enter" && e.key !== " ") return;
    var comp = e.target.closest && e.target.closest(".fig-comp");
    if (!comp) return;
    e.preventDefault();
    comp.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }

  /** 缩放：滚轮 + 双击复位。只改 viewBox，不重排任何东西。 */
  function zoom(fig, factor) {
    var svg = fig.querySelector("svg");
    if (!svg) return;
    var vb = (svg.getAttribute("viewBox") || "0 0 100 100").split(/\s+/).map(Number);
    if (vb.length !== 4) return;
    var cx = vb[0] + vb[2] / 2;
    var cy = vb[1] + vb[3] / 2;
    var w = vb[2] * factor;
    var h = vb[3] * factor;
    // 视觉上限定范围：放大到 3 倍、缩小到原图 3 倍为止，别缩成一个点
    if (w < 20 || h < 20) return;
    svg.setAttribute("viewBox", [cx - w / 2, cy - h / 2, w, h].join(" "));
  }

  function setupFig(fig) {
    if (fig.__figReady) return;
    fig.__figReady = true;
    fig.addEventListener("click", onFigureClick);
    fig.addEventListener("keydown", onFigureKey);

    var svg = fig.querySelector("svg");
    if (!svg) return;
    // 元件可聚焦：给每个门加 tabindex（SVG 元素也能收焦点）
    var comps = fig.querySelectorAll(".fig-comp");
    for (var i = 0; i < comps.length; i++) {
      comps[i].setAttribute("tabindex", "0");
      comps[i].setAttribute("role", "button");
    }
    // 缩放按钮：滚轮之外给一个显式入口（触屏与键盘用户也有路）
    var bar = document.createElement("div");
    bar.className = "fig-zoom";
    bar.innerHTML =
      '<button type="button" data-zoom="in" aria-label="放大">＋</button>' +
      '<button type="button" data-zoom="out" aria-label="缩小">－</button>' +
      '<button type="button" data-zoom="reset" aria-label="复位">⟲</button>';
    bar.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-zoom]");
      if (!b) return;
      var act = b.getAttribute("data-zoom");
      if (act === "reset") {
        var orig = fig.getAttribute("data-viewbox");
        if (orig) svg.setAttribute("viewBox", orig);
      } else {
        zoom(fig, act === "in" ? 0.8 : 1.25);
      }
    });
    fig.appendChild(bar);
    fig.addEventListener("wheel", function (ev) {
      if (!ev.ctrlKey && !ev.metaKey) return;   // 普通滚动不劫持，避免滚不动页面
      ev.preventDefault();
      zoom(fig, ev.deltaY > 0 ? 1.15 : 0.87);
    }, { passive: false });
    fig.addEventListener("dblclick", function (ev) {
      if (ev.target.closest && ev.target.closest("a.sym-gloss")) return;
      var orig = fig.getAttribute("data-viewbox");
      if (orig) svg.setAttribute("viewBox", orig);
    });
  }

  function boot() {
    var figs = document.querySelectorAll("figure.fig");
    for (var i = 0; i < figs.length; i++) setupFig(figs[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  // SPA 换页后新图要重新接管（与 __glossaryReset 同一个接缝约定）
  window.__figuresReset = boot;
})();