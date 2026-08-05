// 调试中心（用户钦定：窗口与小球位置调整分开——双模式 + 独立复制）
// - 窗口模式：拖 .stage-window 的 translate + L 放大 / M 缩小 → 复制
//   `window: translate(Xpx, Ypx) scale(S)`（元素 left:50% top:50% 居中定位——
//   translate 是相对中心点的偏移，初始 0px 0px；.stage-window 不存在时 fallback .heart-logo）
// - 小球模式：鼠标分别拖动三个灰色锚点标记到理想位置 → 复制 ANCHORS
// 调试改动是运行时 inline —— 刷新即恢复（参数复制给站主写死）
import { useEffect, useState } from "preact/hooks";
import {
  set_anchor_overlay,
  get_anchors,
  anchor_screens,
  screen_to_world,
  set_anchor,
} from "./wasm/isui_ren_heart.js";

type Mode = "window" | "balls";

// 解析元素当前 transform → { x, y, s }（px 平移 + 缩放；兼容 matrix / 函数列表）
function readWinTransform(el: HTMLElement): { x: number; y: number; s: number } {
  const raw = (el.style.transform || getComputedStyle(el).transform || "none").trim();
  if (!raw || raw === "none") return { x: 0, y: 0, s: 1 };
  const m = raw.match(/^matrix\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(",").map((v) => parseFloat(v));
    return { x: p[4] || 0, y: p[5] || 0, s: Math.hypot(p[0], p[1]) || 1 };
  }
  let x = 0;
  let y = 0;
  let s = 1;
  for (const f of raw.matchAll(/([a-z]+)\(([^)]*)\)/g)) {
    const args = f[2].split(",").map((a) => a.trim());
    const v0 = parseFloat(args[0]) || 0;
    const v1 = parseFloat(args[1]) || 0;
    if (f[1] === "translate") {
      x += v0;
      y += v1;
    } else if (f[1] === "translateX") {
      x += v0;
    } else if (f[1] === "translateY") {
      y += v0;
    } else if (f[1] === "scale") {
      s *= v0 || 1;
    }
  }
  return { x, y, s };
}

export default function LogoDebug() {
  const [mode, setMode] = useState<Mode | null>(null); // null = 未调试
  const [winTrans, setWinTrans] = useState("translate(0px, 0px)");
  const [winScale, setWinScale] = useState("scale(1.00)");
  const [ballText, setBallText] = useState("");
  const [copied, setCopied] = useState(false);

  // ── 窗口模式：拖 .stage-window 的 translate + L/M 缩放（与 translate 合并写 transform）──
  useEffect(() => {
    if (mode !== "window") return;
    // 契约：目标 .stage-window；不存在（过渡期）则 fallback .heart-logo
    const el =
      document.querySelector<HTMLElement>(".stage-window") ??
      document.querySelector<HTMLElement>(".heart-logo");
    if (!el) return;
    el.classList.add("debug-grab");
    set_anchor_overlay(true); // 涂层：灰色锚点标记（调试时显示）

    const st = readWinTransform(el);
    const apply = () => {
      el.style.transform = `translate(${st.x.toFixed(0)}px, ${st.y.toFixed(0)}px) scale(${st.s.toFixed(2)})`;
      setWinTrans(`translate(${st.x.toFixed(0)}px, ${st.y.toFixed(0)}px)`);
      setWinScale(`scale(${st.s.toFixed(2)})`);
    };
    apply();

    let dragging = false;
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      ox = st.x;
      oy = st.y;
      el.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      st.x = ox + (e.clientX - sx);
      st.y = oy + (e.clientY - sy);
      apply();
    };
    const onUp = () => {
      dragging = false;
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "l") {
        st.s = Math.min(2.0, Math.max(0.3, st.s + 0.05)); // L 放大
        apply();
      } else if (k === "m") {
        st.s = Math.min(2.0, Math.max(0.3, st.s - 0.05)); // M 缩小
        apply();
      }
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      set_anchor_overlay(false);
      el.classList.remove("debug-grab");
      el.removeEventListener("pointerdown", onDown);
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
        refreshText();
      });
    }
    const refreshText = () => {
      const a = get_anchors();
      const sc = anchor_screens(cw, ch);
      if (a.length === 6 && sc.length === 6) {
        setBallText(
          `ANCHORS: [\n  (${a[0].toFixed(3)}, ${a[1].toFixed(3)}) [${sc[0].toFixed(0)}, ${sc[1].toFixed(0)}],\n  (${a[2].toFixed(3)}, ${a[3].toFixed(3)}) [${sc[2].toFixed(0)}, ${sc[3].toFixed(0)}],\n  (${a[4].toFixed(3)}, ${a[5].toFixed(3)}) [${sc[4].toFixed(0)}, ${sc[5].toFixed(0)}],\n]`,
        );
      }
    };
    refreshText();
    return () => {
      marks.forEach((m) => m.remove());
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
      <button
        class="logo-debug-btn"
        onClick={() => setMode("window")}
        title="调试窗口 / 小球位置"
      >
        🔧 调试
      </button>
    );
  }
  const winText = `window: ${winTrans} ${winScale}`;
  return (
    <div class="logo-debug-panel">
      <div class="logo-debug-modes">
        <button
          class={"logo-debug-mode" + (mode === "window" ? " active" : "")}
          onClick={() => setMode("window")}
        >
          调窗口
        </button>
        <button
          class={"logo-debug-mode" + (mode === "balls" ? " active" : "")}
          onClick={() => setMode("balls")}
        >
          调小球
        </button>
      </div>
      {mode === "window" ? (
        <>
          <div class="logo-debug-hint">拖拽移动窗口 · L 放大 / M 缩小</div>
          <div class="logo-debug-params">
            <span>{winTrans}</span>
            <span>{winScale}</span>
          </div>
          <button class="logo-debug-copy" onClick={() => copy(winText)}>
            {copied ? "已复制 ✓" : "复制窗口参数"}
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
