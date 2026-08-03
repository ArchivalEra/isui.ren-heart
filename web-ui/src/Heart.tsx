// /heart — 博客主页：tayori 视觉（灰阶白 + 三球队列动画 + 唯一黑色 logo + typed.js 打字机）
import { useEffect, useRef, useState } from "preact/hooks";
import Typed from "typed.js";
import BallsCanvas from "./BallsCanvas";
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

/** emoji 打字切换（typed.js，与上方打字机同款）：逐字符打出 → 保持 → 删除 → 下一个；
 *  光标隐藏；卡片墙展开时与文字同步淡出/淡入（stop/start 保留进度） */
function EmojiTyper({ scatter }: { scatter: boolean }) {
  const elRef = useRef<HTMLSpanElement>(null);
  const typedRef = useRef<Typed | null>(null);
  const timer = useRef(0);

  useEffect(() => {
    if (!elRef.current) return;
    typedRef.current = new Typed(elRef.current, {
      strings: EMOJI,
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 1500,
      loop: true,
      cursorChar: "",
      smartBackspace: false,
    });
    return () => {
      window.clearTimeout(timer.current);
      typedRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    window.clearTimeout(timer.current);
    if (scatter) {
      typedRef.current?.stop();
      el.classList.add("tw-faded");
    } else {
      el.classList.remove("tw-faded");
      timer.current = window.setTimeout(() => typedRef.current?.start(), 550);
    }
  }, [scatter]);

  return <span class="heart-emoji" ref={elRef} aria-hidden="true"></span>;
}

export default function Heart() {
  const [wallOpen, setWallOpen] = useState(false);
  return (
    <div class="heart-page fade-stagger">
      <div class="heart-bg" aria-hidden="true"></div>
      <BallsCanvas />
      <div class="heart-logo" aria-hidden="true">
        <img class="heart-logo-img" src="logo.png" alt="tayori" />
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
