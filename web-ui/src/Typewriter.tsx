// 多语言打字机（轻量自研——2026-08-05 重写：typed.js 掉帧根源修复）
// 【为什么弃 typed.js】typed.js 用 setTimeout + innerHTML 更新（每字重解析
// DOM——主线程阻塞）→ 与 canvas 动画的 rAF 竞争 → 打字时动画掉帧。
// 【本实现】rAF 驱动（与 canvas 同帧调度——打字 DOM 写在帧内不丢帧）+
// textContent 更新（零解析）+ 自研状态机（typing → pausing → deleting →
// 下一条，14 种语言循环）。
// 【交互保留（站主钦点）】卡片墙打开 = 暂停打字（保留进度——西班牙语打到
// 哪个字母，淡入回来还在打那个字）+ 文字淡出；关闭 = 淡入 + 550ms 后继续。
import { useEffect, useRef } from "preact/hooks";

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

const TYPE_MS = 80; // 打字速度（每字）
const DELETE_MS = 40; // 删除速度（每字）
const PAUSE_MS = 1800; // 打完整句保持时长

type Mode = "typing" | "pausing" | "deleting";

interface TyperState {
  msg: number;
  chars: number;
  mode: Mode;
  paused: boolean;
}

export default function Typewriter({ scatter }: { scatter: boolean }) {
  const elRef = useRef<HTMLSpanElement>(null);
  const stRef = useRef<TyperState>({ msg: 0, chars: 0, mode: "typing", paused: false });
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
      const full = MESSAGES[st.msg];
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
          st.msg = (st.msg + 1) % MESSAGES.length;
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

  return <span class="typewriter-box" ref={elRef} />;
}
