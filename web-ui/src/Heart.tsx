// /heart — 博客主页：tayori 视觉（灰阶白 + 三球队列动画 + 唯一黑色 logo + 轻量自研打字机）
import { useEffect, useRef, useState } from "preact/hooks";
import BallsCanvas from "./BallsCanvas";
import LogoDebug from "./LogoDebug";
import Typewriter from "./Typewriter";
import CardWall from "./CardWall";
import { toggle_trail_style } from "./wasm/isui_ren_heart.js";

const EMOJI = [
  "(｡･ω･｡)",
  "ฅ^•ﻌ•^ฅ",
  "(*´∀`)~♥",
  "(๑•̀ㅂ•́)و✧",
  "♪(´▽｀)",
  "(´｡• ᵕ •｡`)",
  "♡(◕‿◕)♡",
  "ﾟ+*:;;:*+ﾟ",
];

/** emoji 打字切换（轻量自研——与上方 Typewriter 同方案：rAF + textContent + 状态机）：
 *  逐字符打出 → 保持 → 删除 → 下一个（8 个 emoji 循环）；无光标；
 *  卡片墙展开时与文字同步淡出/淡入（暂停保留进度） */
const TYPE_MS = 60; // 打字速度（每字，同原 typed.js typeSpeed）
const DELETE_MS = 40; // 删除速度（每字，同原 typed.js backSpeed）
const PAUSE_MS = 1500; // 打完整条保持时长（同原 typed.js backDelay）

type EmojiMode = "typing" | "pausing" | "deleting";

interface EmojiTyperState {
  msg: number;
  chars: number;
  mode: EmojiMode;
  paused: boolean;
}

function EmojiTyper({ scatter }: { scatter: boolean }) {
  const elRef = useRef<HTMLSpanElement>(null);
  const stRef = useRef<EmojiTyperState>({ msg: 0, chars: 0, mode: "typing", paused: false });
  const resumeTimer = useRef<number>(0);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const st = stRef.current;
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      acc += now - last;
      last = now;
      if (st.paused) return; // 卡片墙展开：锁打字（保留进度——rAF 继续跑但不推进）
      const speed = st.mode === "typing" ? TYPE_MS : st.mode === "deleting" ? DELETE_MS : PAUSE_MS;
      if (acc < speed) return;
      acc = 0;
      const full = EMOJI[st.msg];
      if (st.mode === "typing") {
        st.chars += 1;
        el.textContent = full.slice(0, st.chars);
        if (st.chars >= full.length) {
          st.mode = "pausing";
        }
      } else if (st.mode === "pausing") {
        st.mode = "deleting";
      } else {
        st.chars -= 1;
        el.textContent = full.slice(0, st.chars);
        if (st.chars <= 0) {
          st.msg = (st.msg + 1) % EMOJI.length;
          st.mode = "typing";
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    window.clearTimeout(resumeTimer.current);
    if (scatter) {
      // 打开文件夹：锁打字（保留进度）+ 文字淡出
      stRef.current.paused = true;
      el.classList.add("tw-faded");
    } else {
      // 关闭文件夹：文字淡入 + 550ms 后解锁（从原进度继续）
      el.classList.remove("tw-faded");
      resumeTimer.current = window.setTimeout(() => {
        stRef.current.paused = false;
      }, 550);
    }
  }, [scatter]);

  return <span class="heart-emoji" ref={elRef} aria-hidden="true"></span>;
}

export default function Heart() {
  const [wallOpen, setWallOpen] = useState(false);

  // 窗口舞台 fit：scale = min(视口/1280×720 设计尺寸)——窗口整体缩放；
  // translate 初始 = 用户校准 (69px, 66px)——调试器拖拽写 dataset 保留
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".stage-window");
    if (!el) return;
    el.dataset.tx = el.dataset.tx || "69";
    el.dataset.ty = el.dataset.ty || "66";
    const apply = () => {
      const s = Math.min(
        window.innerWidth / 1280,
        window.innerHeight / 720,
      ).toFixed(4);
      el.style.transform = `scale(${s}) translate(${el.dataset.tx}px, ${el.dataset.ty}px)`;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  return (
    <div class="heart-page fade-stagger">
      <div class="heart-bg" aria-hidden="true"></div>
      {/* 窗口舞台：logo + 三球 canvas 固定在同一容器（无边框窗口——设计尺寸 1280×720）——
          容器整体由 JS transform 缩放（fit scale）/ 拖拽；顺序 logo 在下、canvas 在上
          （canvas z-index 更高——球盖 logo）；LogoDebug 调试器拖整个窗口（类名契约） */}
      <div class="stage-window">
        <div class="heart-logo" aria-hidden="true">
          <img class="heart-logo-img" src="logo.svg" alt="tayori" />
        </div>
        <BallsCanvas />
      </div>
      <main class="heart-main">
        <h1 class="heart-title">
          <Typewriter scatter={wallOpen} />
        </h1>
        <p class="heart-sub">
          <EmojiTyper scatter={wallOpen} />
        </p>
        <nav class="heart-nav">
          <CardWall open={wallOpen} onToggle={setWallOpen} />
        </nav>
      </main>
      <TrailToggle />
      <LogoDebug />
    </div>
  );
}

/** 拖尾风格切换（大/小）——调用 wasm 导出 */
function TrailToggle() {
  const [mini, setMini] = useState(false);
  return (
    <button
      class="trail-toggle"
      onClick={() => {
        toggle_trail_style();
        setMini(!mini);
      }}
    >
      {mini ? "拖尾：小" : "拖尾：大"}
    </button>
  );
}
