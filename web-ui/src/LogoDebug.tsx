// 调试中心（用户钦定：logo 与小球位置调整分开——双模式 + 独立复制）
// - logo 模式：拖拽 logo + L 放大 / M 缩小 → 复制 left/top/width
// - 小球模式：鼠标分别拖动三个灰色锚点标记到理想位置 → 复制 ANCHORS
// 调试改动是运行时 inline / wasm 内存——刷新即恢复（参数复制给站主写死）
import { useEffect, useState } from "preact/hooks";
import {
  set_anchor_overlay,
  set_ball_mode,
  get_anchors,
  anchor_screens,
  screen_to_world,
  set_anchor,
} from "./wasm/isui_ren_heart.js";

type Mode = "logo" | "balls";

export default function LogoDebug() {
  const [mode, setMode] = useState<Mode | null>(null); // null = 未调试
  const [logoParams, setLogoParams] = useState({ left: "", top: "", width: "" });
  const [ballText, setBallText] = useState("");
  const [copied, setCopied] = useState(false);

  // ── logo 模式：拖拽 + L/M 缩放 ──
  useEffect(() => {
    if (mode !== "logo") return;
    const logo = document.querySelector<HTMLElement>(".heart-logo");
    const logoImg = document.querySelector<HTMLElement>(".heart-logo-img");
    if (!logo || !logoImg) return;
    logo.classList.add("debug-grab");
    set_anchor_overlay(true); // 涂层：灰色锚点标记

    const cs = getComputedStyle(logo);
    const imgRect = logoImg.getBoundingClientRect();
    // left/top 复制百分比语义：拖过 = style.left（百分比）；未拖 =
    // 计算 px ÷ 容器宽高 → 百分比（站主可直接写回 CSS——曾复制计算 px
    // 依赖窗口尺寸无法换算）
    const parent = logo.parentElement!;
    const pctL =
      logo.style.left ||
      ((parseFloat(cs.left) / parent.clientWidth) * 100).toFixed(2) + "%";
    const pctT =
      logo.style.top ||
      ((parseFloat(cs.top) / parent.clientHeight) * 100).toFixed(2) + "%";
    setLogoParams({
      left: pctL,
      top: pctT,
      width: Math.round(imgRect.width) + "px",
    });

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
      setLogoParams((p) => ({ ...p, left: pctL, top: pctT }));
    };
    const onUp = () => {
      dragging = false;
    };
    const resizeBy = (delta: number) => {
      const cur = logoImg.getBoundingClientRect().width;
      const next = Math.round(Math.max(60, Math.min(1200, cur + delta)));
      logoImg.style.width = next + "px";
      setLogoParams((p) => ({ ...p, width: next + "px" }));
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "l") resizeBy(24);
      else if (k === "m") resizeBy(-24);
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
  }, [mode]);

  // ── 小球模式：三个可拖灰色标记（拖到理想位置 → 复制 ANCHORS）──
  useEffect(() => {
    if (mode !== "balls") return;
    const canvas = document.querySelector<HTMLElement>("#balls-canvas");
    const host = canvas?.parentElement ?? document.body;
    if (!canvas) return;
    set_ball_mode(true);
    set_anchor_overlay(false); // 标记用 DOM div（wasm 涂层关——避免双份）

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const screens = anchor_screens(cw, ch);
    const marks: HTMLElement[] = [];
    const COLORS = ["#e8e8ec", "#d8d8dc", "#c8c8cc"]; // 灰阶（球调试标记）
    for (let s = 0; s < 3; s++) {
      const d = document.createElement("div");
      d.className = "ball-drag-mark";
      d.style.left = (screens[s * 2] ?? 0) + "px";
      d.style.top = (screens[s * 2 + 1] ?? 0) + "px";
      d.style.borderColor = COLORS[s % 3];
      host.appendChild(d);
      marks.push(d);
      let dragging = false;
      let ox = 0;
      let oy = 0;
      d.addEventListener("pointerdown", (e) => {
        dragging = true;
        ox = e.clientX;
        oy = e.clientY;
        d.setPointerCapture?.(e.pointerId);
      });
      d.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const nx = e.clientX;
        const ny = e.clientY;
        const x = parseFloat(d.style.left) + (nx - ox);
        const y = parseFloat(d.style.top) + (ny - oy);
        d.style.left = x + "px";
        d.style.top = y + "px";
        ox = nx;
        oy = ny;
        const w = screen_to_world(x, y, cw, ch);
        if (w.length === 2) set_anchor(s, w[0], w[1]);
      });
      d.addEventListener("pointerup", () => {
        dragging = false;
      });
    }
    const a = get_anchors();
    if (a.length === 6) {
      setBallText(
        `ANCHORS: [\n  (${a[0].toFixed(3)}, ${a[1].toFixed(3)}),\n  (${a[2].toFixed(3)}, ${a[3].toFixed(3)}),\n  (${a[4].toFixed(3)}, ${a[5].toFixed(3)}),\n]`,
      );
    }
    return () => {
      marks.forEach((m) => m.remove());
      set_ball_mode(false);
    };
  }, [mode]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 剪贴板不可用（非 https）——手抄
    }
  };

  if (mode === null) {
    return (
      <button class="logo-debug-btn" onClick={() => setMode("logo")} title="调试 logo / 小球位置">
        🔧 调试
      </button>
    );
  }
  const logoText = `left: ${logoParams.left}\ntop: ${logoParams.top}\nwidth: ${logoParams.width}`;
  return (
    <div class="logo-debug-panel">
      <div class="logo-debug-modes">
        <button
          class={"logo-debug-mode" + (mode === "logo" ? " active" : "")}
          onClick={() => setMode("logo")}
        >
          调 logo
        </button>
        <button
          class={"logo-debug-mode" + (mode === "balls" ? " active" : "")}
          onClick={() => setMode("balls")}
        >
          调小球
        </button>
      </div>
      {mode === "logo" ? (
        <>
          <div class="logo-debug-hint">拖拽移动 · L 放大 / M 缩小</div>
          <div class="logo-debug-params">
            <span>L {logoParams.left}</span>
            <span>T {logoParams.top}</span>
            <span>W {logoParams.width}</span>
          </div>
          <button class="logo-debug-copy" onClick={() => copy(logoText)}>
            {copied ? "已复制 ✓" : "复制 logo 参数"}
          </button>
        </>
      ) : (
        <>
          <div class="logo-debug-hint">拖动灰色标记到理想位置</div>
          <pre class="logo-debug-pre">{ballText}</pre>
          <button
            class="logo-debug-copy"
            onClick={() => copy(`pub const ANCHORS: [(f64, f64); 3] = ${ballText}`)}
          >
            {copied ? "已复制 ✓" : "复制小球参数"}
          </button>
        </>
      )}
      <button class="logo-debug-exit" onClick={() => setMode(null)}>
        退出
      </button>
    </div>
  );
}
