// /heart — 博客主页：tayori 视觉（灰阶白 + 三球队列动画 + 唯一黑色 logo + 打字机）
use crate::animation::balls::BallsAnimation;
use leptos::prelude::*;
use wasm_bindgen::closure::Closure;
use wasm_bindgen::JsCast;

const TARGET: &str = "关注isui谢谢喵";
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

#[component]
fn Typewriter() -> impl IntoView {
    let shown = RwSignal::new(0usize);
    Effect::new(move |_| {
        let shown = shown;
        let text = TARGET;
        let mut count = 0usize;
        let closure = Closure::<dyn FnMut()>::new(move || {
            count += 1;
            if count <= text.len() {
                shown.set(count);
            }
        });
        let window = web_sys::window().expect("window");
        let id = window
            .set_interval_with_callback_and_timeout_and_arguments_0(
                closure.as_ref().unchecked_ref(),
                180,
            )
            .expect("set_interval");
        let _ = closure.into_js_value();
        let _ = id;
    });
    view! {
        <span>
            {move || {
                let n = shown.get().min(TARGET.chars().count());
                TARGET.chars().take(n).collect::<String>()
            }}
            <span class="cursor">"▍"</span>
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
                    <a href="/home" class="heart-link">"** 卡片墙 **"</a>
                </nav>
            </main>
        </div>
    }
}
