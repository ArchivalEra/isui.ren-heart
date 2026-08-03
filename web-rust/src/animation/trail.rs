// TrailRenderer：拖尾渲染深模块（架构审查候选 C）
// 输入：历史点序列（世界坐标，由引擎采样）+ 球头屏幕位置
// 输出：canvas 绘制命令。实心/Small 两种风格由 profile 的 TrailStyle 决定。
use crate::config::profile::TrailStyle;
use crate::sim::math::{catmull_rom, screen_of, Vec2};
use std::collections::VecDeque;
use web_sys::CanvasRenderingContext2d;

/// 拖尾采样纯函数（可测）：更新一球的历史点。
/// 返回是否记录了新点（false = 静止/未播放，历史被清空）。
/// 规则：
/// - 速度过低（≈静止/思考期）→ 清空历史（拖尾消失，省渲染）
/// - 间距截断：与最新点距离过大（高速/交叉）→ 重建（防大长条/五角星）
/// - 帧采样：按帧数上限裁剪（8 点 = f525e40 手感）
pub fn sample_history(
    history: &mut VecDeque<(f64, f64)>,
    pos: Vec2,
    speed_per_sec: f64,
    dt_ms: f64,
    playing: bool,
    max_seg: f64,
    frames: usize,
) -> bool {
    if !playing {
        history.clear();
        return false;
    }
    let _ = dt_ms; // 保留：未来按时间采样用
    if speed_per_sec < 0.02 {
        history.clear();
        return false;
    }
    if let Some(&(lx, ly)) = history.back() {
        let d = ((pos.x - lx).powi(2) + (pos.y - ly).powi(2)).sqrt();
        if d > max_seg {
            history.clear();
        }
    }
    history.push_back((pos.x, pos.y));
    while history.len() > frames {
        history.pop_front();
    }
    true
}

/// 拖尾渲染器：无状态（只有关联函数），风格由 TrailStyle 决定
pub struct TrailRenderer;

impl TrailRenderer {
    /// 画一条球的拖尾。pts[0] = 球头（当前屏幕位置），后续 = 历史点（最新→最旧，屏幕坐标）
    #[allow(deprecated)] // set_stroke_style(&JsValue) 旧 API
    pub fn draw(
        ctx: &CanvasRenderingContext2d,
        pts: &[Vec2],
        radius: f64,
        color: &str,
        style: TrailStyle,
    ) {
        if pts.len() < 2 {
            return;
        }
        ctx.set_line_cap("round");
        ctx.set_line_join("round");
        match style {
            TrailStyle::Solid { .. } => {
                // 连续实心大拖尾：全宽 2r，一次 stroke（catmull-rom 过点样条无折角）
                ctx.set_stroke_style(&wasm_bindgen::JsValue::from(color));
                ctx.set_line_width(radius * 2.0);
                ctx.begin_path();
                for k in 0..pts.len() - 1 {
                    let p0 = if k == 0 { pts[0] } else { pts[k - 1] };
                    let p1 = pts[k];
                    let p2 = pts[k + 1];
                    let p3 = if k + 2 < pts.len() { pts[k + 2] } else { pts[pts.len() - 1] };
                    for s in 0..4 {
                        let t = s as f64 / 4.0;
                        let q = catmull_rom(p0, p1, p2, p3, t);
                        if k == 0 && s == 0 {
                            ctx.move_to(q.x, q.y);
                        } else {
                            ctx.line_to(q.x, q.y);
                        }
                    }
                }
                ctx.stroke();
            }
            TrailStyle::Mini { .. } => {
                // 小拖尾（动态模糊风）：短历史、宽度收窄、半透明渐变
                let (r, g, b) = hex_to_rgb(color);
                for k in 0..pts.len() - 1 {
                    let frac = k as f64 / (pts.len() - 1) as f64; // 0=球身
                    let alpha = 0.45 * (1.0 - frac);
                    let lw = radius * 2.0 * (0.6 - 0.4 * frac);
                    ctx.set_stroke_style(&wasm_bindgen::JsValue::from(format!(
                        "rgba({r},{g},{b},{alpha:.3})"
                    )));
                    ctx.set_line_width(lw.max(0.5));
                    let p0 = if k == 0 { pts[0] } else { pts[k - 1] };
                    let p1 = pts[k];
                    let p2 = pts[k + 1];
                    let p3 = if k + 2 < pts.len() { pts[k + 2] } else { pts[pts.len() - 1] };
                    ctx.begin_path();
                    for s in 0..4 {
                        let t = s as f64 / 4.0;
                        let q = catmull_rom(p0, p1, p2, p3, t);
                        if s == 0 {
                            ctx.move_to(q.x, q.y);
                        } else {
                            ctx.line_to(q.x, q.y);
                        }
                    }
                    ctx.stroke();
                }
            }
        }
    }

    /// 组装绘制点：球头 + 历史点（世界→屏幕），供 draw 使用
    pub fn build_points(
        head_screen: Vec2,
        history: &VecDeque<(f64, f64)>,
        w: f64,
        h: f64,
    ) -> Vec<Vec2> {
        let mut pts: Vec<Vec2> = Vec::with_capacity(history.len() + 1);
        pts.push(head_screen);
        for (hx, hy) in history.iter().rev() {
            let (sx, sy, _) = screen_of(Vec2 { x: *hx, y: *hy }, w, h);
            pts.push(Vec2 { x: sx, y: sy });
        }
        pts
    }
}

fn hex_to_rgb(hex: &str) -> (u8, u8, u8) {
    let h = hex.trim_start_matches('#');
    (
        u8::from_str_radix(&h[0..2], 16).unwrap_or(0),
        u8::from_str_radix(&h[2..4], 16).unwrap_or(0),
        u8::from_str_radix(&h[4..6], 16).unwrap_or(0),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sample_history_appends_and_caps() {
        let mut h = VecDeque::new();
        for i in 0..20 {
            let pos = Vec2 { x: 0.1 + i as f64 * 0.01, y: 0.5 };
            sample_history(&mut h, pos, 0.5, 16.7, true, 0.12, 8);
        }
        assert_eq!(h.len(), 8, "帧数上限裁剪");
        assert_eq!(h.front().unwrap().0, 0.1 + 12.0 * 0.01, "裁剪保留最新");
    }

    #[test]
    fn sample_history_clears_on_stop() {
        let mut h = VecDeque::new();
        h.push_back((0.1, 0.5));
        sample_history(&mut h, Vec2 { x: 0.2, y: 0.5 }, 0.01, 16.7, true, 0.12, 8);
        assert!(h.is_empty(), "低速 → 清空（拖尾消失）");
        sample_history(&mut h, Vec2 { x: 0.2, y: 0.5 }, 0.5, 16.7, false, 0.12, 8);
        assert!(h.is_empty(), "未播放 → 清空");
    }

    #[test]
    fn sample_history_rebuilds_on_teleport() {
        let mut h = VecDeque::new();
        h.push_back((0.1, 0.5));
        // 与最新点距离 > max_seg（0.12）→ 重建
        let ok = sample_history(&mut h, Vec2 { x: 0.5, y: 0.5 }, 0.5, 16.7, true, 0.12, 8);
        assert!(ok);
        assert_eq!(h.len(), 1, "重建后只有新点");
    }
}
