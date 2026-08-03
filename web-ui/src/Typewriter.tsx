// 多语言打字机：typed.js 现成轮子（~5KB gzip）
// 循环：打字 → 保持 → 删除 → 下一条，14 种语言「关注 tayori 谢谢喵」
// 粉碎效果：anime.js 现成轮子（split-text 粉碎标准做法）——
// 卡片墙展开时文字字符化炸散（stagger 随机飞散），收回时弹性聚合飞回
import { useEffect, useRef } from "preact/hooks";
import Typed from "typed.js";
import anime from "animejs";

const MESSAGES = [
  "关注tayori谢谢喵",
  "Follow tayori, thanks meow~",
  "tayoriをフォローしてね",
  "tayori를 팔로우해줘 냐옹",
  "Suis tayori, merci miaou",
  "Folge tayori, danke miau",
  "Sigue a tayori, gracias miau",
  "Segui tayori, grazie miao",
  "Siga tayori, obrigado miau",
  "Подпишись на tayori, спасибо мяу",
  "تابع tayori، شكرًا مياو",
  "tayori'yi takip et, teşekkürler miyav",
  "Đăng ký tayori nhé, cảm ơn meo",
  "ติดตาม tayori ขอบคุณเหมียว",
];

function newTyped(el: HTMLElement): Typed {
  return new Typed(el, {
    strings: MESSAGES,
    typeSpeed: 80,
    backSpeed: 40,
    backDelay: 1800,
    loop: true,
    cursorChar: "", // 光标已隐藏（站主钦点）
    smartBackspace: false,
  });
}

export default function Typewriter({ scatter }: { scatter: boolean }) {
  const elRef = useRef<HTMLSpanElement>(null);
  const typedRef = useRef<Typed | null>(null);
  const scattered = useRef(false);

  useEffect(() => {
    if (!elRef.current) return;
    typedRef.current = newTyped(elRef.current);
    return () => typedRef.current?.destroy();
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    if (scatter && !scattered.current) {
      scattered.current = true;
      typedRef.current?.stop();
      // 粉碎用 typed.js 的完整当前字符串（strings[arrayPos]）——
      // 曾用 el.textContent（打字机瞬时内容，删除中/打字中经常取到空/半句 → 粉碎概率失败）
      const td = typedRef.current;
      const full = td ? td.strings[td.arrayPos] ?? "" : el.textContent ?? "";
      const chars = [...full];
      el.innerHTML = "";
      for (const ch of chars) {
        const s = document.createElement("span");
        s.className = "scatter-char";
        s.textContent = ch;
        el.appendChild(s);
      }
      // anime.js：stagger 随机炸散（碎片各自飞向随机方向，加速飞出）
      anime({
        targets: el.querySelectorAll(".scatter-char"),
        translateX: () => anime.random(-90, 90),
        translateY: () => anime.random(-60, 10), // 偏上飞散
        rotate: () => anime.random(-40, 40),
        opacity: 0,
        duration: 600,
        delay: anime.stagger(12), // 逐字错开 = 粉碎的层次感
        easing: "easeOutExpo",
      });
    } else if (!scatter && scattered.current) {
      scattered.current = false;
      // anime.js：弹性聚合（碎片飞回原位，overshoot 弹一下 = M3 的灵动）
      anime({
        targets: el.querySelectorAll(".scatter-char"),
        translateX: 0,
        translateY: 0,
        rotate: 0,
        opacity: 1,
        duration: 700,
        delay: anime.stagger(10),
        easing: "easeOutElastic(1, .6)",
        complete: () => {
          // 聚合完成 → 重建 typed.js（从头重新打字）
          typedRef.current?.destroy();
          if (elRef.current) typedRef.current = newTyped(elRef.current);
        },
      });
    }
  }, [scatter]);

  return <span class="typewriter-box" ref={elRef} />;
}
