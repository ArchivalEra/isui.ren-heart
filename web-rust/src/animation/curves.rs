// 曲线数学：十六种「小孩玩耍」曲线，返回归一化坐标 [0,1]×[0,1]
use crate::config::templates::CurveId;

#[derive(Clone, Copy)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

pub type CurveFn = fn(f64) -> Vec2;

pub fn curve_of(id: CurveId) -> CurveFn {
    match id {
        CurveId::Run => run,
        CurveId::Circle => circle,
        CurveId::Wave => wave,
        CurveId::Hop => hop,
        CurveId::Spiral => spiral,
        CurveId::Eight => eight,
        CurveId::Chase => chase,
        CurveId::Sway => sway,
        CurveId::Scatter => scatter,
        CurveId::Bounce => bounce,
        CurveId::Orbit => orbit,
        CurveId::Slide => slide,
        CurveId::SwingPendulum => swing_pendulum,
        CurveId::HideSeek => hide_seek,
        CurveId::HandCircle => hand_circle,
        CurveId::Idle => idle,
    }
}

const TAU: f64 = 6.283185307179586;

/// 数值微分求法线（切线旋转 -90°）
pub fn normal_at(f: CurveFn, t: f64) -> Vec2 {
    let eps = 0.001;
    let a = f(t - eps);
    let b = f(t + eps);
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let len = (dx * dx + dy * dy).sqrt().max(1e-9);
    Vec2 { x: dy / len, y: -dx / len }
}

// ---------- 十六种曲线 ----------

fn run(t: f64) -> Vec2 {
    Vec2 { x: t.fract(), y: 0.5 + 0.08 * (t * TAU).sin() }
}

fn circle(t: f64) -> Vec2 {
    let a = t * TAU;
    Vec2 { x: 0.5 + 0.35 * a.cos(), y: 0.5 + 0.3 * a.sin() }
}

fn wave(t: f64) -> Vec2 {
    Vec2 { x: t.fract(), y: 0.5 + 0.35 * (t * TAU * 2.0).sin() }
}

fn hop(t: f64) -> Vec2 {
    let seg = (t * 5.0).floor() / 5.0;
    let local = (t * 5.0) % 1.0;
    let jump = (local * std::f64::consts::PI).sin();
    Vec2 { x: seg, y: 0.7 - 0.35 * jump }
}

fn spiral(t: f64) -> Vec2 {
    let a = t * TAU * 3.0;
    let r = 0.08 + 0.35 * t.fract();
    Vec2 { x: 0.5 + r * a.cos(), y: 0.5 + r * a.sin() }
}

fn eight(t: f64) -> Vec2 {
    let a = t * TAU * 2.0;
    Vec2 { x: 0.5 + 0.32 * a.sin(), y: 0.5 + 0.3 * (a * 2.0).sin() }
}

fn chase(t: f64) -> Vec2 {
    let s = t + 0.08 * (t * TAU * 4.0).sin();
    Vec2 { x: s.fract(), y: 0.5 + 0.25 * (t * TAU * 1.5).sin() }
}

fn sway(t: f64) -> Vec2 {
    Vec2 { x: 0.5 + 0.4 * (t * TAU).sin(), y: 0.5 + 0.1 * (t * TAU * 3.0).sin() }
}

fn scatter(t: f64) -> Vec2 {
    let spread = (t * TAU * 2.0).sin() * 0.35;
    Vec2 { x: 0.5 + spread * (t * TAU).cos(), y: 0.5 + spread * (t * TAU).sin() }
}

fn bounce(t: f64) -> Vec2 {
    Vec2 { x: t.fract(), y: 0.85 - (t * TAU * 1.5).sin().abs() * 0.6 }
}

fn orbit(t: f64) -> Vec2 {
    let a = t * TAU * 2.5;
    let cx = 0.5 + 0.15 * (t * TAU * 0.7).sin();
    let cy = 0.5 + 0.1 * (t * TAU * 0.5).cos();
    Vec2 { x: cx + 0.25 * a.cos(), y: cy + 0.22 * a.sin() }
}

fn slide(t: f64) -> Vec2 {
    let seg = (t % 1.0) * 2.0;
    if seg < 1.0 {
        Vec2 { x: seg, y: 0.15 + seg * 0.7 }
    } else {
        Vec2 { x: 2.0 - seg, y: 0.85 - (2.0 - seg) * 0.2 }
    }
}

fn swing_pendulum(t: f64) -> Vec2 {
    let a = (t * TAU * 1.2).sin() * 0.7;
    Vec2 { x: 0.5 + 0.35 * a.sin(), y: 0.5 + 0.3 * a.cos() }
}

fn hide_seek(t: f64) -> Vec2 {
    let a = t * TAU * 2.0;
    let r = 0.28 + 0.06 * (t * TAU * 6.0).sin();
    Vec2 { x: 0.5 + r * a.cos(), y: 0.5 + r * a.sin() }
}

fn hand_circle(t: f64) -> Vec2 {
    let a = t * TAU;
    Vec2 {
        x: 0.5 + 0.3 * a.cos() + 0.04 * (a * 6.0).cos(),
        y: 0.5 + 0.25 * a.sin() + 0.04 * (a * 6.0).sin(),
    }
}

fn idle(t: f64) -> Vec2 {
    Vec2 {
        x: 0.5 + 0.02 * (t * TAU * 0.5).sin(),
        y: 0.5 + 0.02 * (t * TAU * 0.35).cos(),
    }
}
