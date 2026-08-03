// 模板定义：曲线 + 法线偏移（配置化，增删改即变种类）
pub struct Template {
    #[allow(dead_code)] // 配置契约：模板标识，管理工具/调试用
    pub id: &'static str,
    #[allow(dead_code)] // 配置契约：中文名，管理工具展示用
    pub name: &'static str,
    pub curve: CurveId,
    /// 每球法线偏移目标倍率（相对 offset_range）
    pub offsets: [f64; 3],
}

#[derive(Clone, Copy, PartialEq)]
pub enum CurveId {
    Run,
    Circle,
    Wave,
    Hop,
    Spiral,
    Eight,
    Chase,
    Sway,
    Scatter,
    Bounce,
    Orbit,
    Slide,
    SwingPendulum,
    HideSeek,
    HandCircle,
    Idle,
}

pub const TEMPLATES: [Template; 16] = [
    Template { id: "run", name: "直线跑", curve: CurveId::Run, offsets: [0.0, 0.6, -0.6] },
    Template { id: "circle", name: "绕圈", curve: CurveId::Circle, offsets: [0.0, 0.5, -0.5] },
    Template { id: "wave", name: "波浪滑行", curve: CurveId::Wave, offsets: [0.0, 0.8, -0.8] },
    Template { id: "hop", name: "跳格子", curve: CurveId::Hop, offsets: [0.0, 0.4, 0.4] },
    Template { id: "spiral", name: "螺旋", curve: CurveId::Spiral, offsets: [0.0, -0.5, 0.5] },
    Template { id: "eight", name: "8字回旋", curve: CurveId::Eight, offsets: [0.0, 0.7, -0.7] },
    Template { id: "chase", name: "追逐", curve: CurveId::Chase, offsets: [0.3, 0.0, -0.3] },
    Template { id: "sway", name: "并肩摇", curve: CurveId::Sway, offsets: [0.0, 0.5, 0.5] },
    Template { id: "scatter", name: "散开再聚", curve: CurveId::Scatter, offsets: [0.0, -0.6, 0.6] },
    Template { id: "bounce", name: "地面弹跳", curve: CurveId::Bounce, offsets: [0.0, 0.5, -0.5] },
    Template { id: "orbit", name: "绕点转", curve: CurveId::Orbit, offsets: [0.0, 0.6, -0.6] },
    Template { id: "slide", name: "滑梯下", curve: CurveId::Slide, offsets: [0.0, 0.3, -0.3] },
    Template { id: "swingPendulum", name: "荡秋千", curve: CurveId::SwingPendulum, offsets: [0.0, 0.6, -0.6] },
    Template { id: "hideSeek", name: "捉迷藏", curve: CurveId::HideSeek, offsets: [0.4, -0.2, 0.2] },
    Template { id: "handCircle", name: "手拉手转圈", curve: CurveId::HandCircle, offsets: [0.0, 0.3, -0.3] },
    Template { id: "idle", name: "发呆", curve: CurveId::Idle, offsets: [0.0, 0.5, 0.5] },
];

pub fn random_template(exclude: CurveId) -> (usize, &'static Template) {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    loop {
        let i = rng.gen_range(0..TEMPLATES.len());
        let t = &TEMPLATES[i];
        if t.curve != exclude {
            return (i, t);
        }
    }
}
