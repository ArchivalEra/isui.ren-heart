// /heart — 博客主页：tayori 视觉（灰阶白 + 三球队列动画 + 唯一黑色 logo + 多语言打字机）
use crate::animation::balls::BallsAnimation;
use leptos::prelude::*;
use wasm_bindgen::closure::Closure;
use wasm_bindgen::JsCast;

/// 多语言「关注 tayori 谢谢喵」（打字机循环：打字 → 保持 → 删除 → 下一条）
const MESSAGES: [&str; 14] = [
    "关注tayori谢谢喵",                    // 中文
    "Follow tayori, thanks meow~",         // English
    "tayoriをフォローしてね",              // 日本語
    "tayori를 팔로우해줘 냐옹",            // 한국어
    "Suis tayori, merci miaou",            // Français
    "Folge tayori, danke miau",            // Deutsch
    "Sigue a tayori, gracias miau",        // Español
    "Segui tayori, grazie miao",           // Italiano
    "Siga tayori, obrigado miau",          // Português
    "Подпишись на tayori, спасибо мяу",    // Русский
    "تابع tayori، شكرًا مياو",             // العربية
    "tayori'yi takip et, teşekkürler miyav", // Türkçe
    "Đăng ký tayori nhé, cảm ơn meo",      // Tiếng Việt
    "ติดตาม tayori ขอบคุณเหมียว",          // ไทย
];

const EMOJI: [&str; 8] = [
    "(｡･ω･｡)",
    "ฅ^•ﻌ•^ฅ",
    "(*´∀`)~♥",
    "(๑•̀ㅂ•́)و✧",
    "♪(´▽｀)",
    "(´｡• ᵕ •｡`)",
    "♡(◕‿◕)♡",
    "ﾟ+*:;;:*+ﾟ",
];

/// 卡片墙数据（下拉面板；点击卡片 = 新标签打开外链）
struct LinkItem {
    title: &'static str,
    url: &'static str,
    icon: &'static str,
    desc: &'static str,
}

const LINKS: [LinkItem; 3] = [
    LinkItem { title: "X (Twitter)", url: "https://x.com", icon: "𝕏", desc: "乐队动态" },
    LinkItem { title: "YouTube", url: "https://youtube.com", icon: "▶", desc: "视频与音乐" },
    LinkItem { title: "官方网站", url: "https://tayori-official.com", icon: "◎", desc: "官网" },
];

#[component]
fn Typewriter() -> impl IntoView {
    let shown = RwSignal::new(0usize);
    let msg_idx = RwSignal::new(0usize);
    Effect::new(move |_| {
        let shown = shown;
        let msg_idx = msg_idx;
        // 打字机状态机：0=打字 1=保持 2=删除
        let phase = std::cell::RefCell::new(0u8);
        let hold_t = std::cell::RefCell::new(0i32);
        let closure = Closure::<dyn FnMut()>::new(move || {
            let text = MESSAGES[msg_idx.get()];
            let len = text.chars().count();
            let mut ph = phase.borrow_mut();
            match *ph {
                0 => {
                    // 打字：逐字显现
                    let n = shown.get() + 1;
                    if n >= len {
                        *ph = 1;
                        *hold_t.borrow_mut() = 0;
                        shown.set(len);
                    } else {
                        shown.set(n);
                    }
                }
                1 => {
                    // 保持：整句停留 ~1.8s
                    *hold_t.borrow_mut() += 1;
                    if *hold_t.borrow() >= 18 {
                        *ph = 2;
                    }
                }
                _ => {
                    // 删除：逐字消失 → 下一条
                    let n = shown.get();
                    if n == 0 {
                        msg_idx.set((msg_idx.get() + 1) % MESSAGES.len());
                        *ph = 0;
                    } else {
                        shown.set(n - 1);
                    }
                }
            }
        });
        let window = web_sys::window().expect("window");
        let id = window
            .set_interval_with_callback_and_timeout_and_arguments_0(
                closure.as_ref().unchecked_ref(),
                100,
            )
            .expect("set_interval");
        let _ = closure.into_js_value();
        let _ = id;
    });
    view! {
        <span class="typewriter-box">
            {move || {
                let text = MESSAGES[msg_idx.get()];
                let n = shown.get().min(text.chars().count());
                text.chars().take(n).collect::<String>()
            }}
            <span class="cursor" aria-hidden="true">"▍"</span>
        </span>
    }
}

#[component]
pub fn Heart() -> impl IntoView {
    let emoji_idx = RwSignal::new(0usize);
    Effect::new(move |_| {
        let emoji_idx = emoji_idx;
        let mut count = 0usize;
        let closure = Closure::<dyn FnMut()>::new(move || {
            count += 1;
            if count % 4 == 0 {
                emoji_idx.set((emoji_idx.get() + 1) % EMOJI.len());
            }
        });
        let window = web_sys::window().expect("window");
        let id = window
            .set_interval_with_callback_and_timeout_and_arguments_0(
                closure.as_ref().unchecked_ref(),
                500,
            )
            .expect("set_interval");
        let _ = closure.into_js_value();
        let _ = id;
    });

    // 卡片墙：拟物化按钮点击 → 下拉展开/收起（不再跳转 /home）
    let wall_open = RwSignal::new(false);

    view! {
        <div class="heart-page fade-stagger">
            <div class="heart-bg" aria-hidden="true"></div>
            <BallsAnimation />
            <div class="heart-logo" aria-hidden="true">
                <img class="heart-logo-img" src="logo.png" alt="tayori" />
            </div>
            <main class="heart-main">
                <h1 class="heart-title">
                    <Typewriter />
                </h1>
                <p class="heart-sub">
                    <span class="heart-emoji" aria-hidden="true">{move || EMOJI[emoji_idx.get()]}</span>
                </p>
                <nav class="heart-nav">
                    <div class="card-wall-wrap">
                        <button
                            class="card-wall-btn"
                            aria-label="卡片墙"
                            aria-expanded=move || wall_open.get()
                            on:click=move |_| wall_open.update(|o| *o = !*o)
                        ></button>
                        <div class:card-wall-open={wall_open} class="card-wall">
                            {LINKS
                                .iter()
                                .map(|item| {
                                    view! {
                                        <a
                                            class="wall-card"
                                            href=item.url
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span class="wall-card-icon" aria-hidden="true">{item.icon}</span>
                                            <span class="wall-card-body">
                                                <span class="wall-card-title">{item.title}</span>
                                                <span class="wall-card-desc">{item.desc}</span>
                                            </span>
                                        </a>
                                    }
                                })
                                .collect_view()}
                        </div>
                    </div>
                </nav>
            </main>
        </div>
    }
}
