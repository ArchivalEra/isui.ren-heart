// ═══════════════════════════════════════════════════════════════════
// 曲线模板规范（CURVE TEMPLATE SPEC）—— 给 AI 协作者的添加/删除指南
// ═══════════════════════════════════════════════════════════════════
//
// 【这是什么】
//   每个「模板」定义一种路径段的运动形态。链（chain）由若干段拼接而成，
//   每段从模板池 TEMPLATES 中选一个模板决定：弯度、速度、队形偏移、摆动。
//
// 【如何添加一个模板】（按顺序做）
//   1. 想好 id（英文小写+下划线，≤16 字符）和 name（中文，≤8 字）
//   2. 按下面的【字段取值规范】设计 5 个参数
//   3. 在 TEMPLATES 数组末尾追加一行 `Template { ... },`
//   4. 把数组长度 `[Template; N]` 改成新数量
//   5. 运行 `cargo test template_spec` —— 校验测试会检查取值合法；
//      全绿即生效（运行时模板池自动包含新模板，无需改其他代码）
//
// 【如何删除/禁用一个模板】
//   删除 TEMPLATES 中对应行 + 改数组长度。或把 speed 设为 0.0（跳过，
//   仍占位）——校验测试允许 speed=0（禁用）。
//
// 【字段取值规范】（校验测试 template_spec_validates_all 强制执行）
//   - id:       小写字母/数字/下划线，唯一
//   - name:     任意字符串（展示用）
//   - curvature: 弯度，[-1.6, 1.6]；0=直线，正=左弯，负=右弯。
//               |curvature|>1 会显著弯折（线圈/环），>1.6 校验失败。
//               相邻段切换时 |Δcurvature| 会被 TEMPLATE_CURV_STEP(0.35)
//               约束（自动，无需处理）
//   - speed:    速度倍率，(0, 2.0]；1.0=基准巡航。>1.2 属于「高速」，
//               受批准制约束（40% 概率批准，自动，无需处理）。0.0=禁用
//   - offsets:  [粉, 蓝, 绿] 三球的法线分离量，各 ∈ [-1.0, 1.0]；
//               正值=法线方向，负值=反法线。典型：队形错开 [0, ±0.6, ∓0.6]
//   - wave:     段内法线摆动幅度（蛇形/线圈感），[0.0, 0.3]；0=无摆动。
//               摆动有出屏硬保护（自动），但太大（>0.3）会显得乱
//
// 【设计要点】
//   - 曲线是「从当前点出发、朝当前方向继续」的贝塞尔弧：
//     ctrl = from + dir×(dist/2) + normal×dist×curvature×0.35
//     所以 curvature 只在「转向」时有意义，直线段后接大弯 = 突然转向，
//     衔接由模板切换的曲率连续性约束自动平滑
//   - 想让队伍「并排画线圈」：curvature ≈ ±1.2~1.5 + wave ≈ 0.15~0.25
//   - 想让队伍「蛇形前进」：curvature ≈ 0.2~0.4 + wave ≈ 0.04~0.08
//   - 想让队伍「拉开距离」：offsets 用 [0, 0.8, -0.8]
//   - 新增模板后建议目测：改完直接 `./build.sh && python3 serve.py 8080`
//
// 【现有模板一览】（14 个，2026-08-03）
//   run(直线跑) sweep(大转弯) wiggle(小碎步) glide(滑翔) sprint(冲刺)
//   sway(摇摆) loop(绕圈) zigzag(锯齿) crawl(慢爬) dash(折返)
//   drift(漂移) stroll(散步) coil(线圈) coil_r(反向线圈)
//   ※ coil/coil_r 为「待重做」示例：当前 curvature±1.5+wave≈0.2 偏粗暴，
//     欢迎用更优美的曲线替换（比如 curvature 1.2 + wave 0.12 的双环）
// ═══════════════════════════════════════════════════════════════════

pub struct Template {
    #[allow(dead_code)] // 配置契约：模板标识（英文小写+下划线，唯一）
    pub id: &'static str,
    #[allow(dead_code)] // 配置契约：中文名（展示/调试用）
    pub name: &'static str,
    /// 路径弯度 [-1.6, 1.6]：0=直线，正=左弯，负=右弯；|x|>1 呈线圈
    pub curvature: f64,
    /// 速度倍率 (0, 2.0]：1.0=基准巡航；>1.2 受高速批准制约束；0.0=禁用该模板
    pub speed: f64,
    /// 三球法线分离量 [粉, 蓝, 绿]，各 ∈ [-1.0, 1.0]
    pub offsets: [f64; 3],
    /// 段内法线摆动幅度 [0.0, 0.3]：0=无，0.04≈蛇形，0.2≈线圈
    pub wave: f64,
}

impl Template {
    /// 速度倍率（路径时长 = 路径长度 / (WORLD_SPEED × speed)）
    pub fn speed(&self) -> f64 {
        self.speed
    }
}

pub const TEMPLATES: [Template; 14] = [
    Template { id: "run", name: "直线跑", curvature: 0.0, speed: 1.1, offsets: [0.0, 0.6, -0.6], wave: 0.0 },
    Template { id: "sweep", name: "大转弯", curvature: 0.65, speed: 1.0, offsets: [0.0, 0.5, -0.5], wave: 0.0 },
    Template { id: "wiggle", name: "小碎步", curvature: 0.22, speed: 1.2, offsets: [0.0, 0.4, 0.4], wave: 0.012 },
    Template { id: "glide", name: "滑翔", curvature: 0.35, speed: 0.85, offsets: [0.0, 0.8, -0.8], wave: 0.02 },
    Template { id: "sprint", name: "冲刺", curvature: 0.08, speed: 1.6, offsets: [0.0, 0.3, -0.3], wave: 0.0 },
    Template { id: "sway", name: "摇摆", curvature: 0.5, speed: 0.9, offsets: [0.0, 0.5, 0.5], wave: 0.045 },
    Template { id: "loop", name: "绕圈", curvature: 0.6, speed: 0.95, offsets: [0.0, 0.6, -0.6], wave: 0.0 },
    Template { id: "zigzag", name: "锯齿", curvature: -0.4, speed: 1.15, offsets: [0.3, 0.0, -0.3], wave: 0.06 },
    Template { id: "crawl", name: "慢爬", curvature: 0.18, speed: 0.55, offsets: [0.0, 0.4, -0.4], wave: 0.008 },
    Template { id: "dash", name: "折返", curvature: -0.55, speed: 1.4, offsets: [0.0, 0.5, -0.5], wave: 0.03 },
    Template { id: "drift", name: "漂移", curvature: 0.75, speed: 1.3, offsets: [0.4, -0.2, 0.2], wave: 0.015 },
    Template { id: "stroll", name: "散步", curvature: 0.12, speed: 0.7, offsets: [0.0, 0.5, 0.5], wave: 0.005 },
    // 待重做示例：并排线圈（给 AI 的参考起点，可替换成更优美的参数）
    Template { id: "coil", name: "线圈", curvature: 1.5, speed: 1.05, offsets: [0.0, 0.6, -0.6], wave: 0.20 },
    Template { id: "coil_r", name: "反向线圈", curvature: -1.5, speed: 0.95, offsets: [0.0, 0.5, 0.5], wave: 0.22 },
];

#[cfg(test)]
mod tests {
    use super::*;

    /// 模板规范校验：所有模板取值必须合法（新增模板违规会在这里红）
    #[test]
    fn template_spec_validates_all() {
        assert!(TEMPLATES.len() <= 40, "模板数量上限 40（防失控）");
        let mut ids = std::collections::HashSet::new();
        for (i, t) in TEMPLATES.iter().enumerate() {
            // id：小写字母/数字/下划线，唯一，非空
            assert!(!t.id.is_empty(), "第 {i} 个模板 id 不能为空");
            assert!(
                t.id.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_'),
                "模板 {i} id '{}' 只能用小写字母/数字/下划线",
                t.id
            );
            assert!(ids.insert(t.id), "模板 id '{}' 重复", t.id);
            // 名字非空
            assert!(!t.name.is_empty(), "模板 {i} name 不能为空");
            // curvature ∈ [-1.6, 1.6]
            assert!(
                (-1.6..=1.6).contains(&t.curvature),
                "模板 '{}' curvature {} 超出 [-1.6, 1.6]",
                t.id, t.curvature
            );
            // speed ∈ (0, 2.0] 或 0.0（禁用）
            assert!(
                (t.speed > 0.0 && t.speed <= 2.0) || t.speed == 0.0,
                "模板 '{}' speed {} 须 ∈ (0, 2.0] 或 0.0（禁用）",
                t.id, t.speed
            );
            // offsets ∈ [-1, 1]
            for (k, o) in t.offsets.iter().enumerate() {
                assert!(
                    (-1.0..=1.0).contains(o),
                    "模板 '{}' offsets[{k}]={o} 超出 [-1, 1]",
                    t.id
                );
            }
            // wave ∈ [0, 0.3]
            assert!(
                (0.0..=0.3).contains(&t.wave),
                "模板 '{}' wave {} 超出 [0, 0.3]",
                t.id, t.wave
            );
        }
    }
}
