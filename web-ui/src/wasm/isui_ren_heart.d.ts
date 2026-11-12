/* tslint:disable */
/* eslint-disable */

/**
 * 锚点屏幕像素（JS 画可拖标记）
 */
export function anchor_screens(cw: number, ch: number): Float64Array;

/**
 * 锚点世界坐标（JS 复制参数）
 */
export function get_anchors(): Float64Array;

/**
 * 暂停动画（屏 2 freeze）：停 rAF 循环 + ENGINE 置 paused 双保险。
 * RAF 置 None → 下一次（若残留）回调检测到不活跃 → 不再自我调度 → 循环停。
 */
export function pause_balls(): void;

/**
 * 恢复动画（回屏 1）：ENGINE 已有不重建——清 paused + 重建 rAF 循环。
 * 新 closure last=0.0 → 首帧 dt=16.7（与 start_balls 首帧同语义，不跳变）。
 */
export function resume_balls(): void;

/**
 * 屏幕像素 → 世界坐标（JS 拖拽换算）
 */
export function screen_to_world(sx: number, sy: number, cw: number, ch: number): Float64Array;

/**
 * 调试拖拽更新单个锚点
 */
export function set_anchor(s: number, x: number, y: number): void;

/**
 * 调试涂层开关（灰色锚点标记——JS 调试模式激活/退出时调用）
 */
export function set_anchor_overlay(on: boolean): void;

/**
 * 启动三球动画：在指定 canvas 上创建引擎并跑 rAF 循环
 */
export function start_balls(canvas_id: string): void;

/**
 * 切换拖尾风格（大拖尾 ↔ 小拖尾）——前端按钮调用
 */
export function toggle_trail_style(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly anchor_screens: (a: number, b: number) => [number, number];
    readonly get_anchors: () => [number, number];
    readonly pause_balls: () => void;
    readonly screen_to_world: (a: number, b: number, c: number, d: number) => [number, number];
    readonly set_anchor_overlay: (a: number) => void;
    readonly start_balls: (a: number, b: number) => void;
    readonly toggle_trail_style: () => void;
    readonly resume_balls: () => void;
    readonly set_anchor: (a: number, b: number, c: number) => void;
    readonly wasm_bindgen_fcaa1ccc421e504f___convert__closures_____invoke___wasm_bindgen_fcaa1ccc421e504f___JsValue______true_: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen_fcaa1ccc421e504f___convert__closures_____invoke_______true_: (a: number, b: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
