// /heart — 博客主页：tayori 视觉（灰阶白 + 三球队列动画 + 唯一黑色 logo + typed.js 打字机）
import BallsCanvas from "./BallsCanvas";
import Typewriter from "./Typewriter";
import CardWall from "./CardWall";

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

function useRotatingEmoji() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % EMOJI.length), 2000);
    return () => clearInterval(id);
  }, []);
  return EMOJI[idx];
}

import { useEffect, useState } from "preact/hooks";
import { toggle_trail_style } from "./wasm/isui_ren_heart.js";

export default function Heart() {
  const emoji = useRotatingEmoji();
  const [wallOpen, setWallOpen] = useState(false);
  return (
    <div class="heart-page fade-stagger">
      <div class="heart-bg" aria-hidden="true"></div>
      <BallsCanvas />
      <div class="heart-logo" aria-hidden="true">
        <img class="heart-logo-img" src="logo.png" alt="tayori" />
      </div>
      <main class={`heart-main${wallOpen ? " lifted" : ""}`}>
        <h1 class="heart-title">
          <Typewriter scatter={wallOpen} />
        </h1>
        <p class="heart-sub">
          <span class="heart-emoji" aria-hidden="true">{emoji}</span>
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
