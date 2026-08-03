// 三球动画挂载：Rust wasm（web-rust 编译）——性能敏感部分保持 Rust
// 静态 import（rollup 对动态 import 的 namespace 属性访问会 tree-shake 掉导出——
// 曾导致 start_balls 丢失、球不显示）；init 异步，useEffect 里 await 后再启动
import { useEffect, useRef } from "preact/hooks";
import * as wasm from "./wasm/isui_ren_heart.js";

export default function BallsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const canvas = ref.current;
    wasm
      .default()
      .then(() => wasm.start_balls(canvas.id))
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
