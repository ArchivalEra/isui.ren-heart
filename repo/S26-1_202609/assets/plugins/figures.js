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

  /**
   * 自动贴合：用 getBBox() 量真实内容包围盒（**含文字实际宽度**），
   * 把 viewBox 设成「包围盒 + 四边等距的边距」。
   *
   * 为什么必须由浏览器量：文字宽度取决于实际字体、字距、上下标的组合 tspan，
   * 构建期估不准。2026-10-28 站长指出「这图偏左」，我先按字数估、又加固定槽位，
   * 两次都是人肉调常数——估大右侧空一块、估小裁掉字。排版交给排版引擎。
   *
   * 只在首帧跑一次；缩放/复位都基于这个校正后的 viewBox。
   */
  function fitViewBox(fig) {
    var svg = fig.querySelector("svg");
    if (!svg || typeof svg.getBBox !== "function") return;
    var b;
    try { b = svg.getBBox(); } catch (e) { return; }
    if (!b || !isFinite(b.width) || !isFinite(b.height) || b.width <= 0 || b.height <= 0) return;
    // 四边同一个边距：内容在画布里天然居中，不偏左也不偏右
    var M = Math.max(6, Math.round(Math.min(b.width, b.height) * 0.12));
    var vb = [b.x - M, b.y - M, b.width + M * 2, b.height + M * 2]
      .map(function (n) { return Math.round(n * 100) / 100; }).join(" ");
    svg.setAttribute("viewBox", vb);
    // 记下校正后的 viewBox 供「复位」用（覆盖构建期那个宽松值）
    fig.setAttribute("data-viewbox", vb);
  }

  function setupFig(fig) {
    if (fig.__figReady) return;
    fig.__figReady = true;
    fig.addEventListener("click", onFigureClick);
    fig.addEventListener("keydown", onFigureKey);

    var svg = fig.querySelector("svg");
    if (!svg) return;
    // 首帧贴合：字体加载完再量才准（webfont 晚到会改变文字宽度）
    fitViewBox(fig);
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(function () { fitViewBox(fig); }).catch(function () {});
    }
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
    // 双击复位。**必须排除缩放条与符号锚点**——否则连点两下「＋」会既放大又复位，
    // 读者看到的是「按了没反应」（2026-10-28 站长实测指出）。
    fig.addEventListener("dblclick", function (ev) {
      var t = ev.target;
      if (t.closest && (t.closest("a.sym-gloss") || t.closest(".fig-zoom"))) return;
      var orig = fig.getAttribute("data-viewbox");
      if (orig) svg.setAttribute("viewBox", orig);
    });
  }

  /**
   * 全屏查看（灯箱）。**所有图**都能点开——图元渲染的 SVG 与位图（<img>）都算。
   *
   * 纯前端、零依赖、**不进 MCP**：这是给人用的阅读体验，不是给 AI 的数据通道。
   * AI 读的仍是 <details> 结构表与 figure-index JSON，与这里无关。
   *
   * 打开方式：点图本身；关闭：点背景 / 按 Esc / 再点一次图。
   */
  var lb = null;
  function ensureLightbox() {
    if (lb) return lb;
    lb = document.createElement("div");
    lb.className = "fig-lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "全屏查看");
    lb.innerHTML = '<button type="button" class="fig-lightbox-close" aria-label="关闭">×</button>' +
                   '<div class="fig-lightbox-body"></div>';
    lb.addEventListener("click", function (ev) {
      // 点背景或关闭按钮即关；点图本身不关（允许在灯箱里缩放）
      if (ev.target === lb || (ev.target.closest && ev.target.closest(".fig-lightbox-close"))) closeLightbox();
    });
    document.body.appendChild(lb);
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && lb && lb.classList.contains("is-open")) closeLightbox();
    });
    return lb;
  }

  function openLightbox(sourceEl, label) {
    var box = ensureLightbox();
    var body = box.querySelector(".fig-lightbox-body");
    body.innerHTML = "";
    var clone;
    if (sourceEl.tagName && sourceEl.tagName.toLowerCase() === "img") {
      clone = document.createElement("img");
      clone.src = sourceEl.getAttribute("src");
      clone.alt = sourceEl.getAttribute("alt") || "";
    } else {
      // SVG：整块克隆（含图内符号的锚点，气泡仍可用）
      clone = sourceEl.cloneNode(true);
      clone.removeAttribute("style");
      clone.style.maxWidth = "none";
      clone.style.width = "auto";
      clone.style.height = "auto";
    }
    // ⚠️ SVGElement 的 className 是**只读**的（SVGAnimatedString），
    // 用 clone.className 赋值会抛 TypeError 并中断整个 openLightbox——
    // 表现为「点了完全没反应」（2026-10-28 实测抓到）。SVG 走 setAttribute，
    // HTML 元素两法皆可。
    if (clone.tagName && clone.tagName.toLowerCase() === "svg") {
      clone.setAttribute("class", "fig-lightbox-content");
    } else {
      clone.className = "fig-lightbox-content";
    }
    body.appendChild(clone);
    if (label) {
      var cap = document.createElement("p");
      cap.className = "fig-lightbox-caption";
      cap.textContent = label;
      body.appendChild(cap);
    }
    box.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove("is-open");
    document.documentElement.style.overflow = "";
    var body = lb.querySelector(".fig-lightbox-body");
    if (body) body.innerHTML = "";
  }

  /** 给「所有图」挂全屏入口：figure.fig 里的 svg、正文里的 img。 */
  function setupLightbox() {
    // ① 图元渲染的 SVG
    var figs = document.querySelectorAll("figure.fig");
    for (var i = 0; i < figs.length; i++) {
      if (figs[i].__lbReady) continue;
      var svg = figs[i].querySelector("svg");
      // ⚠️ 标记必须在**成功绑定之后**才设。先前写成「先设 __lbReady 再检查 svg」，
      // 首轮若 SVG 还没进 DOM 就永久跳过——灯箱对这张图永远不生效，
      // 而 __lbReady 已经是 true，后续 boot() 也不会重试（2026-10-28 实测踩到）。
      if (!svg) continue;
      svg.classList.add("fig-zoomable");
      svg.setAttribute("title", "点击全屏查看");
      (function (figEl, svgEl) {
        svgEl.addEventListener("click", function (ev) {
          // 点图内符号时先让气泡处理，不全屏
          if (ev.target.closest && ev.target.closest("a.sym-gloss")) return;
          // 点元件/连线时是「选中」，也不全屏
          if (ev.target.closest && (ev.target.closest(".fig-comp") || ev.target.closest(".fig-wire"))) return;
          var capEl = figEl.querySelector("figcaption");
          openLightbox(svgEl, capEl ? capEl.textContent.trim() : "");
        });
      })(figs[i], svg);
      figs[i].__lbReady = true;   // 绑定成功才标记
    }
    // ② 位图（习题册那 169 张走这条）
    var imgs = document.querySelectorAll(".article-content img");
    for (var j = 0; j < imgs.length; j++) {
      var im = imgs[j];
      if (im.__lbReady) continue;
      im.__lbReady = true;
      im.classList.add("fig-zoomable");
      im.setAttribute("title", "点击全屏查看");
      im.setAttribute("tabindex", "0");
      (function (img) {
        img.addEventListener("click", function () {
          openLightbox(img, img.getAttribute("alt") || "");
        });
        img.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            openLightbox(img, img.getAttribute("alt") || "");
          }
        });
      })(im);
    }
  }

  function boot() {
    var figs = document.querySelectorAll("figure.fig");
    for (var i = 0; i < figs.length; i++) setupFig(figs[i]);
    setupLightbox();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  // SPA 换页后新图要重新接管（与 __glossaryReset 同一个接缝约定）
  window.__figuresReset = boot;
})();