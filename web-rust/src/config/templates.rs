// 模板定义：运动模式（漫游路径形态），配置化——增删改即变种类
// 循环曲线已废弃；运动 = 目标点漫游（贝塞尔弧线），curvature 决定弯度

pub struct Template {
    #[allow(dead_code)] // 配置契约：模板标识，管理工具/调试用
    pub id: &'static str,
    #[allow(dead_code)] // 配置契约：中文名，管理工具展示用
    pub name: &'static str,
    /// 路径弯曲度 -1..1：0=直线，正=左弯，负=右弯
    pub curvature: f64,
    /// 速度倍率（相对基准速度）
    pub speed: f64,
    /// 每球法线偏移目标倍率
    pub offsets: [f64; 3],
}

impl Template {
    /// 一段路径时长（t 0→1 所需毫秒，60fps 基准）
    pub fn duration_ms(&self) -> f64 {
        16.7 / (crate::config::params::WANDER.base_speed * self.speed)
    }
}

pub const TEMPLATES: [Template; 12] = [
    Template { id: "run", name: "直线跑", curvature: 0.0, speed: 1.1, offsets: [0.0, 0.6, -0.6] },
    Template { id: "sweep", name: "大转弯", curvature: 0.65, speed: 1.0, offsets: [0.0, 0.5, -0.5] },
    Template { id: "wiggle", name: "小碎步", curvature: 0.22, speed: 1.2, offsets: [0.0, 0.4, 0.4] },
    Template { id: "glide", name: "滑翔", curvature: 0.35, speed: 0.85, offsets: [0.0, 0.8, -0.8] },
    Template { id: "sprint", name: "冲刺", curvature: 0.08, speed: 1.6, offsets: [0.0, 0.3, -0.3] },
    Template { id: "sway", name: "摇摆", curvature: 0.5, speed: 0.9, offsets: [0.0, 0.5, 0.5] },
    Template { id: "loop", name: "绕圈", curvature: 0.6, speed: 0.95, offsets: [0.0, 0.6, -0.6] },
    Template { id: "zigzag", name: "锯齿", curvature: -0.4, speed: 1.15, offsets: [0.3, 0.0, -0.3] },
    Template { id: "crawl", name: "慢爬", curvature: 0.18, speed: 0.55, offsets: [0.0, 0.4, -0.4] },
    Template { id: "dash", name: "折返", curvature: -0.55, speed: 1.4, offsets: [0.0, 0.5, -0.5] },
    Template { id: "drift", name: "漂移", curvature: 0.75, speed: 1.3, offsets: [0.4, -0.2, 0.2] },
    Template { id: "stroll", name: "散步", curvature: 0.12, speed: 0.7, offsets: [0.0, 0.5, 0.5] },
];

