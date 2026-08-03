// 多语言打字机：typed.js 现成轮子（~5KB gzip，唯一 UI 依赖）
// 循环：打字 → 保持 → 删除 → 下一条，14 种语言「关注 tayori 谢谢喵」
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

export default function Typewriter() {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!elRef.current) return;
    const typed = new Typed(elRef.current, {
      strings: MESSAGES,
      typeSpeed: 80, // 打字速度（ms/字）
      backSpeed: 40, // 删除速度
      backDelay: 1800, // 整句保持
      loop: true,
      cursorChar: "▍",
      smartBackspace: false, // 跨语言逐字删除（字符级）
    });
    return () => typed.destroy();
  }, []);

  return <span class="typewriter-box" ref={elRef} />;
}
