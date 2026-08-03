// 目标点生成（纯函数，可单测）
use crate::sim::math::Vec2;

/// 全屏随机点（含边边角角，0..1 全域）
pub fn random_screen_point() -> Vec2 {
    Vec2 { x: rand::random::<f64>(), y: rand::random::<f64>() }
}

/// 入场三球旅行目标（随机点 + 队列偏移）
pub fn random_trio_targets() -> [Vec2; 3] {
    let c = random_screen_point();
    let mut tos = [c; 3];
    for i in 1..3 {
        let off = crate::config::params::WANDER.phase_gap * i as f64;
        tos[i] = Vec2 { x: (c.x + off).clamp(0.0, 1.0), y: c.y };
    }
    tos
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn apart_targets_respect_min_distance() {
        let others = [Vec2 { x: 0.5, y: 0.5 }, Vec2 { x: 0.5, y: 0.7 }];
        for _ in 0..200 {
            let p = random_target_apart(&others, 0.3);
            let d1 = (p.x - 0.5).powi(2) + (p.y - 0.5).powi(2);
            let d2 = (p.x - 0.5).powi(2) + (p.y - 0.7).powi(2);
            assert!(d1 >= 0.29f64.powi(2), "应远离球1: {:?}", p);
            assert!(d2 >= 0.29f64.powi(2), "应远离球2: {:?}", p);
        }
    }

    #[test]
    fn trio_targets_in_bounds() {
        let tos = random_trio_targets();
        for t in tos {
            assert!((0.0..=1.0).contains(&t.x) && (0.0..=1.0).contains(&t.y));
        }
    }
}
