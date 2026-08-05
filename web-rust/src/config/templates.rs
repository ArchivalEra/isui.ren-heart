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
// 【如何钦定速度档】（可选；默认 None = 随机档，行为与旧版完全一致）
//   Template.speed = Some(档位索引)，指向 params.rs 的 SPEED_BANDS：
//     0 = 慢档 0.5-0.65，1 = 巡航档 0.72-0.85，2 = 高速档 1.1-1.3
//   例：`Template { id: "coil", ..., speed: Some(2) }` = 线圈固定高速档
//     （艺术表达：coil 天生高速甩尾的视觉意图直接落地）。
//   钦定档不走高速批准制（SPEED_THRESHOLD/SPEED_APPROVE_PROB 只作用于随机档）——
//   AI/Gemini 钦定 = 艺术意图直接落地；随机档才需要批准制防视觉失控。
//   现有模板全部 speed: None（零行为变化）；想钦定才把 None 改成 Some(档位)。
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
// 【现有曲线一览】（25 个，gemini 师傅 2026-08-04 六主题梯队）
//   0 轴线基准：run(直线)
//   1 细微流韵：stroll/stroll_r(闲步±0.10) breeze/breeze_r(拂风±0.20)
//   2 优雅巡航：ripple/ripple_r(漪涟±0.30) glide/glide_r(滑翔±0.40) sway/sway_r(摇摆±0.52)
//   3 律动开合：loop/loop_r(绕弧±0.65) sweep/sweep_r(漫游±0.78) surge/surge_r(涌浪±0.90)
//   4 疾速甩尾：drift/drift_r(漂移±1.05) whirl/whirl_r(柔卷±1.22)
//   5 极光飞花：coil/coil_r(灵线±1.40) vortex/vortex_r(漩涡±1.55)
//   ※ 任意相邻档位 |Δcurv| ∈ [0.10, 0.18] << 0.35 连续性约束——衔接天然平滑
// ═══════════════════════════════════════════════════════════════════

pub struct Template {
    #[allow(dead_code)] // 配置契约：模板标识（英文小写+下划线，唯一）
    pub id: &'static str,
    #[allow(dead_code)] // 配置契约：中文名（展示/调试用）
    pub name: &'static str,
    /// 路径弯度 [-1.6, 1.6]：0=直线，正=左弯，负=右弯；|x|>1 呈线圈
    pub curvature: f64,
    /// 钦定速度档位（索引指向 params.rs 的 SPEED_BANDS，见文件头档位对照）：
    /// Some(idx) = 模板固定该档（艺术意图直接落地，不经高速批准制）；
    /// None = 随机档（现状行为，默认）
    pub speed: Option<usize>,
}

// Gemini 真经二版（2026-08-05）：阶梯加密（0.05-0.18 梯队）+ 高曲率钦定低速档
// —— 法向加速度 a_n = v²κ 与速度平方成正比：高 κ 配高 v = 巨大 Jerk 冲量（顿顿）
// 阶梯差：0.05→0.12→0.20→0.28→0.38→0.48→0.60→0.75→0.90→1.05→1.20→1.38
// （0.05-0.18，全部 < TEMPLATE_CURV_STEP 0.2——段间 |Δκ| 自然受约束）
// 高曲率（≥0.90）钦定中/低速档：surge/drift Some(1)、whirl/coil Some(0)
pub const TEMPLATES: [Template; 25] = [
    // --- 0. 轴线基准 ---
    Template { id: "run", name: "直线", curvature: 0.00, speed: None },
    // --- 1. 极微流韵 (±0.05 ~ ±0.12) ---
    Template { id: "glide_micro", name: "微平", curvature: 0.05, speed: None },
    Template { id: "glide_micro_r", name: "微平·反", curvature: -0.05, speed: None },
    Template { id: "stroll", name: "闲步", curvature: 0.12, speed: None },
    Template { id: "stroll_r", name: "闲步·反", curvature: -0.12, speed: None },
    // --- 2. 舒缓巡航 (±0.20 ~ ±0.38) ---
    Template { id: "breeze", name: "拂风", curvature: 0.20, speed: None },
    Template { id: "breeze_r", name: "拂风·反", curvature: -0.20, speed: None },
    Template { id: "ripple", name: "漪涟", curvature: 0.28, speed: None },
    Template { id: "ripple_r", name: "漪涟·反", curvature: -0.28, speed: None },
    Template { id: "glide", name: "滑翔", curvature: 0.38, speed: None },
    Template { id: "glide_r", name: "滑翔·反", curvature: -0.38, speed: None },
    // --- 3. 律动开合 (±0.48 ~ ±0.75) ---
    Template { id: "sway", name: "摇摆", curvature: 0.48, speed: None },
    Template { id: "sway_r", name: "摇摆·反", curvature: -0.48, speed: None },
    Template { id: "loop", name: "绕弧", curvature: 0.60, speed: None },
    Template { id: "loop_r", name: "绕弧·反", curvature: -0.60, speed: None },
    Template { id: "sweep", name: "漫游", curvature: 0.75, speed: None },
    Template { id: "sweep_r", name: "漫游·反", curvature: -0.75, speed: None },
    // --- 4. 疾速甩尾（高曲率钦定中速档——v²κ 降幅） ---
    Template { id: "surge", name: "涌浪", curvature: 0.90, speed: Some(1) },
    Template { id: "surge_r", name: "涌浪·反", curvature: -0.90, speed: Some(1) },
    Template { id: "drift", name: "漂移", curvature: 1.05, speed: Some(1) },
    Template { id: "drift_r", name: "漂移·反", curvature: -1.05, speed: Some(1) },
    // --- 5. 极光飞花（最高曲率钦定低速档——Jerk 最小化） ---
    Template { id: "whirl", name: "柔卷", curvature: 1.20, speed: Some(0) },
    Template { id: "whirl_r", name: "柔卷·反", curvature: -1.20, speed: Some(0) },
    Template { id: "coil", name: "灵线", curvature: 1.38, speed: Some(0) },
    Template { id: "coil_r", name: "灵线·反", curvature: -1.38, speed: Some(0) },
];

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::params::SPEED_BANDS;

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
            // speed：None（随机档）或索引 < SPEED_BANDS.len()（钦定档）
            assert!(
                t.speed.map_or(true, |s| s < SPEED_BANDS.len()),
                "模板 '{}' speed 档位 {:?} 越界（SPEED_BANDS 共 {} 档）",
                t.id, t.speed, SPEED_BANDS.len()
            );
        }
    }
}
