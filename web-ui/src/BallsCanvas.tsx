// 三球动画挂载：Rust wasm（web-rust 编译）——性能敏感部分保持 Rust
// wasm-bindgen --target web 产物：default=init + start_balls/toggle_trail_style
import { useEffect, useRef } from "preact/hooks";

export default function BallsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const canvas = ref.current;
    // 动态 import：wasm 与 UI 代码分离（首屏 UI 不阻塞）
    import("./wasm/isui_ren_heart.js")
      .then((m) => m.default())
      .then(() => m.start_balls(canvas.id))
      .catch((e) => console.error("wasm 启动失败", e));
  }, []);

  return (
    <canvas
      ref={ref}
      id="balls-canvas"
      class="balls-canvas"
      aria-hidden="true"
    ></canvas>
  );
}
