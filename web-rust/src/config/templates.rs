// ═══════════════════════════════════════════════════════════════════
// 曲线模板规范（CURVE TEMPLATE SPEC）—— 给 AI 协作者的添加/删除指南
// ═══════════════════════════════════════════════════════════════════
//
// 【这是什么】
//   每个「曲线模板」只描述一段路径的【几何形状】（弯度）。
//   速度、摆动、队形是独立的段级参数（见 params.rs：SPEED_BANDS /
//   WAVE_BANDS / FORMATION_OFFSETS）——曲线只管形状，不做组合爆炸。
//   想「慢速绕圈」= loop 曲线 + 慢速档；想「高速线圈」= coil + 冲刺档，
//   不需要为每种组合新建模板。
//
// 【如何添加一个曲线模板】
//   1. 想好 id（英文小写+下划线，≤16 字符）和 name（中文，≤8 字）
//   2. 设计 curvature（见下面取值规范）
//   3. 在 TEMPLATES 数组末尾追加 `Template { ... },`
//   4. 把数组长度 `[Template; N]` 改成新数量
//   5. 运行 `cargo test template_spec` —— 校验测试检查取值合法
//
// 【如何删除/禁用一个曲线模板】
//   删除 TEMPLATES 中对应行 + 改数组长度。
//
// 【curvature 取值规范】（校验测试 template_spec_validates_all 强制执行）
//   - 范围 [-1.6, 1.6]；0=直线，正=左弯，负=右弯
//   - |curvature| > 1 会显著弯折（线圈/环）；> 1.6 校验失败
//   - 相邻段切换时 |Δcurvature| 会被 TEMPLATE_CURV_STEP(0.35) 约束
//     （自动，无需处理）
//
// 【设计要点】
//   - 曲线是「从当前点出发、朝当前方向继续」的贝塞尔弧：
//     ctrl = from + dir×(dist/2) + normal×dist×curvature×0.35
//   - 直线段后接大弯 = 突然转向，衔接由曲率连续性约束自动平滑
//   - 想让队伍「画线圈」：curvature ≈ ±1.2~1.5
//   - 想让队伍「蛇形/绕圈」：curvature ≈ 0.4~0.8
//   - 想让队伍「大范围巡航」：curvature ≈ 0.0~0.3
//   - 新增后目测：`./build.sh && python3 serve.py 8080`
//
// 【现有曲线一览】（14 个，2026-08-03）
//   run(直线) sweep(大转弯) wiggle(微弯) glide(滑翔弧) sprint(直线冲刺)
//   sway(摇摆弧) loop(绕圈) zigzag(锯齿) crawl(缓弧) dash(折返)
//   drift(漂移) stroll(散步弧) coil(线圈) coil_r(反向线圈)
//   ※ coil/coil_r 为「待重做」示例：±1.5 偏粗暴，欢迎替换更优美的曲线
// ═══════════════════════════════════════════════════════════════════

pub struct Template {
    #[allow(dead_code)] // 配置契约：模板标识（英文小写+下划线，唯一）
    pub id: &'static str,
    #[allow(dead_code)] // 配置契约：中文名（展示/调试用）
    pub name: &'static str,
    /// 路径弯度 [-1.6, 1.6]：0=直线，正=左弯，负=右弯；|x|>1 呈线圈
    pub curvature: f64,
}

pub const TEMPLATES: [Template; 14] = [
    Template { id: "run", name: "直线", curvature: 0.0 },
    Template { id: "sweep", name: "大转弯", curvature: 0.65 },
    Template { id: "wiggle", name: "微弯", curvature: 0.22 },
    Template { id: "glide", name: "滑翔弧", curvature: 0.35 },
    Template { id: "sprint", name: "直线冲刺", curvature: 0.08 },
    Template { id: "sway", name: "摇摆弧", curvature: 0.5 },
    Template { id: "loop", name: "绕圈", curvature: 0.6 },
    Template { id: "zigzag", name: "锯齿", curvature: -0.4 },
    Template { id: "crawl", name: "缓弧", curvature: 0.18 },
    Template { id: "dash", name: "折返", curvature: -0.55 },
    Template { id: "drift", name: "漂移", curvature: 0.75 },
    Template { id: "stroll", name: "散步弧", curvature: 0.12 },
    // 待重做示例：线圈（给 AI 的参考起点，可替换成更优美的曲线）
    Template { id: "coil", name: "线圈", curvature: 1.5 },
    Template { id: "coil_r", name: "反向线圈", curvature: -1.5 },
];

#[cfg(test)]
mod tests {
    use super::*;

    /// 曲线模板规范校验：所有模板取值必须合法（新增模板违规会在这里红）
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
            assert!(!t.name.is_empty(), "模板 {i} name 不能为空");
            // curvature ∈ [-1.6, 1.6]
            assert!(
                (-1.6..=1.6).contains(&t.curvature),
                "模板 '{}' curvature {} 超出 [-1.6, 1.6]",
                t.id, t.curvature
            );
        }
    }
}
