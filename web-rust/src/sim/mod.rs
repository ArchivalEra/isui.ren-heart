// 纯模拟核心（sim）：几何 + 目标 + 规划执行
// 不依赖 web_sys/wasm —— 原生 cargo test 可测
pub mod math;
pub mod planner;
