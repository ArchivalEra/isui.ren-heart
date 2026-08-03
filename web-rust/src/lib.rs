// 入口：纯 CSR（零 SSR）
// config/sim 不挂 wasm cfg —— 原生 cargo test 可测
mod config;
mod sim;

#[cfg(target_arch = "wasm32")]
mod animation;
#[cfg(target_arch = "wasm32")]
mod pages;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen::prelude::wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    leptos::mount::mount_to_body(app::App);
}

#[cfg(target_arch = "wasm32")]
mod app {
    use crate::pages::heart::Heart;
    use crate::pages::home::Home;
    use leptos::prelude::*;
    use leptos_router::components::{Route, Router, Routes};
    use leptos_router::hooks::use_navigate;
    use leptos_router::path;

    #[component]
    pub fn App() -> impl IntoView {
        view! {
            <Router>
                <Routes fallback=move || view! { <RedirectToHeart /> }>
                    <Route path=path!("/") view=RedirectToHeart />
                    <Route path=path!("/heart") view=Heart />
                    <Route path=path!("/home") view=Home />
                </Routes>
            </Router>
        }
    }

    #[component]
    fn RedirectToHeart() -> impl IntoView {
        let navigate = use_navigate();
        Effect::new(move |_| {
            navigate("/heart", Default::default());
        });
        view! { <p class="redirecting">"…"</p> }
    }
}
