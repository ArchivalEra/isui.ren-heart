// 屏 2 回程提示：小跳动箭头（纯白 + 灰阶——铁律）
// 时序：翻到屏 2 等 5s → 出现（闪一闪 + 跳动）5s → 消失 → 再等 5s → 循环
// 自研 0 依赖——纯 CSS 动画 + setTimeout 周期
import { useEffect, useState } from "preact/hooks";
import type { JSX } from "preact";

export default function ScrollHint({ onGoUp }: { onGoUp: () => void }): JSX.Element {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hideTimer = 0;
    let showTimer = 0;
    const cycle = () => {
      // 先等 5s（隐藏）再出现
      showTimer = window.setTimeout(() => {
        setShow(true);
        hideTimer = window.setTimeout(() => {
          setShow(false);
          cycle(); // 下一周期
        }, 5000);
      }, 5000);
    };
    cycle();
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <button
      type="button"
      class={`scroll-hint${show ? " show" : ""}`}
      onClick={onGoUp}
      aria-label="回到动画"
      tabIndex={show ? 0 : -1}
    >
      <svg class="scroll-hint-arrow" width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
        <polyline
          points="2,10 10,2 18,10"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  );
}
