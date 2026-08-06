// /heart — 博客主页：tayori 视觉（灰阶白 + 三球队列动画 + 唯一黑色 logo + 轻量自研打字机）
// 双屏翻页（自研 0 依赖）：.scroll-stage 200vh + transform 平移（Material decelerate）——
// 屏 1 动画窗口舞台（三球 + logo）+ 文件夹按钮；屏 2 卡片区（动画 freeze——翻页完成调 wasm）
import { useEffect, useRef, useState } from "preact/hooks";
import BallsCanvas from "./BallsCanvas";
import CardWall from "./CardWall";
import ScrollHint from "./ScrollHint";
import LogoDebug from "./LogoDebug";
import Typewriter from "./Typewriter";
import * as wasm from "./wasm/isui_ren_heart.js";

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
 *  （卡片墙已移到屏 2 常驻——scatter 固定 false——打字机持续播放） */
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
      if (st.paused) return; // 锁打字（保留进度——rAF 继续跑但不推进）
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
      // 锁打字（保留进度）+ 文字淡出
      stRef.current.paused = true;
      el.classList.add("tw-faded");
    } else {
      // 文字淡入 + 550ms 后解锁（从原进度继续）
      el.classList.remove("tw-faded");
      resumeTimer.current = window.setTimeout(() => {
        stRef.current.paused = false;
      }, 550);
    }
  }, [scatter]);

  return <span class="heart-emoji" ref={elRef} aria-hidden="true"></span>;
}

/* ── 双屏翻页常量 ── */
const TURN_MS = 600; // 翻页动画时长（与 .scroll-stage transition 一致——Material decelerate）
const TOUCH_SLOP = 50; // 触摸翻页阈值（px）
const WHEEL_BACK_SLOP = -20; // 屏 2 顶端向上滚的回翻阈值（deltaY）

/** 动画 freeze（红线圈定：不改 Rust/wasm——只调导出）：
 *  翻页动画完成后暂停/恢复三球。wasm 导出 pause_balls/resume_balls（或 set_paused）
 *  由 web-rust 侧提供——当前编译产物可能尚未导出——守卫调用：导出存在即生效，
 *  缺失时静默跳过（等 wasm 补上导出后自动接线，无需改前端） */
function setBallsPaused(paused: boolean) {
  const m = wasm as unknown as {
    pause_balls?: () => void;
    resume_balls?: () => void;
    set_paused?: (p: boolean) => void;
  };
  if (typeof m.pause_balls === "function" && typeof m.resume_balls === "function") {
    if (paused) m.pause_balls();
    else m.resume_balls();
  } else if (typeof m.set_paused === "function") {
    m.set_paused(paused);
  }
}

export default function Heart() {
  const [page, setPage] = useState(0); // 0 = 屏 1（动画舞台），1 = 屏 2（卡片区）
  const pageRef = useRef(0); // 事件回调读最新页码（监听注册一次，避免闭包 stale）
  const animating = useRef(false); // 翻页 600ms 锁（期间忽略一切输入）
  const turnTimer = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const screen2Ref = useRef<HTMLElement>(null);

  /** 翻页：上锁 → 换页 → 600ms 后解锁（与 CSS transition 同长；transitionend 另负责 freeze） */
  const go = (p: number) => {
    if (animating.current || p === pageRef.current) return;
    animating.current = true;
    pageRef.current = p;
    setPage(p);
    window.clearTimeout(turnTimer.current);
    turnTimer.current = window.setTimeout(() => {
      animating.current = false;
    }, TURN_MS);
  };

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

  // 全局翻页交互：滚轮 / 触摸 / 键盘 + transitionend（动画完成 → wasm freeze）
  useEffect(() => {
    const stage = stageRef.current;
    let touchStartY = 0;

    const onWheel = (e: WheelEvent) => {
      if (animating.current) return;
      if (pageRef.current === 0) {
        // 屏 1：向下滚 → 翻屏 2
        if (e.deltaY > 0) go(1);
      } else {
        // 屏 2：原生滚动优先——只在顶端向上滚才切回屏 1
        const el = screen2Ref.current;
        if (el && el.scrollTop === 0 && e.deltaY < WHEEL_BACK_SLOP) go(0);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.changedTouches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (animating.current) return;
      const dy = (e.changedTouches[0]?.clientY ?? touchStartY) - touchStartY;
      if (pageRef.current === 0) {
        // 屏 1：上滑 → 屏 2
        if (dy < -TOUCH_SLOP) go(1);
      } else {
        // 屏 2：原生滚动优先——只在顶端下滑才切回屏 1
        const el = screen2Ref.current;
        if (dy > TOUCH_SLOP && (!el || el.scrollTop === 0)) go(0);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (animating.current) return;
      if (e.key === "ArrowDown" || e.key === " ") {
        if (pageRef.current === 0) {
          e.preventDefault();
          go(1);
        }
      } else if (e.key === "ArrowUp") {
        if (pageRef.current === 1) {
          e.preventDefault();
          go(0);
        }
      }
    };

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== stage || e.propertyName !== "transform") return;
      // 翻页动画完成 → wasm freeze（球定格当背景）；翻回屏 1 → resume 无缝续播
      setBallsPaused(pageRef.current === 1);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    stage?.addEventListener("transitionend", onTransitionEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      stage?.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(turnTimer.current);
    };
  }, []);

  return (
    <div class="heart-page fade-stagger">
      {/* 双屏舞台：200vh 两屏上下排——transform 平移翻页（transition 由 .scroll-stage 承担） */}
      <div class={`scroll-stage${page === 1 ? " page-2" : ""}`} ref={stageRef}>
        {/* 屏 1：动画窗口舞台（三球 + logo）+ 标题 + 文件夹按钮 */}
        <section class="screen-1">
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
              <Typewriter scatter={false} />
            </h1>
            <p class="heart-sub">
              <EmojiTyper scatter={false} />
            </p>
            <nav class="heart-nav">
              {/* 文件夹按钮：拟物卡片堆（.card-wall-btn 样式扩展）——点击翻到屏 2 */}
              <button
                class="folder-btn"
                aria-label="打开卡片页"
                title="打开卡片页"
                onClick={() => go(1)}
              ></button>
            </nav>
          </main>
        </section>
        {/* 屏 2：卡片区（overflow-y auto——原生滚动） */}
        <section class="screen-2" ref={screen2Ref}>
          {/* 卡片区容器契约（CardWall 组件——另一小弟改——渲染到此容器）：
              - 容器类名：.card-wall.screen2-card-wall——.screen2-card-wall 负责覆盖
                .card-wall 的"下拉折叠"默认值（absolute/scaleY(0)/opacity:0）并切为
                大卡网格（2 列自适应，纯白灰阶）
              - 卡片元素沿用 .wall-card 类名（白底细边框圆角大卡、无阴影）——
                若 CardWall 改用别的类名，需同步 styles.css 的 .screen2-card-wall .wall-card */}
          {page === 1 && <ScrollHint onGoUp={() => go(0)} />}
          <div class="card-wall screen2-card-wall">
            <CardWall />
          </div>
        </section>
      </div>
      {/* 窗口外控件：两屏共用（position: fixed） */}
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
        wasm.toggle_trail_style();
        setMini(!mini);
      }}
    >
      {mini ? "拖尾：小" : "拖尾：大"}
    </button>
  );
}
