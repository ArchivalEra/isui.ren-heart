// logo 调试器：拖拽移动 + 滚轮缩放 + 复制参数（人眼校准后把参数给站主 →
// 站主写回 styles.css）。调试改动是运行时 inline style——刷新即恢复。
import { useEffect, useState } from "preact/hooks";
import { set_anchor_overlay } from "./wasm/isui_ren_heart.js";

export default function LogoDebug() {
  const [debug, setDebug] = useState(false);
  const [params, setParams] = useState({ left: "", top: "", width: "" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!debug) return;
    const logo = document.querySelector<HTMLElement>(".heart-logo");
    const logoImg = document.querySelector<HTMLElement>(".heart-logo-img");
    if (!logo || !logoImg) return;
    logo.classList.add("debug-grab");
    set_anchor_overlay(true); // 调试涂层：灰色锚点标记（最上层）

    // 初始参数：left/top = div 计算样式（拖拽）；width = img 渲染像素（缩放——
    // 曾改 div.width——img 有自己的 width 规则不跟随——SVG 纹丝不动）
    const cs = getComputedStyle(logo);
    const rect = logo.getBoundingClientRect();
    const imgRect = logoImg.getBoundingClientRect();
    setParams({
      left: cs.left,
      top: cs.top,
      width: Math.round(imgRect.width) + "px",
    });

    // ── 拖拽（pointer capture——跟手）──
    let dragging = false;
    let sx = 0;
    let sy = 0;
    let ol = 0;
    let ot = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      const r = logo.getBoundingClientRect();
      ol = r.left;
      ot = r.top;
      logo.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const parent = logo.parentElement!;
      const pw = parent.clientWidth;
      const ph = parent.clientHeight;
      const pctL = (((ol + (e.clientX - sx)) / pw) * 100).toFixed(2) + "%";
      const pctT = (((ot + (e.clientY - sy)) / ph) * 100).toFixed(2) + "%";
      logo.style.left = pctL;
      logo.style.top = pctT;
      setParams((p) => ({ ...p, left: pctL, top: pctT }));
    };
    const onUp = () => {
      dragging = false;
    };

    // ── 缩放（L 放大 / M 缩小——用户钦定）──
    // 改 .heart-logo-img（SVG）宽度——div 宽度 auto 跟随内容 → engine 采样
    // rect 变化 → 球锚点缩放同步（曾改 div.width——img 独立规则不跟随）
    const resizeBy = (delta: number) => {
      const cur = logoImg.getBoundingClientRect().width;
      const next = Math.round(Math.max(60, Math.min(1200, cur + delta)));
      logoImg.style.width = next + "px";
      setParams((p) => ({ ...p, width: next + "px" }));
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "l") {
        resizeBy(24); // 放大
      } else if (k === "m") {
        resizeBy(-24); // 缩小
      }
    };

    logo.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      set_anchor_overlay(false);
      logo.classList.remove("debug-grab");
      logo.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [debug]);

  const copy = async () => {
    const text = `left: ${params.left}\ntop: ${params.top}\nwidth: ${params.width}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 剪贴板不可用（非 https）——用户手抄
    }
  };

  if (!debug) {
    return (
      <button class="logo-debug-btn" onClick={() => setDebug(true)} title="拖拽/缩放 logo 并复制参数">
        🔧 logo
      </button>
    );
  }
  return (
    <div class="logo-debug-panel">
      <div class="logo-debug-hint">拖拽移动 · L 放大 / M 缩小</div>
      <div class="logo-debug-params" title="当前参数（拖拽移动 / L/M 缩放）">
        <span>L {params.left}</span>
        <span>T {params.top}</span>
        <span>W {params.width}</span>
      </div>
      <button class="logo-debug-copy" onClick={copy}>
        {copied ? "已复制 ✓" : "复制参数"}
      </button>
      <button
        class="logo-debug-exit"
        onClick={() => {
          setDebug(false);
        }}
      >
        退出
      </button>
    </div>
  );
}
