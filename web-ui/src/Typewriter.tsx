// 多语言打字机：typed.js 现成轮子（~5KB gzip）
// 循环：打字 → 保持 → 删除 → 下一条，14 种语言「关注 tayori 谢谢喵」
// 卡片墙交互（站主钦点）：打开 = stop() 锁打字（保留进度）+ 整块淡出；
// 关闭 = 淡入 + start() 解锁——从原进度继续（西班牙语打到哪个字母，淡入回来还在打那个字）。
// 不 destroy、不字符化——typed.js 官方暂停 API 保留内部状态，零进度丢失
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
    cursorChar: "", // 光标已隐藏（站主钦点）
    smartBackspace: false,
  });
}

export default function Typewriter({ scatter }: { scatter: boolean }) {
  const elRef = useRef<HTMLSpanElement>(null);
  const typedRef = useRef<Typed | null>(null);
  const resumeTimer = useRef<number>(0);

  useEffect(() => {
    if (!elRef.current) return;
    typedRef.current = newTyped(elRef.current);
    return () => {
      window.clearTimeout(resumeTimer.current);
      typedRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    window.clearTimeout(resumeTimer.current);
    if (scatter) {
      // 打开文件夹：锁打字（stop 保留进度）+ 文字淡出
      typedRef.current?.stop();
      el.classList.add("tw-faded");
    } else {
      // 关闭文件夹：文字淡入 + 350ms 后解锁（start 从原进度继续打字）
      el.classList.remove("tw-faded");
      resumeTimer.current = window.setTimeout(() => {
        typedRef.current?.start();
      }, 550);
    }
  }, [scatter]);

  return <span class="typewriter-box" ref={elRef} />;
}
