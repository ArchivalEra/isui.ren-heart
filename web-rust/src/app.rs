// 应用入口：纯 CSR 路由
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
