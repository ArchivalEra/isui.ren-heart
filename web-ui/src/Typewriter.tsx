// 多语言打字机：typed.js 现成轮子（~5KB gzip，唯一 UI 依赖）
// 循环：打字 → 保持 → 删除 → 下一条，14 种语言「关注 tayori 谢谢喵」
// scatter 模式（卡片墙展开）：字符粉化分散；收回时粉末聚合回来
import { useEffect, useRef } from "preact/hooks";
import Typed from "typed.js";

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
    cursorChar: "", // 光标已隐藏（与字体不对齐，站主钦点）
    smartBackspace: false,
  });
}

export default function Typewriter({ scatter }: { scatter: boolean }) {
  const elRef = useRef<HTMLSpanElement>(null);
  const typedRef = useRef<Typed | null>(null);
  const scattered = useRef(false);

  // 初始化 typed.js（一次）
  useEffect(() => {
    if (!elRef.current) return;
    typedRef.current = newTyped(elRef.current);
    return () => typedRef.current?.destroy();
  }, []);

  // 粉化分散 / 聚合
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (scatter && !scattered.current) {
      scattered.current = true;
      typedRef.current?.stop();
      // 当前文字按字符拆成 span（每字符随机飞散方向，偏上散开）
      const text = el.textContent ?? "";
      const chars = [...text];
      el.innerHTML = "";
      for (const ch of chars) {
        const s = document.createElement("span");
        s.className = "scatter-char";
        s.textContent = ch;
        const dx = (Math.random() * 2 - 1) * 80;
        const dy = (Math.random() * 2 - 1) * 40 - 25; // 偏上飘散
        const rot = (Math.random() * 2 - 1) * 35;
        s.style.setProperty("--dx", `${dx}px`);
        s.style.setProperty("--dy", `${dy}px`);
        s.style.setProperty("--rot", `${rot}deg`);
        el.appendChild(s);
      }
      // 下一帧触发 transition（否则直接到终态无动画）
      requestAnimationFrame(() => {
        el.querySelectorAll(".scatter-char").forEach((s) => s.classList.add("scattering"));
      });
    } else if (!scatter && scattered.current) {
      scattered.current = false;
      // 粉末聚合：移除散射类 → 字符飞回原位
      el.querySelectorAll(".scatter-char").forEach((s) => s.classList.remove("scattering"));
      // 聚合完成后重建 typed.js（从第一条重新打字）
      setTimeout(() => {
        typedRef.current?.destroy();
        if (elRef.current) typedRef.current = newTyped(elRef.current);
      }, 700);
    }
  }, [scatter]);

  return <span class="typewriter-box" ref={elRef} />;
}
