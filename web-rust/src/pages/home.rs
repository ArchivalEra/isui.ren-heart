// /home — 卡片页（雏形：静态卡片，后续接链接库/管理工具）
use leptos::prelude::*;

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
pub fn Home() -> impl IntoView {
    view! {
        <div class="home-page">
            <header class="home-header">
                <a href="/heart" class="home-back">"← 回主页"</a>
                <h2>"卡片墙"</h2>
            </header>
            <main class="card-grid">
                {LINKS
                    .iter()
                    .map(|item| {
                        view! {
                            <a
                                class="card"
                                href=item.url
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span class="card-icon" aria-hidden="true">{item.icon}</span>
                                <span class="card-body">
                                    <span class="card-title">{item.title}</span>
                                    <span class="card-desc">{item.desc}</span>
                                </span>
                            </a>
                        }
                    })
                    .collect_view()}
            </main>
            <footer class="home-footer">"链接库接入中 · isui.ren"</footer>
        </div>
    }
}
