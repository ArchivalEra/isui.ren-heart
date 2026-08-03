// 几何数学（纯函数，全部可单测）

/// 透视：自然俯视（0=远处地平线，1=近处镜头前）
pub fn depth_scale(y: f64) -> f64 {
    0.55 + 0.45 * y.clamp(0.0, 1.0)
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

pub fn quad_bezier(a: Vec2, c: Vec2, b: Vec2, t: f64) -> Vec2 {
    let u = 1.0 - t;
    Vec2 {
        x: u * u * a.x + 2.0 * u * t * c.x + t * t * b.x,
        y: u * u * a.y + 2.0 * u * t * c.y + t * t * b.y,
    }
}

pub fn bezier_tangent(a: Vec2, c: Vec2, b: Vec2, t: f64) -> Vec2 {
    let u = 1.0 - t;
    Vec2 {
        x: 2.0 * u * (c.x - a.x) + 2.0 * t * (b.x - c.x),
        y: 2.0 * u * (c.y - a.y) + 2.0 * t * (b.y - c.y),
    }
}

pub fn normal_of(tan: Vec2) -> Vec2 {
    let len = (tan.x * tan.x + tan.y * tan.y).sqrt();
    if len < 1e-9 {
        // 退化（零切线）：返回安全默认法线，避免 (0,0) 非单位向量
        return Vec2 { x: 0.0, y: -1.0 };
    }
    Vec2 { x: tan.y / len, y: -tan.x / len }
}

pub fn smoothstep(k: f64) -> f64 {
    let k = k.clamp(0.0, 1.0);
    k * k * (3.0 - 2.0 * k)
}

pub fn normalize(v: Vec2) -> Vec2 {
    let l = (v.x * v.x + v.y * v.y).sqrt().max(1e-9);
    Vec2 { x: v.x / l, y: v.y / l }
}

pub fn lerp(a: Vec2, b: Vec2, k: f64) -> Vec2 {
    Vec2 { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
}

/// 世界坐标 → 屏幕坐标（自然俯视透视）
pub fn screen_of(p: Vec2, w: f64, h: f64) -> (f64, f64, f64) {
    let d = depth_scale(p.y);
    ((p.x - 0.5) * w * d + w / 2.0, p.y * h, d)
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bezier_endpoints_match() {
        let a = Vec2 { x: 0.1, y: 0.2 };
        let c = Vec2 { x: 0.5, y: 0.9 };
        let b = Vec2 { x: 0.8, y: 0.3 };
        assert_eq!(quad_bezier(a, c, b, 0.0), a);
        assert_eq!(quad_bezier(a, c, b, 1.0), b);
    }

    #[test]
    fn bezier_midpoint_is_weighted() {
        let a = Vec2 { x: 0.0, y: 0.0 };
        let c = Vec2 { x: 0.0, y: 1.0 };
        let b = Vec2 { x: 0.0, y: 0.0 };
        let m = quad_bezier(a, c, b, 0.5);
        assert!((m.y - 0.5).abs() < 1e-9, "ctrl 中点应加权到 0.5，实际 {}", m.y);
    }

    #[test]
    fn tangent_zero_at_degenerate() {
        // 退化段（a==b，ctrl 无偏移）：切线可能为零向量，法线归一化不应 NaN
        let a = Vec2 { x: 0.5, y: 0.5 };
        let c = Vec2 { x: 0.5, y: 0.5 };
        let tan = bezier_tangent(a, c, a, 0.5);
        let n = normal_of(tan);
        assert!(n.x.is_finite() && n.y.is_finite());
        assert!((n.x * n.x + n.y * n.y - 1.0).abs() < 1e-6);
    }

    #[test]
    fn normal_is_unit_and_perpendicular() {
        let tan = Vec2 { x: 3.0, y: 4.0 };
        let n = normal_of(tan);
        assert!((n.x * n.x + n.y * n.y - 1.0).abs() < 1e-9);
        assert!((n.x * tan.x + n.y * tan.y).abs() < 1e-9);
    }

    #[test]
    fn smoothstep_bounds() {
        assert_eq!(smoothstep(0.0), 0.0);
        assert_eq!(smoothstep(1.0), 1.0);
        assert_eq!(smoothstep(-1.0), 0.0);
        assert_eq!(smoothstep(2.0), 1.0);
        assert!(smoothstep(0.5) > 0.4 && smoothstep(0.5) < 0.6, "smoothstep(0.5)≈0.5");
    }

    #[test]
    fn screen_of_projection() {
        // 世界中心 → 屏幕中心
        let (sx, sy, d) = screen_of(Vec2 { x: 0.5, y: 0.5 }, 800.0, 600.0);
        assert!((sx - 400.0).abs() < 1e-9);
        assert!((sy - 300.0).abs() < 1e-9);
        assert!(d > 0.5 && d <= 1.0);
    }

}
