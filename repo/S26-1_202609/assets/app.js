// Shirone M3E Reader Interactive Script
(function () {
  const currentTheme = localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", currentTheme === "dark" ? "dark" : "light");

  function syncThemeButtons() {
    const active = document.documentElement.getAttribute("data-theme") || "light";
    document.querySelectorAll("[data-theme-set]").forEach((btn) => {
      const on = btn.getAttribute("data-theme-set") === active;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function setTheme(next) {
    if (next !== "light" && next !== "dark") return;
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    syncThemeButtons();
    if (typeof updateAllImageContrast === "function") updateAllImageContrast();
  }

  syncThemeButtons();
  document.querySelectorAll("[data-theme-set]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setTheme(btn.getAttribute("data-theme-set"));
    });
  });

  const drawerToggleBtn = document.getElementById("drawer-toggle");
  const drawer = document.getElementById("m3-drawer");
  const backdrop = document.getElementById("drawer-backdrop");

  function toggleDrawer() {
    if (window.innerWidth > 860) {
      document.body.classList.toggle("sidebar-collapsed");
      return;
    }
    if (!drawer) return;
    const isOpen = drawer.classList.contains("open");
    drawer.classList.toggle("open", !isOpen);
    if (backdrop) backdrop.classList.toggle("open", !isOpen);
  }

  if (drawerToggleBtn) drawerToggleBtn.addEventListener("click", toggleDrawer);
  if (backdrop) backdrop.addEventListener("click", toggleDrawer);

  // Desktop Brand Collapse Button
  const drawerCollapseBtn = document.getElementById("drawer-collapse-btn");
  if (drawerCollapseBtn) {
    drawerCollapseBtn.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-collapsed");
    });
  }

  // Keyboard shortcut: "[" to toggle sidebar
  window.addEventListener("keydown", (e) => {
    if (e.key === "[" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      toggleDrawer();
    }
  });

  function initSidebarResizer() {
    const resizer = document.getElementById("sidebar-resizer");
    const DEFAULT_SIDEBAR_WIDTH = 320;
    const MIN_SIDEBAR_WIDTH = 240;
    const MAX_SIDEBAR_WIDTH = 580;

    const savedWidth = localStorage.getItem("shirone-sidebar-width");
    if (savedWidth && window.innerWidth > 860) {
      const num = parseInt(savedWidth, 10);
      if (!isNaN(num) && num >= MIN_SIDEBAR_WIDTH && num <= MAX_SIDEBAR_WIDTH) {
        document.documentElement.style.setProperty("--sidebar-width", num + "px");
      }
    }
    if (!resizer) return;
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener("mousedown", (e) => {
      if (window.innerWidth <= 860) return;
      isResizing = true;
      startX = e.clientX;
      startWidth = drawer ? drawer.getBoundingClientRect().width : DEFAULT_SIDEBAR_WIDTH;
      resizer.classList.add("resizing");
      document.body.classList.add("sidebar-resizing");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, Math.round(startWidth + e.clientX - startX)));
      document.documentElement.style.setProperty("--sidebar-width", newWidth + "px");
    });

    window.addEventListener("mouseup", () => {
      if (!isResizing) return;
      isResizing = false;
      resizer.classList.remove("resizing");
      document.body.classList.remove("sidebar-resizing");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (drawer) localStorage.setItem("shirone-sidebar-width", Math.round(drawer.getBoundingClientRect().width));
    });

    resizer.addEventListener("dblclick", () => {
      document.documentElement.style.setProperty("--sidebar-width", DEFAULT_SIDEBAR_WIDTH + "px");
      localStorage.setItem("shirone-sidebar-width", DEFAULT_SIDEBAR_WIDTH);
    });
  }
  initSidebarResizer();

  function initTocResizer() {
    const resizer = document.getElementById("toc-resizer");
    const tocEl = document.querySelector(".m3-toc");
    const DEF = 240, MIN = 180, MAX = 420;
    const saved = localStorage.getItem("shirone-toc-width");
    const num = saved ? parseInt(saved, 10) : NaN;
    if (window.innerWidth > 860 && num >= MIN && num <= MAX) {
      document.documentElement.style.setProperty("--toc-width", num + "px");
    }
    if (!resizer || !tocEl) return;
    let active = false, startX = 0, startW = 0;
    resizer.addEventListener("mousedown", (e) => {
      if (window.innerWidth <= 860) return;
      active = true;
      startX = e.clientX;
      startW = tocEl.getBoundingClientRect().width;
      resizer.classList.add("resizing");
      document.body.classList.add("sidebar-resizing");
      e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!active) return;
      const w = Math.max(MIN, Math.min(MAX, Math.round(startW + startX - e.clientX)));
      document.documentElement.style.setProperty("--toc-width", w + "px");
    });
    window.addEventListener("mouseup", () => {
      if (!active) return;
      active = false;
      resizer.classList.remove("resizing");
      document.body.classList.remove("sidebar-resizing");
      localStorage.setItem("shirone-toc-width", Math.round(tocEl.getBoundingClientRect().width));
    });
    resizer.addEventListener("dblclick", () => {
      document.documentElement.style.setProperty("--toc-width", DEF + "px");
      localStorage.setItem("shirone-toc-width", DEF);
    });
  }
  initTocResizer();

  function initNavGroups() {
    const toggleAllBtn = document.getElementById("toggle-all-groups-btn");
    const toggleAllText = document.getElementById("toggle-all-text");
    const getNavGroups = () => document.querySelectorAll(".drawer-nav-group");

    function updateToggleAllButtonState() {
      if (!toggleAllBtn || !toggleAllText) return;
      const hasExpanded = Array.from(getNavGroups()).some(g => g.classList.contains("expanded"));
      toggleAllText.textContent = hasExpanded ? "全部收起" : "全部展开";
    }

    function toggleGroup(group) {
      if (!group) return;
      if (group.classList.contains("expanded")) {
        group.classList.remove("expanded");
        group.classList.add("collapsed");
        updateToggleAllButtonState();
        return;
      }
      const finishExpand = () => {
        group.classList.remove("collapsed");
        group.classList.add("expanded");
        updateToggleAllButtonState();
      };
      if (group.hasAttribute("data-nav-lazy") && window.__navStructure?.ensureHydrated) {
        window.__navStructure.ensureHydrated(group).then(finishExpand);
      } else finishExpand();
    }

    if (drawer) {
      drawer.addEventListener("click", (e) => {
        const btn = e.target?.closest(".nav-collapse-btn") || null;
        if (btn) { e.stopPropagation(); toggleGroup(btn.closest(".drawer-nav-group")); return; }
        const header = e.target?.closest(".nav-group-header.nav-header-clickable") || null;
        if (header) { e.stopPropagation(); toggleGroup(header.closest(".drawer-nav-group")); }
      });
    }

    if (toggleAllBtn) {
      toggleAllBtn.addEventListener("click", () => {
        const groups = Array.from(getNavGroups());
        if (groups.some(g => g.classList.contains("expanded"))) {
          groups.forEach(g => { g.classList.remove("expanded"); g.classList.add("collapsed"); });
          updateToggleAllButtonState();
          return;
        }
        const applyExpandAll = () => {
          getNavGroups().forEach(g => { g.classList.remove("collapsed"); g.classList.add("expanded"); });
          updateToggleAllButtonState();
        };
        if (document.querySelector("li[data-nav-lazy='1']") && window.__navStructure?.hydrateAll) {
          window.__navStructure.hydrateAll().then(applyExpandAll);
        } else applyExpandAll();
      });
    }
  }
  initNavGroups();

  // Copy Code —— **事件委托**（2026-10-31 修 issue #17）。
  //
  // 旧实现是启动时 `querySelectorAll(".copy-btn").forEach(绑定)`：只在首屏那一次
  // 生效，而 copy-btn 在 `.article-content` **内**——SPA 换页换掉正文 DOM 之后，
  // 新页的按钮没有监听器，点了没反应（首屏直达正常，站内跳转后失效）。
  // 委托到 document 上就没有「换页要重绑」这回事，与 spa-router 的点击委托同一套手法。
  //
  // ⚠️ 用 closest 而不是 e.target.classList：按钮里可能有子节点，
  // 点到的可能是子节点而不是按钮本身。
  document.addEventListener("click", async (e) => {
    const btn = e.target?.closest(".copy-btn") || null;
    if (!btn) return;
    const wrap = btn.closest(".code-fence-wrapper");
    const codeBlock = wrap?.querySelector("code");
    if (!codeBlock) return;
    try {
      await navigator.clipboard.writeText(codeBlock.innerText);
      const originalText = btn.textContent;
      btn.textContent = "已复制";
      btn.style.color = "var(--md-sys-color-primary)";
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.color = "";
      }, 1800);
    } catch (err) {
      console.error("复制失败", err);
    }
  });

  function initPalette() {
    const DEFAULT_HUE = 248;
    const paletteToggleBtn = document.getElementById("palette-toggle");
    const palettePopover = document.getElementById("palette-popover");
    const hueSlider = document.getElementById("hue-slider");
    const hueBadge = document.getElementById("palette-hue-badge");
    const swatchButtons = document.querySelectorAll(".palette-swatch-item");

    function applyHue(hue, save = true) {
      const val = parseInt(hue, 10);
      document.documentElement.style.setProperty("--hue", val);
      document.documentElement.style.setProperty("--primary-h", val);
      if (hueBadge) hueBadge.textContent = `Hue ${val}°`;
      if (hueSlider) hueSlider.value = val;
      swatchButtons.forEach(btn => {
        btn.classList.toggle("active", parseInt(btn.getAttribute("data-hue"), 10) === val);
      });
      if (save) localStorage.setItem("theme-hue", val);
    }

    const savedHue = localStorage.getItem("theme-hue");
    applyHue(savedHue !== null ? savedHue : DEFAULT_HUE, false);

    const setExpanded = (open) => {
      if (paletteToggleBtn) paletteToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    if (paletteToggleBtn && palettePopover) {
      const closeSearchIfOpen = () => {
        const sp = document.getElementById("search-panel");
        const sb = document.getElementById("search-toggle");
        if (sp && !sp.hidden) sp.hidden = true;
        document.body.classList.remove("search-open");
        if (sb) sb.setAttribute("aria-expanded", "false");
      };
      paletteToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = !palettePopover.classList.contains("open");
        if (willOpen) closeSearchIfOpen();
        palettePopover.classList.toggle("open", willOpen);
        setExpanded(willOpen);
      });
      palettePopover.addEventListener("click", (e) => e.stopPropagation());
    }
    return { applyHue, hueSlider, DEFAULT_HUE, swatchButtons, setExpanded };
  }
  const fontSlider = document.getElementById("font-size-slider");
  const fontSizeValue = document.getElementById("font-size-value");
  const fontSample = document.getElementById("font-sample");
  const resetBtn = document.getElementById("palette-reset-btn");
  const { applyHue, hueSlider, DEFAULT_HUE, swatchButtons, setExpanded } = initPalette();
  const paletteToggleBtn = document.getElementById("palette-toggle");
  const palettePopover = document.getElementById("palette-popover");
  function initPaletteEvents() {
    if (paletteToggleBtn && palettePopover) {
      document.addEventListener("click", () => {
        palettePopover.classList.remove("open");
        setExpanded(false);
      });
    }
    if (hueSlider) {
      hueSlider.addEventListener("input", (e) => applyHue(e.target.value, true));
    }
    swatchButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const hue = btn.getAttribute("data-hue");
        if (hue) applyHue(hue, true);
      });
    });
    const randomBtn = document.getElementById("palette-random-btn");
    if (randomBtn) {
      randomBtn.addEventListener("click", () => {
        applyHue(Math.floor(Math.random() * 360), true);
      });
    }
  }
  initPaletteEvents();

  const FONT_KEY = "site-font-size";
  const FONT_DEFAULT = 16;

  function initFontSize() {
    const FONT_MIN = 14;
    const FONT_MAX = 25;
    const syncFontSizeUi = (n) => {
      const pct = ((n - FONT_MIN) / (FONT_MAX - FONT_MIN)) * 100;
      if (fontSizeValue) fontSizeValue.textContent = n + "px";
      if (fontSlider) {
        fontSlider.value = n;
        fontSlider.style.setProperty("--font-pct", pct.toFixed(1) + "%");
      }
      if (fontSample) fontSample.style.fontSize = n + "px";
    };
    return function applyFontSize(px, save = true) {
      const n = Math.max(FONT_MIN, Math.min(FONT_MAX, parseInt(px, 10) || FONT_DEFAULT));
      document.documentElement.style.fontSize = n + "px";
      document.documentElement.style.setProperty("--base-font-size", n + "px");
      syncFontSizeUi(n);
      if (save) { try { localStorage.setItem(FONT_KEY, String(n)); } catch (_e) { /* 隐私模式 */ } }
      if (typeof scheduleInlineMathOverflow === "function") scheduleInlineMathOverflow();
    };
  }
  const applyFontSize = initFontSize();

  // 窄屏超宽行内公式兜底：仅对单块 .base 仍超出所在行宽的 .katex 挂 .katex-inline-scroll，
  // 使其就地横向可滑，避免被 .layout-container 的 overflow-x: clip 裁断，同时不动正常折行的公式。
  let mathOverflowQueued = false;
  function syncInlineMathOverflow() {
    const art = document.querySelector(".article-content");
    if (!art) return;
    const nodes = Array.from(art.querySelectorAll(".katex")).filter(
      (k) => !k.closest(".katex-scroll-container, thead")
    );
    nodes.forEach((k) => {
      k.classList.remove("katex-inline-scroll");
    });
    const artRight = art.getBoundingClientRect().right;
    const toScroll = [];
    for (const k of nodes) {
      const box = k.closest("td, th, blockquote, li, p, h1, h2, h3, h4") || art;
      const cs = getComputedStyle(box);
      const limitRight = Math.min(artRight, box.getBoundingClientRect().right - (parseFloat(cs.paddingRight) || 0));
      const bases = k.querySelectorAll(".base");
      for (const base of bases) {
        if (base.getBoundingClientRect().right > limitRight + 1) {
          toScroll.push(k);
          break;
        }
      }
    }
    for (const k of toScroll) {
      k.classList.add("katex-inline-scroll");
    }
  }
  function scheduleInlineMathOverflow() {
    if (mathOverflowQueued) return;
    mathOverflowQueued = true;
    requestAnimationFrame(() => {
      mathOverflowQueued = false;
      syncInlineMathOverflow();
    });
  }
  scheduleInlineMathOverflow();
  function initMathOverflow() {
    scheduleInlineMathOverflow();
    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready.then(scheduleInlineMathOverflow);
    }
    window.addEventListener("resize", scheduleInlineMathOverflow);
    document.addEventListener("toggle", scheduleInlineMathOverflow, true);
  }
  initMathOverflow();

  function initFontAndReset() {
    const savedFont = localStorage.getItem(FONT_KEY);
    applyFontSize(savedFont !== null ? savedFont : FONT_DEFAULT, false);
    if (fontSlider) {
      fontSlider.addEventListener("input", (e) => applyFontSize(e.target.value, true));
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        localStorage.removeItem("theme-hue");
        applyHue(DEFAULT_HUE, false);
        try { localStorage.removeItem(FONT_KEY); } catch (_e) { /* 隐私模式 */ }
        applyFontSize(FONT_DEFAULT, false);
      });
    }
  }
  initFontAndReset();

  // Table of Contents ScrollSpy
  // SPA 换页钩子（2026-10-17）：tocLinks/headings 换页后要重扫。
  let tocLinks = document.querySelectorAll(".toc-item a");
  let headings = Array.from(document.querySelectorAll(".article-content h2, .article-content h3"))
    .filter((h) => h.id);
  // 透明底黑线配图自动对比度检测与反色呈现
  function parseAlpha(raw) {
    if (raw === undefined) return 1;
    const a = raw.endsWith("%") ? parseFloat(raw) / 100 : parseFloat(raw);
    return Number.isFinite(a) ? a : 1;
  }

  function parseCssColor(str) {
    if (!str || str === "transparent") return null;
    const s = String(str).trim();
    const mRgb = /^rgba?\(\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)(?:\s*[,/]\s*([0-9.]+%?))?\s*\)$/i.exec(s);
    if (mRgb) {
      return { r: Number(mRgb[1]), g: Number(mRgb[2]), b: Number(mRgb[3]), a: parseAlpha(mRgb[4]) };
    }
    const mSrgb = /^color\(\s*srgb\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)$/i.exec(s);
    if (mSrgb) {
      return { r: Number(mSrgb[1]) * 255, g: Number(mSrgb[2]) * 255, b: Number(mSrgb[3]) * 255, a: parseAlpha(mSrgb[4]) };
    }
    return null;
  }

  function relLuminance(r, g, b) {
    const ch = [r, g, b].map((v) => {
      const c = Math.max(0, Math.min(255, v)) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }

  function contrastRatio(l1, l2) {
    const hi = Math.max(l1, l2);
    const lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  function resolveBgRgb(el) {
    const layers = [];
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const parsed = parseCssColor(window.getComputedStyle(cur).backgroundColor);
      if (parsed && parsed.a > 0.01) {
        layers.push(parsed);
        if (parsed.a >= 0.99) break;
      }
      cur = cur.parentElement;
    }
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    let acc = isDark ? { r: 18, g: 17, b: 23 } : { r: 255, g: 255, b: 255 };
    for (let i = layers.length - 1; i >= 0; i--) {
      const top = layers[i];
      const a = Math.max(0, Math.min(1, top.a));
      acc = {
        r: top.r * a + acc.r * (1 - a),
        g: top.g * a + acc.g * (1 - a),
        b: top.b * a + acc.b * (1 - a),
      };
    }
    return acc;
  }

  function summarizeSamples(rgba) {
    let transparentCount = 0;
    let inkWeight = 0;
    let fgLumSum = 0;
    let invLumSum = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const a = rgba[i + 3] / 255;
      if (a < 0.1) { transparentCount++; continue; }
      inkWeight += a;
      fgLumSum += a * relLuminance(rgba[i], rgba[i + 1], rgba[i + 2]);
      invLumSum += a * relLuminance(255 - rgba[i], 255 - rgba[i + 1], 255 - rgba[i + 2]);
    }
    return { transparentCount, inkWeight, fgLumSum, invLumSum };
  }

  function shouldInvertSamples(rgba, bgRgb) {
    if (!rgba || rgba.length < 4 || !bgRgb) return false;
    const { transparentCount, inkWeight, fgLumSum, invLumSum } = summarizeSamples(rgba);
    if (inkWeight === 0 || transparentCount / (rgba.length / 4) < 0.08) return false;
    const bgLum = relLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const curContrast = contrastRatio(fgLumSum / inkWeight, bgLum);
    const invContrast = contrastRatio(invLumSum / inkWeight, bgLum);
    return curContrast < 3.0 && invContrast > curContrast * 1.5;
  }

  let sampleCanvas = null;
  function sampleImageData(img) {
    const w = Math.max(16, Math.min(64, img.naturalWidth));
    const h = Math.max(16, Math.min(64, img.naturalHeight));
    if (!sampleCanvas) sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = w;
    sampleCanvas.height = h;
    const ctx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h).data;
  }

  function evaluateImageContrast(img) {
    if (!img?.complete || !(img.naturalWidth > 0)) return;
    const bgRgb = resolveBgRgb(img);
    try {
      const data = sampleImageData(img);
      if (data) img.classList.toggle("img-auto-invert", shouldInvertSamples(data, bgRgb));
    } catch (_) {
      const isSvg = /\.svg(?:[?#]|$)/i.test(img.getAttribute("src") || "");
      const isDarkBg = relLuminance(bgRgb.r, bgRgb.g, bgRgb.b) < 0.25;
      img.classList.toggle("img-auto-invert", isSvg && isDarkBg);
    }
  }

  function updateAllImageContrast() {
    document.querySelectorAll(".article-content img").forEach((img) => {
      if (!img.dataset.contrastBound) {
        img.dataset.contrastBound = "1";
        img.addEventListener("load", () => evaluateImageContrast(img));
      }
      if (img.complete && img.naturalWidth > 0) evaluateImageContrast(img);
    });
  }

  window.__contrastInvert = {
    parseCssColor: parseCssColor,
    relLuminance: relLuminance,
    contrastRatio: contrastRatio,
    shouldInvertSamples: shouldInvertSamples,
    updateAllImageContrast: updateAllImageContrast,
  };

  function initThemeObservers() {
    if (typeof MutationObserver === "function") {
      new MutationObserver(() => {
        updateAllImageContrast();
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", () => {
          if (!localStorage.getItem("theme")) {
            document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
            syncThemeButtons();
          }
          updateAllImageContrast();
        });
      }
    }
    updateAllImageContrast();
  }
  initThemeObservers();

  let onScroll = null;

  window.__readerRescan = function () {
    tocLinks = document.querySelectorAll(".toc-item a");
    headings = Array.from(document.querySelectorAll(".article-content h2, .article-content h3"))
      .filter((h) => h.id);
    if (typeof onScroll === "function") onScroll();
    scheduleInlineMathOverflow();
    updateAllImageContrast();
  };
  function initTocScrollSpy() {
    if (tocLinks.length === 0) return;
    onScroll = function () {
      const scrollY = window.scrollY || window.pageYOffset;
      let currentHeadingId = "";
      let currentTop = -Infinity;
      for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        const det = h.closest("details");
        if (det && !det.open) continue;
        const top = h.getBoundingClientRect().top + scrollY - 90;
        if (scrollY >= top && top > currentTop) {
          currentTop = top;
          currentHeadingId = h.id;
        }
      }
      tocLinks.forEach((link) => {
        const item = link.closest(".toc-item");
        if (!item) return;
        item.classList.toggle("active", link.getAttribute("href") === "#" + currentHeadingId);
      });
    };
    window.addEventListener("hashchange", onScroll);
    document.addEventListener("toggle", onScroll, true);
    let scrollQueued = false;
    window.addEventListener("scroll", () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
    }, { passive: true });
    onScroll();
  }
  initTocScrollSpy();

  let anchorFlashTimer = null;
  let anchorArriveTimer = null;
  function startAnchorFlash(el) {
    el.classList.remove("anchor-flash");
    void el.offsetWidth;
    el.classList.add("anchor-flash");
    if (anchorFlashTimer) clearTimeout(anchorFlashTimer);
    anchorFlashTimer = setTimeout(() => el.classList.remove("anchor-flash"), 8000);
  }
  function focusAnchorTarget(rawHash) {
    const id = decodeURIComponent(String(rawHash || "").replace(/^#/, ""));
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    if (anchorArriveTimer) clearTimeout(anchorArriveTimer);
    let started = false;
    const trigger = () => {
      if (started) return;
      started = true;
      startAnchorFlash(el);
    };
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    window.addEventListener("scrollend", trigger, { once: true });
    anchorArriveTimer = setTimeout(trigger, 500);
  }
  function initAnchorFocus() {
    window.__focusAnchorTarget = focusAnchorTarget;
    window.addEventListener("hashchange", () => focusAnchorTarget(window.location.hash));
    if (window.location?.hash) {
      const run = () => setTimeout(() => focusAnchorTarget(window.location.hash), 60);
      if (document.readyState === "complete") run();
      else window.addEventListener("load", run, { once: true });
    }
  }
  initAnchorFocus();
})();

;
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
;
// site-root.mjs —— 运行时探测部署根，修正部署在子路径时的相对链接。
//
// ## 为什么需要（2026-10-20 线上实测的 bug）
//
// 站点部署在 https://isui.ren/repo/S26-1_202609/，但托管层（EdgeOne）同时让
// **无前缀**路径 https://isui.ren/课程/电机学/index.html 也返回 200（同一份
// 文件两个 URL）。用户从搜索引擎/历史记录进入无前缀版本时：
//
//   · 页面里所有相对链接（../../../index.html）按**当前 URL** 解析；
//   · 在无前缀路径下，三级 ../ 一路退到域名根；
//   · 域名根是站长**另一个站点**（isui.ren/ 跳 /heart/）——
//     于是「首页」按钮把用户送出了课程站。
//
// ## 探测原理
//
// 每页构建期都埋了 body[data-site-path]（本页的**仓库相对路径**，如
// 课程/电机学/index.html）。把它与 location.pathname 做后缀对齐：
//
//   pathname = /repo/S26-1_202609/课程/电机学/index.html
//   sitePath =                课程/电机学/index.html
//   ⇒ 部署根 = /repo/S26-1_202609/
//
//   pathname = /课程/电机学/index.html（无前缀入口）
//   sitePath = 课程/电机学/index.html
//   ⇒ 实际根 = /——链接的相对解析虽然自洽，但用户此刻在**镜像入口**上：
//     侧栏「首页」(../../../index.html) 会退到域名根，命中站长另一个站。
//
// 所以光探测实际根不够，还要知道**正式根**（构建期由 CANONICAL_BASE 埋进
// <html data-canonical-root>）。实际根 ≠ 正式根时，把站内链接全部规范到
// 正式根——顺带把镜像入口的用户带回主入口，URL 统一后 SW 缓存、历史记录、
// 分享链接也不再分裂成两套。
//
// ## 用法（构建期注入，首次加载最早执行）
//
//   fixSiteRoot();            // 探测 + 重写链接 + 给 <html data-root> 换绝对值
//   siteRoot()                // → "/repo/S26-1_202609/"（恒以 / 开头，恒以 / 结尾）
//
// SPA 换页后 data-site-path 会更新，但部署根不变——探测一次即可。
// 幂等：重复调用无副作用。
//
// ## 可拆卸
//
// 删掉本文件与 build.mjs 注入行即回退。部署在域名根（GitHub Pages 项目页之外
// 的场景）时探测结果为 "/"，全部操作退化为 no-op。

/**
 * 探测部署根。
 * 返回以 / 开头、以 / 结尾的绝对路径；无法探测时返回 null。
 */
function detectSiteRoot() {
  const decodePathname = () => {
    try { return decodeURIComponent(location.pathname); } catch { return location.pathname; }
  };
  const matchDirFallback = (pathname, sp) => {
    const dir = sp.replace(/[^/]*$/, '');
    const di = dir ? pathname.lastIndexOf(dir) : -1;
    return di >= 0 ? ensureSlash(pathname.slice(0, di)) : null;
  };
  const sp = document.body?.getAttribute('data-site-path') || '';
  if (!sp) return null;
  const pathname = decodePathname();
  const idx = pathname.lastIndexOf(sp);
  if (idx >= 0 && idx + sp.length === pathname.length) return ensureSlash(pathname.slice(0, idx));
  if (/^index\.html$/.test(sp)) return ensureSlash(pathname);
  return matchDirFallback(pathname, sp);
}

function ensureSlash(s) {
  if (!s) return '/';
  if (s.charAt(s.length - 1) !== '/') s += '/';
  return s;
}

/** 惰性缓存（部署根在一次加载内不变）。 */
let cached = null;
let detected = false;

/** 部署根（探测不出时回退到 /，即"部署在域名根"的原行为）。 */
function siteRoot() {
  if (!detected) { cached = detectSiteRoot() || '/'; detected = true; }
  return cached;
}

/**
 * 重写页面里的站内链接为「部署根 + 仓库相对路径」。
 *
 * 只动三类**本站**元素（其它一律不碰）：
 *   · <a data-path=…>        侧栏导航项（构建期带仓库相对路径）
 *   · a[href^=相对路径] 内的 .sidebar-brand / .top-bar-mobile-title / 面包屑
 *     —— 这些没有 data-path，用「当前 data-root 相对值 + 本页深度」反推
 *   · <html data-root>        改成绝对根，SPA 与 drawer-sync 后续直接用
 *
 * 为什么不改所有 <a>：正文里的链接可能指外站、锚点、下载——批量改会误伤。
 * 只改构建期知道语义的那些。
 */
function fixSiteRoot() {
  const canonical = document.documentElement.getAttribute('data-canonical-root') || '/';
  const actual = siteRoot();
  // 实际根与正式根一致 → 一切正常，构建期相对链接本来就是对的
  if (actual === canonical) {
    if (canonical === '/') return;  // 部署在域名根，无镜像问题
    // 一致但仍把 data-root 换成绝对值：SPA/drawer-sync 拼路径更稳
    document.documentElement.setAttribute('data-root', canonical);
    rewriteLinks(canonical);
    return;
  }
  // 实际根 ≠ 正式根 = 用户在镜像入口（如无前缀路径）。
  // 规范到正式根：链接全部指向主入口，点击即回到正确路径。
  document.documentElement.setAttribute('data-root', canonical);
  rewriteLinks(canonical);
}

/**
 * 把站内链接重写为「部署根 + 仓库相对路径」。
 * 只动构建期知道语义的三类元素，不碰正文链接（可能指外站/锚点/下载）。
 */
function rewriteLinks(root) {
  const rewriteRelativeNav = (a, actual) => {
    const href = a.getAttribute('href');
    if (!href || /^(https?:|mailto:|#|javascript:)/i.test(href)) return;
    try {
      const abs = new URL(href, location.href);
      if (abs.origin !== location.origin) return;
      let rel = abs.pathname;
      if (actual && actual !== '/' && rel.startsWith(actual)) rel = rel.slice(actual.length);
      a.setAttribute('href', root + rel.replace(/^\/+/, ''));
    } catch (_e) { /* 坏 href 跳过 */ }
  };
  for (const link of document.querySelectorAll('a[data-path]')) {
    const dp = link.getAttribute('data-path');
    if (dp) link.setAttribute('href', root + dp);
  }
  const navs = document.querySelectorAll('.sidebar-brand, .top-bar-mobile-title, .top-bar-breadcrumbs a:not([data-path]), .paging-card:not([data-path])');
  const actual = siteRoot();
  for (const a of navs) rewriteRelativeNav(a, actual);
}

// 全局暴露（写盘为 <script defer>，非 module；构建期、首屏延迟执行与测试都可调用）
if (typeof window !== 'undefined') {
  window.__siteRoot = { detectSiteRoot: detectSiteRoot, siteRoot: siteRoot, fixSiteRoot: fixSiteRoot };
  window.fixSiteRoot = fixSiteRoot;
  window.siteRoot = siteRoot;
  if (typeof document !== 'undefined' && document.body) {
    try { fixSiteRoot(); } catch (_e) { /* 探测失败保持构建期相对路径 */ }
  }
}

;
(function () {
"use strict";
if (typeof window === "undefined" || window.__navStructure) return;
var NAV_JSON_ID = "nav-structure-json";
var PAGES_JSON_ID = "site-pages-json";
var nodeKey = function nodeKey(node, htmlSpace) {
  return htmlSpace ? node.href : node.path;
};
var isActive = function isActive(node, target, htmlSpace) {
  const key = nodeKey(node, htmlSpace);
  return Boolean(key && key === target);
};
var isExpanded = function isExpanded(node, target, htmlSpace) {
  if (!node) return false;
  if (node.depth === 0 && node.label === '课程总览') return true;
  if (isActive(node, target, htmlSpace)) return true;
  if (node.children) return node.children.some((c) => isExpanded(c, target, htmlSpace));
  return false;
};
var collectActive = function collectActive(nodes, target, htmlSpace) {
  const activeIds = [];
  const expandedIds = [];
  (function walk(arr) {
    for (const n of arr || []) {
      if (isActive(n, target, htmlSpace)) activeIds.push(n.id);
      if (isExpanded(n, target, htmlSpace)) expandedIds.push(n.id);
      if (n.children) walk(n.children);
    }
  })(nodes);
  return { activeIds, expandedIds };
};
var navPromise = null;
var pagesPromise = null;

function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function resolveSiteUrl(attrName) {
  var docEl = document.documentElement;
  if (!docEl) return null;
  var rel = docEl.getAttribute(attrName);
  if (!rel) return null;
  var root = docEl.getAttribute("data-root") || "./";
  return new URL(root + rel, location.href).href;
}

function readNavJson() {
  if (window.__siteNavData && Array.isArray(window.__siteNavData.nodes)) {
    return window.__siteNavData;
  }
  try {
    var tag = document.getElementById(NAV_JSON_ID);
    if (!tag) return null;
    var data = JSON.parse(tag.textContent || "");
    if (data && Array.isArray(data.nodes)) {
      window.__siteNavData = data;
      return data;
    }
    return null;
  } catch (e) { return null; }
}

function readPagesJson() {
  if (Array.isArray(window.__sitePagesData)) return window.__sitePagesData;
  try {
    var tag = document.getElementById(PAGES_JSON_ID);
    if (!tag) return null;
    var data = JSON.parse(tag.textContent || "");
    if (Array.isArray(data)) {
      window.__sitePagesData = data;
      return data;
    }
    return null;
  } catch (e) { return null; }
}

function loadNavJson() {
  var sync = readNavJson();
  if (sync) return Promise.resolve(sync);
  if (navPromise) return navPromise;
  var url = resolveSiteUrl("data-nav-path");
  if (!url) return Promise.resolve(null);
  navPromise = fetch(url, { credentials: "same-origin" })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (data && Array.isArray(data.nodes)) {
        window.__siteNavData = data;
        return data;
      }
      navPromise = null;
      return null;
    })
    .catch(function () { navPromise = null; return null; });
  return navPromise;
}

function loadPagesJson() {
  var sync = readPagesJson();
  if (sync) return Promise.resolve(sync);
  if (pagesPromise) return pagesPromise;
  var url = resolveSiteUrl("data-pages-path");
  if (!url) return Promise.resolve(null);
  pagesPromise = fetch(url, { credentials: "same-origin" })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (Array.isArray(data)) {
        window.__sitePagesData = data;
        return data;
      }
      pagesPromise = null;
      return null;
    })
    .catch(function () { pagesPromise = null; return null; });
  return pagesPromise;
}

function findNode(nodes, id) {
  for (var i = 0; i < (nodes || []).length; i++) {
    var n = nodes[i];
    if (n.id === id) return n;
    if (n.children) {
      var hit = findNode(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

function renderListHtml(nodes, target, rootRel, recursive, expandedSet) {
  var out = '<ul class="drawer-nav-list">';
  for (var i = 0; i < (nodes || []).length; i++) {
    var node = nodes[i];
    var hasChildren = !!(node.children && node.children.length > 0);
    var nodeActive = target != null ? isActive(node, target, true) : false;
    var nodeExpanded = expandedSet ? !!expandedSet[node.id] : (target != null ? isExpanded(node, target, true) : false);
    if (hasChildren) {
      var titleHtml = node.indexHref
        ? '<a href="' + escAttr(rootRel + node.indexHref) + '" data-path="' + escAttr(node.indexHref) + '" class="drawer-nav-link"><span>' + node.label + '</span></a>'
        : '<span class="drawer-section-title-text">' + node.label + '</span>';
      var eager = recursive || nodeExpanded;
      var innerHtml = eager ? renderListHtml(node.children, target, rootRel, recursive, expandedSet) : "";
      var lazyAttr = eager ? "" : ' data-nav-lazy="1"';
      out += '<li class="drawer-nav-group ' + (nodeActive ? "active " : "") + (nodeExpanded ? "expanded" : "collapsed") + '" data-node-id="' + escAttr(node.id) + '"' + lazyAttr + '>'
        + '<div class="nav-group-header ' + (node.indexHref ? "" : "nav-header-clickable") + '">'
        + titleHtml
        + '<button class="nav-collapse-btn" aria-label="折叠或展开 ' + escAttr(node.label) + '" title="折叠/展开">'
        + '<svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>'
        + '</button></div>'
        + '<div class="nav-nested-wrapper"><div class="nav-nested">' + innerHtml + '</div></div></li>';
    } else if (node.href) {
      out += '<li class="drawer-nav-item ' + (nodeActive ? "active" : "") + '" data-node-id="' + escAttr(node.id) + '">'
        + '<a href="' + escAttr(rootRel + node.href) + '" data-path="' + escAttr(node.href) + '" class="drawer-nav-link">'
        + '<span>' + node.label + '</span></a></li>';
    } else {
      out += '<li class="drawer-section-title" data-node-id="' + escAttr(node.id) + '">' + node.label + '</li>';
    }
  }
  out += "</ul>";
  return out;
}

function hydrateGroupEl(groupLi, nodes, recursive, expandedSet) {
  if (!groupLi || !nodes) return false;
  if (!groupLi.hasAttribute("data-nav-lazy")) {
    if (recursive) {
      var nestedLazies = groupLi.querySelectorAll("li[data-nav-lazy='1']");
      for (var k = 0; k < nestedLazies.length; k++) {
        hydrateGroupEl(nestedLazies[k], nodes, true, expandedSet);
      }
    }
    return true;
  }
  var id = groupLi.getAttribute("data-node-id");
  var node = findNode(nodes, id);
  var container = groupLi.querySelector(":scope > .nav-nested-wrapper > .nav-nested");
  if (!node || !node.children || !container) {
    groupLi.removeAttribute("data-nav-lazy");
    return false;
  }
  var target = document.body ? (document.body.getAttribute("data-site-path") || "") : "";
  var rootRel = (document.documentElement && document.documentElement.getAttribute("data-root")) || "./";
  container.innerHTML = renderListHtml(node.children, target, rootRel, recursive, expandedSet);
  groupLi.removeAttribute("data-nav-lazy");
  return true;
}

function hydrateIdsSync(nodes, ids) {
  if (!nodes || !ids || !ids.length) return;
  var expSet = {};
  for (var i = 0; i < ids.length; i++) expSet[ids[i]] = 1;
  // 按从外到内顺序水合（数组里祖先先于后代），确保父级渲染出子级 DOM 后再继续向下。
  var progress = true;
  while (progress) {
    progress = false;
    for (var j = 0; j < ids.length; j++) {
      var el = document.querySelector('li[data-node-id="' + ids[j].replace(/"/g, '\"') + '"][data-nav-lazy="1"]');
      if (el && hydrateGroupEl(el, nodes, false, expSet)) progress = true;
    }
  }
}

function ensureHydrated(groupLi) {
  if (!groupLi || !groupLi.hasAttribute("data-nav-lazy")) return Promise.resolve(true);
  return loadNavJson().then(function (data) {
    if (!data || !data.nodes) return false;
    return hydrateGroupEl(groupLi, data.nodes, false, null);
  });
}

function hydrateAll() {
  return loadNavJson().then(function (data) {
    if (!data || !data.nodes) return false;
    var lazies = document.querySelectorAll("li[data-nav-lazy='1']");
    for (var i = 0; i < lazies.length; i++) {
      hydrateGroupEl(lazies[i], data.nodes, true, null);
    }
    return true;
  });
}

window.__navStructure = {
  NAV_JSON_ID: NAV_JSON_ID,
  PAGES_JSON_ID: PAGES_JSON_ID,
  readNavJson: readNavJson,
  readPagesJson: readPagesJson,
  loadNavJson: loadNavJson,
  loadPagesJson: loadPagesJson,
  collectActive: collectActive,
  hydrateIdsSync: hydrateIdsSync,
  ensureHydrated: ensureHydrated,
  hydrateAll: hydrateAll
};
})();
;
(function () {
"use strict";
if (typeof window === "undefined" || window.__drawerSync) return;

var MOBILE_MAX = 860; // 与 shirone-reader.css 的断点一致

/** active/expanded 重算：读 JSON + 按需水合新激活分支 + 对齐 data-node-id。 */
function applyJson(json) {
  var nav = window.__navStructure;
  if (!json || !json.nodes) return undefined; // 无侧栏形状 ⇒ 不动（保留烘焙态）
  var here = document.body.getAttribute("data-site-path") || "";
  // 共享判定（html 空间）——与构建期 activeIds 同一份实现。
  var state = nav.collectActive(json.nodes, here, true);
  if (typeof nav.hydrateIdsSync === "function") {
    nav.hydrateIdsSync(json.nodes, state.expandedIds);
  }
  var activeIds = {}; for (var i = 0; i < state.activeIds.length; i++) activeIds[state.activeIds[i]] = 1;
  var expandedIds = {}; for (var k = 0; k < state.expandedIds.length; k++) expandedIds[state.expandedIds[k]] = 1;

  var lis = document.querySelectorAll("li[data-node-id]");
  var hit = null;
  for (var j = 0; j < lis.length; j++) {
    var li = lis[j];
    var id = li.getAttribute("data-node-id");
    var on = !!activeIds[id];
    var isGroup = li.classList.contains("drawer-nav-group");
    var liActive = on;
    var liExpanded = isGroup && !!expandedIds[id];
    li.classList.toggle("active", liActive);
    if (isGroup) {
      li.classList.toggle("expanded", liExpanded);
      li.classList.toggle("collapsed", !liExpanded);
    }
    if (liActive && !hit) hit = li.querySelector("a.drawer-nav-link");
  }
  return hit;
}

function recompute() {
  var nav = window.__navStructure;
  var json = nav?.readNavJson ? nav.readNavJson() : null;
  if (json && json.nodes) return applyJson(json);
  return undefined;
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

/** SPA 换页后：手机关抽屉 → 重算并按需水合新路径 → （重开时）滚到高亮。 */
function onNavigate() {
  if (isMobile()) {
    var d = document.querySelector(".m3-drawer");
    var b = document.querySelector(".drawer-backdrop");
    if (d && d.classList.contains("open")) {
      d.classList.remove("open");
      if (b) b.classList.remove("open");
    }
  }
  var nav = window.__navStructure;
  var finish = function (hit) {
    if (isMobile() && hit) scrollIntoView(hit);
  };
  var cached = nav?.readNavJson ? nav.readNavJson() : null;
  if (cached && cached.nodes) {
    finish(applyJson(cached));
  } else if (nav?.loadNavJson) {
    nav.loadNavJson().then(function (data) { finish(applyJson(data)); });
  }
}

/** 手动刷新：重算 + 滚动（无论端）。 */
function sync() {
  var nav = window.__navStructure;
  var cached = nav?.readNavJson ? nav.readNavJson() : null;
  if (cached && cached.nodes) {
    scrollIntoView(applyJson(cached));
  } else if (nav?.loadNavJson) {
    nav.loadNavJson().then(function (data) { scrollIntoView(applyJson(data)); });
  }
}

window.__drawerSync = { onNavigate: onNavigate, sync: sync };

// 首屏仅当 nav JSON 已同步可用（内嵌块或测试）时自调；正常访问已由构建期按当前页直出 active/expanded，不触发额外网络请求。
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    try { recompute(); } catch (e) { /* 不动 */ }
  });
} else {
  try { recompute(); } catch (e) { /* 不动 */ }
}
})();
;
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