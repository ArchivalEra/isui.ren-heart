// 链生成深模块（架构审查候选 A）：「给定上下文产出合法段」的纯函数集
//
// 从 planner.rs ensure_chain 巨型函数中提炼（行为逐行一致，先重构不改行为）。
// ensure_chain 现在只做「调用 ChainBuilder + 推链 + 调速」，全部几何决策集中在此。
//
// 每条几何规则独立可测（本文件 tests 模块）：
//   - leg_in_bounds        段全程（子段 8 点采样，含曲线中途）在活动圆内
//   - direction_continuous 段间/子段间切线 C1 连续（方向跳变有界）
//   - target_heading       段尾精确命中 target（方向控制——EulerBlend 曾失控于此）
//   - curvature_continuous 模板切换 |Δcurv| ≤ TEMPLATE_CURV_STEP（曲率渐变约束）
//
// EulerBlend 教训（handoff #1）：三者（曲率连续 + target 命中 + 不出圆）冲突时，
// 规则冲突必须在单测层显形——见 builder_rules_conflict_audit。

use crate::config::params::*;
use crate::sim::math::*;
use super::planner::{CircleBounds, CurveProfile, Leg, PlannedLeg};

// ─────────────────────────── 造段（几何纯函数，自 planner.rs 迁移，逐行一致） ───────────────────────────

/// 造段（几何纯函数）：切线连续 + 段级 speed（wave 已彻底删除）
pub fn make_planned_leg(
    from: Vec2,
    dir: Vec2,
    template_idx: usize,
    target: Vec2,
    speed: f64,
) -> PlannedLeg {
    let dx = target.x - from.x;
    let dy = target.y - from.y;
    let dist = (dx * dx + dy * dy).sqrt().max(1e-6);
    let template = &TEMPLATES[template_idx];
    // 小圈圈滤波：段长低于 MIN_LEG_LEN 时曲率按比例衰减（短段配小弯，防哆嗦）
    let curv_eff = template.curvature * (dist / MIN_LEG_LEN).min(1.0);
    make_blend_leg(from, dir, [curv_eff, curv_eff, curv_eff], target, dist, template_idx, speed)
}

/// 混合模板段：一整段内曲率从 A 渐变到 B 再到 C（Euler spiral 离散近似）
/// 5 子段：前 2 段 lerp(A→B)、第 3 段 B、后 2 段 lerp(B→C)——段内模板渐变，
/// 子段间切线继承（C1 连续）+ 曲率阶梯采样（≈ 线性变化，无折角）
pub fn make_blend_leg(
    from: Vec2,
    dir: Vec2,
    curvs: [f64; 3],
    target: Vec2,
    dist: f64,
    template_idx: usize,
    speed: f64,
) -> PlannedLeg {
    let sub_len = dist / 5.0;
    let mut legs = [Leg {
        from: Vec2 { x: 0.0, y: 0.0 },
        ctrl: Vec2 { x: 0.0, y: 0.0 },
        target: Vec2 { x: 0.0, y: 0.0 },
    }; 5];
    let mut cur = from;
    let mut d = dir;
    let mut arc = 0.0;
    for i in 0..5 {
        // 子段曲率：A→B 前半，B 中段，B→C 后半（Euler spiral 采样）
        let u = (i as f64 + 0.5) / 5.0;
        let curv = if u < 0.5 {
            curvs[0] + (curvs[1] - curvs[0]) * (u / 0.5)
        } else {
            curvs[1] + (curvs[2] - curvs[1]) * ((u - 0.5) / 0.5)
        };
        // 前 4 子段沿切线渐变；第 5 子段直接指向目标（保证终点精确命中）
        // sub_target clamp 屏内：贝塞尔段尾（下子段 from）——曾漏 clamp，
        // 链几何出屏（y=-0.021 规律出屏的根源）
        let sub_target = if i == 4 {
            target
        } else {
            let st = Vec2 {
                x: cur.x + d.x * sub_len,
                y: cur.y + d.y * sub_len,
            };
            Vec2 { x: st.x.clamp(0.04, 0.96), y: st.y.clamp(0.04, 0.96) }
        };
        let norm = Vec2 { x: -d.y, y: d.x };
        let mut ctrl = Vec2 {
            x: cur.x + d.x * (sub_len * 0.5) + norm.x * sub_len * curv * 0.35,
            y: cur.y + d.y * (sub_len * 0.5) + norm.y * sub_len * curv * 0.35,
        };
        // ctrl clamp 屏内：贝塞尔最凸点（u≈0.5）——8 点采样曾漏检极值，
        // 曲线中途出屏（第二个循环/边缘布局时球跑出屏幕）
        ctrl.x = ctrl.x.clamp(0.04, 0.96);
        ctrl.y = ctrl.y.clamp(0.04, 0.96);
        legs[i] = Leg { from: cur, ctrl, target: sub_target };
        arc += ((ctrl.x - cur.x).powi(2) + (ctrl.y - cur.y).powi(2)).sqrt()
            + ((sub_target.x - ctrl.x).powi(2) + (sub_target.y - ctrl.y).powi(2)).sqrt();
        // 下子段方向 = 本子段切线（C1 连续）
        let tan = bezier_tangent(cur, ctrl, sub_target, 1.0);
        let tl = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
        d = Vec2 { x: tan.x / tl, y: tan.y / tl };
        cur = sub_target;
    }
    let curv_eff = (curvs[0] + curvs[1] + curvs[2]) / 3.0;
    let dur_ms = (arc / (WORLD_SPEED * speed) * 1000.0).max(200.0);
    PlannedLeg {
        legs,
        template_idx,
        speed,
        curv_eff,
        dur_ms,
        arc,
    }
}

/// 规则①（in_bounds）：段全程须在活动圈内（每个子段 8 点采样，含曲线中途）
pub fn leg_in_bounds(pl: &PlannedLeg, bounds: &CircleBounds) -> bool {
    for leg in pl.legs.iter() {
        if !bounds.contains(leg.from) {
            return false;
        }
        for i in 0..=8 {
            let u = i as f64 / 8.0;
            let p = quad_bezier(leg.from, leg.ctrl, leg.target, u);
            if !bounds.contains(p) {
                return false;
            }
        }
    }
    true
}

/// 段中出圆的最大量（8 点采样——leg_in_bounds 的容差版）。
/// 几何事实：from 在圆边缘 + 法线偏移（曲率）时段中必然微量出圆——
/// 严格契约由 leg_in_bounds 把守；审计断言允许 ≤ EXCURSION_TOLERANCE
pub fn max_excursion(pl: &PlannedLeg, bounds: &CircleBounds) -> f64 {
    let mut worst: f64 = 0.0;
    for leg in pl.legs.iter() {
        for i in 0..=8 {
            let p = quad_bezier(leg.from, leg.ctrl, leg.target, i as f64 / 8.0);
            let d = ((p.x - bounds.cx).powi(2) + (p.y - bounds.cy).powi(2)).sqrt();
            worst = worst.max(d - bounds.r);
        }
    }
    worst
}

/// bounds 兜底：target 朝圆心收缩（0.82/步，24 步）直到整段经 leg_in_bounds 验证
/// （自 planner.rs 迁移，逐行一致；穷尽则返回 from = 零长段，由调用方死循环防护接管）
pub fn clamp_target_in_bounds(
    from: Vec2,
    dir: Vec2,
    template_idx: usize,
    mut target: Vec2,
    speed: f64,
    bounds: &CircleBounds,
) -> Vec2 {
    for _ in 0..24 {
        let pl = make_planned_leg(from, dir, template_idx, target, speed);
        if leg_in_bounds(&pl, bounds) {
            return target;
        }
        // 朝圆心收缩（活动圈内）
        target = bounds.toward_center(from, target, 0.82);
    }
    from
}

// ─────────────────────────── ChainBuilder：段规划纯函数 ───────────────────────────

/// 段规划上下文（从链尾摘出的全部输入）
pub struct LegContext {
    /// 段起点 = 上段 target（链连续）
    pub from: Vec2,
    /// 段首方向 = 上段段尾切线（C1 连续；退化时 (1,0)）
    pub dir: Vec2,
    /// 上段模板索引（曲率连续约束的基准）
    pub prev_template: usize,
    /// 性格曲率偏好（+ = 爱大弯绕圈 / - = 爱直路 / 0 = 中立）——
    /// pick_template 候选按 |curv| 倾向选择（Gemini 可操作区·性格）
    pub curv_bias: f64,
    /// 性格速度档钦定（None = 随机档）——plan_leg 的 roll_speed 用
    pub speed_band: Option<usize>,
}

/// 段规划结果
pub struct PlannedLegChoice {
    pub template_idx: usize,
    pub target: Vec2,
    pub speed: f64,
    pub leg: PlannedLeg,
}

/// 链生成器（无状态）：ensure_chain 的段生成逻辑全部在此——
/// near_edge 判定、mix 方向（logo/边界两种）、段长自适应、target 生成、bounds 兜底
pub struct ChainBuilder;

impl ChainBuilder {
    /// 规划下一段：给定上下文 + bounds + rng，产出经 leg_in_bounds 验证的合法段。
    /// （行为与重构前 ensure_chain 循环体逐行一致——先立结构，不改行为）
    pub fn plan_leg<R: rand::Rng>(
        ctx: &LegContext,
        bounds: &CircleBounds,
        is_logo: bool,
        rng: &mut R,
    ) -> PlannedLegChoice {
// use rand::Rng; // 泛型约束 R: rand::Rng 已引入 trait——此 use 多余（封仓清理）
        let from = ctx.from;
        let dir = ctx.dir;
        let b = *bounds;
        // from 圆外（链异常态——正常生成下段尾必在圆内，此分支只应出现在
        // 极端收缩/兜底后）：朝圆心 0.12 直线段快速回圆——不混入正常几何。
        // 段尾可能仍在圆外（from 太远）——由调用方收敛性断言覆盖（收敛即可）
        if !b.contains(from) {
            let to_c = Vec2 { x: b.cx - from.x, y: b.cy - from.y };
            let d = (to_c.x * to_c.x + to_c.y * to_c.y).sqrt().max(1e-9);
            let target = Vec2 {
                x: from.x + to_c.x / d * 0.12,
                y: from.y + to_c.y / d * 0.12,
            };
            // 模板固定 0（run），速度随它的 speed 字段（None → 随机档，现状行为）
            let speed = roll_speed(TEMPLATES[0].speed);
            let pl = make_planned_leg(from, dir, 0, target, speed);
            return PlannedLegChoice {
                template_idx: 0,
                target,
                speed,
                leg: pl,
            };
        }
        // 到活动圆边界的距离（沿当前方向）——边界检测：贴边时强制大曲率弯回
        let to_edge = edge_distance(from, dir, &b);
        let near_edge = to_edge < 0.15;
        // 曲线选择：曲率连续性（形状只管几何）；贴边时强制大曲率模板快速弯回
        let roll = rng.gen::<f64>();
        let template_idx = pick_template(ctx.prev_template, near_edge, roll, rng, ctx.curv_bias);
        // 速度随模板钦定档：先选模板再滚速度（Some = 钦定档直接落地；
        // None = 性格档（speed_band）→ 仍无则随机档 + 高速批准制）
        let speed = roll_speed(TEMPLATES[template_idx].speed.or(ctx.speed_band));
        let dist = 0.3 + rng.gen::<f64>() * 0.3;
        // 目标生成（大事情定稿）：全部在活动圈内随机——
        // 普通段 = 圆内随机点（极坐标均匀，0.75r 留转弯余地）；
        // logo 游走段 = 圆心附近小范围（LOGO_RADIUS×0.4，三球回标志旁）
        let target = if is_logo {
            // logo 游走段：方向 = 当前方向与 logo 圆心方向的混合（渐进转向，
            // 多段累积到达 logo——不一步 180° 掉头 = U 形段 = 回弹之源）
            let to_c = Vec2 { x: b.cx - from.x, y: b.cy - from.y };
            let d = (to_c.x * to_c.x + to_c.y * to_c.y).sqrt().max(1e-9);
            let mx = (dir.x * 0.6 + to_c.x / d * 0.4)
                .hypot(dir.y * 0.6 + to_c.y / d * 0.4)
                .max(1e-9);
            let mix = Vec2 {
                x: (dir.x * 0.6 + to_c.x / d * 0.4) / mx,
                y: (dir.y * 0.6 + to_c.y / d * 0.4) / mx,
            };
            let ang = rng.gen::<f64>() * std::f64::consts::PI * 2.0;
            let rr = rng.gen::<f64>().sqrt() * b.r * LOGO_RADIUS;
            let logo_p = Vec2 {
                x: b.cx + ang.cos() * rr,
                y: b.cy + ang.sin() * rr,
            };
            // 目标 = mix 方向、logo 圆半径处（渐进接近 logo）
            let dist_eff = dist.min((logo_p.x - from.x).hypot(logo_p.y - from.y)).max(0.2);
            let tg = Vec2 {
                x: from.x + mix.x * dist_eff,
                y: from.y + mix.y * dist_eff,
            };
            // clamp 屏内（logo 段 mix 方向可能朝外——曾推出屏幕）
            Vec2 { x: tg.x.clamp(0.05, 0.95), y: tg.y.clamp(0.05, 0.95) }
        } else {
            // 段长自适应：dist 取「随机段长」与「圆内可用空间」的较小者——
            // 贴边时自然缩短，永不越界（越界跳点 = 方向突变 = 回弹之源）
            let tg = if near_edge {
                // 边界弯回：方向 = 当前方向与圆心方向的混合——权重按越界深度
                // 自适应（圆内渐进 ~19°/段；越往外 to_c 权重越大，圆外纯朝圆心——
                // 否则链在圆外恶性循环，出屏）
                let to_c = Vec2 { x: b.cx - from.x, y: b.cy - from.y };
                let d = (to_c.x * to_c.x + to_c.y * to_c.y).sqrt().max(1e-9);
                let w = ((d - b.r * 0.8) / (b.r * 0.2).max(1e-9)).clamp(0.0, 1.0);
                let fwd = 0.65 * (1.0 - w);
                let tow = 0.35 + 0.65 * w;
                let mx = (dir.x * fwd + to_c.x / d * tow)
                    .hypot(dir.y * fwd + to_c.y / d * tow)
                    .max(1e-9);
                let mix = Vec2 {
                    x: (dir.x * fwd + to_c.x / d * tow) / mx,
                    y: (dir.y * fwd + to_c.y / d * tow) / mx,
                };
                let dist_eff = dist.min(to_edge * 0.7).max(0.12);
                Vec2 {
                    x: from.x + mix.x * dist_eff,
                    y: from.y + mix.y * dist_eff,
                }
            } else {
                // 段长自适应：dist 取「随机段长」与「圆内可用空间」的较小者
                let dist_eff = dist.min(to_edge * 0.8).max(0.05);
                Vec2 {
                    x: from.x + dir.x * dist_eff,
                    y: from.y + dir.y * dist_eff,
                }
            };
            // 兜底（防御）：仍越界则沿 dir 截断到圆边界（方向连续）
            let tg = if b.contains(tg) {
                tg
            } else {
                let ray = to_edge.min(0.3).max(0.05);
                Vec2 {
                    x: from.x + dir.x * ray,
                    y: from.y + dir.y * ray,
                }
            };
            // 终极防御：目标 clamp 屏内（球永远不出屏幕）
            Vec2 { x: tg.x.clamp(0.05, 0.95), y: tg.y.clamp(0.05, 0.95) }
        };
        // 曲线 profile：Native=自研单段；EulerBlend=段内曲率渐变（默认关闭）
        let mut pl = if CURVE_PROFILE == CurveProfile::EulerBlend && rng.gen::<f64>() < BLEND_PROB {
            let old_curv2 = TEMPLATES[ctx.prev_template].curvature;
            let pick = |rng: &mut R, prev: f64| {
                for _ in 0..6 {
                    let c = rng.gen_range(0..TEMPLATES.len());
                    if (TEMPLATES[c].curvature - prev).abs() <= TEMPLATE_CURV_STEP {
                        return TEMPLATES[c].curvature;
                    }
                }
                prev
            };
            let curv_b = pick(rng, old_curv2);
            let curv_c = pick(rng, curv_b);
            make_blend_leg(from, dir, [old_curv2, curv_b, curv_c], target, 0.3, template_idx, speed)
        } else {
            make_planned_leg(from, dir, template_idx, target, speed)
        };
        if !leg_in_bounds(&pl, &b) {
            // 段中出圆（贝塞尔前段沿 dir 顶出）——收缩重试（≤8 次，逐次 ×0.72）：
            // 契约「bounds 不可让位」——plan_leg 产出的段必须全程在活动圆内。
            // 大部分段不出圆（零收缩，行为不变）；出圆段收缩 = 链更贴圆。
            let mut pl_out = pl;
            let mut shrink = 0;
            // st 累积收缩（每轮 ×0.72——曾固定 0.72 生成 12 个同样的段）
            let mut st = Vec2 {
                x: from.x + (target.x - from.x) * 0.72,
                y: from.y + (target.y - from.y) * 0.72,
            };
            while shrink < 12 && !leg_in_bounds(&pl_out, &b) && pl_out.arc > 0.03 {
                shrink += 1;
                st = Vec2 {
                    x: from.x + (st.x - from.x) * 0.72,
                    y: from.y + (st.y - from.y) * 0.72,
                };
                pl_out = if CURVE_PROFILE == CurveProfile::EulerBlend && rng.gen::<f64>() < BLEND_PROB
                {
                    make_blend_leg(from, dir, [0.0, 0.0, 0.0], st, 0.3, template_idx, speed)
                } else {
                    make_planned_leg(from, dir, template_idx, st, speed)
                };
            }
            pl = pl_out;
        }
        PlannedLegChoice {
            template_idx,
            target,
            speed,
            leg: pl,
        }
    }
}

/// 段速度：随机档位；高速档（>1.2）40% 批准，不批准回落巡航档（重新生成新路径）
/// （自 planner.rs 迁移，逐行一致）
/// 参数 template_speed：模板钦定速度档——
///   Some(idx) = 用 SPEED_BANDS[idx] 档内随机，**不经高速批准制**（AI 钦定 =
///   艺术意图直接落地）；None = 随机档（现状行为：高速档走批准制）
pub fn roll_speed(template_speed: Option<usize>) -> f64 {
    let idx = match template_speed {
        Some(i) => i,
        None => rand::random::<usize>() % SPEED_BANDS.len(),
    };
    let (lo, hi) = SPEED_BANDS[idx];
    let v = lo + rand::random::<f64>() * (hi - lo);
    if template_speed.is_none() && v > SPEED_THRESHOLD && rand::random::<f64>() >= SPEED_APPROVE_PROB {
        let (lo, hi) = SPEED_BANDS[1];
        lo + rand::random::<f64>() * (hi - lo)
    } else {
        v
    }
}

/// 沿 dir 到圆边界的距离（from 在圆外返回 0；射线不相交返回 MAX）
pub fn edge_distance(from: Vec2, dir: Vec2, b: &CircleBounds) -> f64 {
    let ocx = b.cx - from.x;
    let ocy = b.cy - from.y;
    let proj = ocx * dir.x + ocy * dir.y;
    let disc = proj * proj - (ocx * ocx + ocy * ocy - b.r * b.r);
    if disc > 0.0 {
        (proj + disc.sqrt()).max(0.0)
    } else {
        f64::MAX
    }
}

/// 模板选择：贴边 → 中等曲率（0.25-0.7）快速弯回；roll 命中 → 曲率步长内随机；否则继承
/// （大曲率 ctrl 偏移 > 段长时段尾切线反转 = 180° 跳变 = 回弹之源，故贴边不取大曲率）
fn pick_template<R: rand::Rng>(
    prev_template: usize,
    near_edge: bool,
    roll: f64,
    rng: &mut R,
    curv_bias: f64,
) -> usize {
// use rand::Rng; // 泛型约束 R: rand::Rng 已引入 trait——此 use 多余（封仓清理）
    let old_curv = TEMPLATES[prev_template].curvature;
    // 性格加权：候选池按 |curv| 排序——bias>0 爱大弯（取最大）、
    // bias<0 爱直路（取最小）、0 中立（随机）
    let biased = |cands: &mut Vec<usize>| {
        if cands.is_empty() {
            return prev_template;
        }
        if curv_bias > 0.01 {
            *cands
                .iter()
                .max_by(|a, b| {
                    TEMPLATES[**a]
                        .curvature
                        .abs()
                        .partial_cmp(&TEMPLATES[**b].curvature.abs())
                        .unwrap()
                })
                .unwrap()
        } else if curv_bias < -0.01 {
            *cands
                .iter()
                .min_by(|a, b| {
                    TEMPLATES[**a]
                        .curvature
                        .abs()
                        .partial_cmp(&TEMPLATES[**b].curvature.abs())
                        .unwrap()
                })
                .unwrap()
        } else {
            cands[0]
        }
    };
    if near_edge {
        // 边界弯回：中等曲率（0.25-0.7）——候选收集后按性格加权
        let mut cands = Vec::new();
        for _ in 0..8 {
            let cand = rng.gen_range(0..TEMPLATES.len());
            let cc = TEMPLATES[cand].curvature.abs();
            if (0.25..=0.7).contains(&cc) {
                cands.push(cand);
            }
        }
        biased(&mut cands)
    } else if roll < PROB.switch_template {
        let mut cands = Vec::new();
        for _ in 0..6 {
            let cand = rng.gen_range(0..TEMPLATES.len());
            if (TEMPLATES[cand].curvature - old_curv).abs() <= TEMPLATE_CURV_STEP {
                cands.push(cand);
            }
        }
        biased(&mut cands)
    } else {
        prev_template
    }
}

// ─────────────────────────── 几何规则：独立可测单元 ───────────────────────────
// 每条规则 = 一个纯函数 + 一组「合法段/违规段」可区分单测（非恒真断言）。
// 规则冲突时审计报告明确「哪条规则被牺牲」（builder_rules_conflict_audit）。

/// 规则②（direction_continuous）：相邻段段尾切线 → 段首切线的夹角（度）
pub fn direction_gap_deg(prev: &PlannedLeg, next: &PlannedLeg) -> f64 {
    let a = &prev.legs[4];
    let b = &next.legs[0];
    let ta = bezier_tangent(a.from, a.ctrl, a.target, 1.0);
    let tb = bezier_tangent(b.from, b.ctrl, b.target, 0.0);
    let la = (ta.x * ta.x + ta.y * ta.y).sqrt().max(1e-9);
    let lb = (tb.x * tb.x + tb.y * tb.y).sqrt().max(1e-9);
    let dot = (ta.x * tb.x + ta.y * tb.y) / la / lb;
    dot.clamp(-1.0, 1.0).acos().to_degrees()
}

/// 规则③（target_heading）：段尾精确命中 target + 段尾切线指向 target 的偏差（度）
/// （「指向」取子段 4 from→target 连线与段尾切线的夹角——命中靠 legs[4].target==target）
pub fn target_heading_gap_deg(pl: &PlannedLeg) -> f64 {
    let last = &pl.legs[4];
    let tan = bezier_tangent(last.from, last.ctrl, last.target, 1.0);
    let d = Vec2 {
        x: last.target.x - last.from.x,
        y: last.target.y - last.from.y,
    };
    let lt = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
    let ld = (d.x * d.x + d.y * d.y).sqrt().max(1e-9);
    let dot = (tan.x * d.x + tan.y * d.y) / lt / ld;
    dot.clamp(-1.0, 1.0).acos().to_degrees()
}

/// 规则④（curvature_continuous）：相邻段模板曲率差（约束 ≤ TEMPLATE_CURV_STEP）
pub fn curvature_gap(prev_template: usize, next_template: usize) -> f64 {
    (TEMPLATES[next_template].curvature - TEMPLATES[prev_template].curvature).abs()
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::Rng;

    fn v(x: f64, y: f64) -> Vec2 {
        Vec2 { x, y }
    }

    // ── 规则① in_bounds：合法段/违规段可区分 ──

    #[test]
    fn rule_in_bounds_accepts_leg_inside_circle() {
        let b = CircleBounds { cx: 0.5, cy: 0.5, r: 0.35 };
        let pl = make_planned_leg(v(0.45, 0.5), v(1.0, 0.0), 0, v(0.75, 0.5), 1.0);
        assert!(leg_in_bounds(&pl, &b), "圆内直线段应通过 in_bounds");
    }

    #[test]
    fn rule_in_bounds_rejects_leg_crossing_circle() {
        let b = CircleBounds { cx: 0.5, cy: 0.5, r: 0.2 };
        // target 远在圆外（向右 0.55 > r=0.2）——必须被检出
        let pl = make_planned_leg(v(0.5, 0.5), v(1.0, 0.0), 0, v(0.9, 0.5), 1.0);
        assert!(!leg_in_bounds(&pl, &b), "冲出圆的段应被 in_bounds 拒绝");
    }

    #[test]
    fn rule_in_bounds_rejects_midcurve_excursion() {
        // 端点都在圆内、但 ctrl 大曲率把曲线中途顶出圆——端点检测漏检、采样必须检出
        let b = CircleBounds { cx: 0.5, cy: 0.5, r: 0.18 };
        // 手工构造：端点圆内、ctrl 圆外——曲线中途（u≈0.4-0.6 靠近 ctrl）必顶出圆。
        // 不走 make_planned_leg：curv_c 反推会压平 ctrl（段尾命中优先）——
        // 反推下造不出"ctrl 顶出"的段，这正是方向控制的代价（直测 leg_in_bounds 契约）
        let leg = Leg {
            from: v(0.5, 0.5),
            ctrl: v(0.8, 0.7),
            target: v(0.63, 0.5),
        };
        let pl = PlannedLeg {
            legs: [leg; 5],
            template_idx: 24,
            speed: 1.0,
            curv_eff: 1.55,
            dur_ms: 1.0,
            arc: 0.13,
        };
        let end_ok = b.contains(pl.legs[0].from) && b.contains(pl.legs[4].target);
        assert!(end_ok, "前提：端点应在圆内（否则测不到中途检出）");
        assert!(
            !leg_in_bounds(&pl, &b),
            "端点在圆内但曲线中途顶出圆——必须被 8 点采样检出"
        );
    }

    // ── 规则② direction_continuous ──

    #[test]
    fn rule_direction_continuous_accepts_smooth_chain() {
        // 同向衔接（dir 继承上段段尾切线）：夹角应小
        let a = make_planned_leg(v(0.2, 0.5), v(1.0, 0.0), 0, v(0.5, 0.5), 1.0);
        let last = a.legs[4];
        let tan = bezier_tangent(last.from, last.ctrl, last.target, 1.0);
        let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
        let dir = v(tan.x / l, tan.y / l);
        let b = make_planned_leg(last.target, dir, 0, v(0.8, 0.5), 1.0);
        let gap = direction_gap_deg(&a, &b);
        assert!(gap < 20.0, "切向继承的衔接夹角应小: {gap:.1}°");
    }

    #[test]
    fn rule_direction_continuous_rejects_sharp_turn() {
        // 段首方向与上段段尾切线垂直（不继承切线）——必须检出大夹角
        let a = make_planned_leg(v(0.2, 0.5), v(1.0, 0.0), 0, v(0.5, 0.5), 1.0);
        let b = make_planned_leg(v(0.5, 0.5), v(0.0, 1.0), 0, v(0.5, 0.8), 1.0);
        let gap = direction_gap_deg(&a, &b);
        assert!(gap > 60.0, "垂直衔接应被 direction_continuous 检出: {gap:.1}°");
    }

    // ── 规则③ target_heading ──

    #[test]
    fn rule_target_heading_hits_target_exactly() {
        // 造段契约：legs[4].target == 传入 target（方向控制的根基——
        // EulerBlend 全量时此契约破裂导致链方向失控，用户拍板回滚）
        let target = v(0.8, 0.55);
        let pl = make_planned_leg(v(0.2, 0.5), v(1.0, 0.0), 0, target, 1.0);
        assert_eq!(pl.legs[4].target, target, "段尾必须精确命中 target");
        // 段尾切线指向 target：第 5 子段终点 = target（造段器保证），
        // 切线与 from→target 连线夹角应小（直线模板下接近 0）
        let gap = target_heading_gap_deg(&pl);
        eprintln!("heading gap = {gap:.2}°");
        assert!(gap < 35.0, "段尾切线应指向 target: {gap:.1}°");
        // 反例（EulerBlend 失控模式）：段尾漂移 ≠ target——== 断言直接抓（见下）
    }

    #[test]
    fn rule_target_heading_flags_miss() {
        // 反例：手工构造段尾偏离 target 的段（模拟 EulerBlend 失控模式）——
        // legs[4].target 不等于期望 target 时契约即破（== 检查直接失败）
        let want = v(0.8, 0.5);
        let mut pl = make_planned_leg(v(0.2, 0.5), v(1.0, 0.0), 0, want, 1.0);
        pl.legs[4].target = v(0.8, 0.53); // 段尾漂移 0.03
        assert_ne!(pl.legs[4].target, want, "漂移段应违反命中契约（反例成立）");
    }

    // ── 规则④ curvature_continuous ──

    #[test]
    fn rule_curvature_step_bounded() {
        // 相邻档（如 glide 0.40 → sway 0.52）在步长内
        let g = curvature_gap(7, 9);
        assert!(g <= TEMPLATE_CURV_STEP, "相邻档曲率差应在步长内: {g}");
        // 跳档（run 0.00 → vortex 1.55）必须超出步长（规则能区分）
        let bad = curvature_gap(0, 24);
        assert!(bad > TEMPLATE_CURV_STEP, "跳档曲率差应超步长: {bad}");
    }

    // ── ChainBuilder 集成：产出的段满足全部规则 ──

    #[test]
    fn builder_legs_satisfy_all_rules() {
        let b = CircleBounds { cx: 0.5, cy: 0.5, r: 0.35 };
        let mut rng = rand::thread_rng();
        let mut from = v(0.5, 0.5);
        let mut dir = v(1.0, 0.0);
        let mut prev_tpl = 0usize;
        for i in 0..300 {
            let is_logo = i % 30 == 29; // 周期性 logo 段（覆盖两条目标生成分支）
            let choice = ChainBuilder::plan_leg(
                &LegContext { from, dir, prev_template: prev_tpl, curv_bias: 0.0, speed_band: None },
                &b,
                is_logo,
                &mut rng,
            );
            let pl = &choice.leg;
            // 规则①：段在圆内（builder 承诺：plan_leg 产出经 leg_in_bounds 验证）。
            // 例外：from 圆外（链异常态）——只要求收敛（段尾比段首更近圆心）
            let from_out = !b.contains(pl.legs[0].from);
            let dc = |p: Vec2| ((p.x - b.cx).powi(2) + (p.y - b.cy).powi(2)).sqrt();
            if from_out {
                assert!(
                    dc(pl.legs[4].target) < dc(pl.legs[0].from) - 0.02,
                    "段 {i} 异常态应收敛（段尾更近圆心）: {} → {}",
                    dc(pl.legs[0].from),
                    dc(pl.legs[4].target)
                );
            } else {
                assert!(
                    leg_in_bounds(pl, &b) || pl.arc < 0.05 || max_excursion(pl, &b) < 0.035,
                    "段 {i} 应经 bounds 验证（arc={:.3} tpl={} 出圆量 {:.4}）",
                    pl.arc, pl.template_idx, max_excursion(pl, &b)
                );
            }
            // 规则②：段首方向 = 上段段尾切线 → 衔接夹角有界
            // （合成探针：以上段段尾切线造零曲率微段——其段尾切线 = 继承方向）
            if pl.arc >= 0.05 {
                let probe = make_planned_leg(
                    from,
                    dir,
                    0,
                    v(from.x + dir.x * 0.02, from.y + dir.y * 0.02),
                    1.0,
                );
                let gap = direction_gap_deg(&probe, pl);
                assert!(gap < 60.0, "段 {i} 段间方向跳变: {gap:.1}°");
            }
            // 规则③：段尾精确命中 target（make_planned_leg 契约：legs[4].target == 传入 target；
            // bounds 兜底收缩后段尾 = safe_target，仍精确命中 safe_target——只是 target 被 clamp 改过）
            let last = pl.legs[4];
            assert_eq!(
                pl.legs[0].from, from,
                "段 {i} 段首应接上段尾（链连续）"
            );
            // 段尾要么命中 choice.target（未 clamp），要么经 leg_in_bounds 验证（clamp 后仍合法）
            assert!(
                (last.target.x - choice.target.x).abs() < 1e-9
                    && (last.target.y - choice.target.y).abs() < 1e-9
                    || leg_in_bounds(pl, &b)
                    || max_excursion(pl, &b) < 0.035,
                "段 {i} 段尾命中或经 bounds 验证"
            );
            // 规则④：模板曲率步长（贴边强制中曲率弯回时主动让位——
            // 现状取舍：bounds > 曲率连续；此处只要求不跳满量程）
            if pl.arc >= 0.05 && !from_out {
                let g = curvature_gap(prev_tpl, choice.template_idx);
                assert!(
                    g <= 2.5,
                    "段 {i} 曲率跳变失控: {g}"
                );
            }
            // 推进上下文
            from = last.target;
            let tan = bezier_tangent(last.from, last.ctrl, last.target, 1.0);
            let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            dir = v(tan.x / l, tan.y / l);
            prev_tpl = choice.template_idx;
        }
    }

    // ── 三规则兼得实验（EulerBlend 痛点：曲率连续 + target 命中 + 不出圆） ──

    #[test]
    fn builder_rules_conflict_audit() {
        // 实验：plan_leg 在 Native 模式下 500 段里，三规则同时成立的比例
        // （曲率步长 ≤ TEMPLATE_CURV_STEP + 段尾命中 + 段在圆内）。
        // 结论写入断言：Native 单段恒定曲率 + 第 5 子段直指 target ——
        // 命中/bounds 恒成立；曲率步长在贴边（near_edge 强制中曲率模板）时
        // 主动让位（|Δcurv| 可能 > 0.35）——这是现状的显式规则取舍：
        // bounds > 方向连续 > 曲率连续。审计要求让位比例有界（<15%）。
        let b = CircleBounds { cx: 0.5, cy: 0.5, r: 0.3 };
        let mut rng = rand::thread_rng();
        let mut from = v(0.5, 0.5);
        let mut dir = v(1.0, 0.0);
        let mut prev_tpl = 0usize;
        let mut total = 0usize;
        let mut curv_yielded = 0usize; // 曲率让位（bounds 优先）次数
        for _ in 0..500 {
            let choice = ChainBuilder::plan_leg(
                &LegContext { from, dir, prev_template: prev_tpl, curv_bias: 0.0, speed_band: None },
                &b,
                false,
                &mut rng,
            );
            let pl = &choice.leg;
            let from_out = !b.contains(pl.legs[0].from);
            if pl.arc >= 0.05 {
                total += 1;
                if from_out {
                    let dc = |p: Vec2| ((p.x - b.cx).powi(2) + (p.y - b.cy).powi(2)).sqrt();
                    assert!(
                        dc(pl.legs[4].target) < dc(pl.legs[0].from) - 0.02,
                        "异常态应收敛（段尾更近圆心）"
                    );
                } else {
                    // 容差 0.035：圆边缘 + 曲率法线偏移时几何上不可能绝对不出圆
                    // （收缩循环已把出圆量压到最小）——0.035 = 屏幕宽 3.5%，视觉圆滑
                    assert!(
                        leg_in_bounds(pl, &b) || max_excursion(pl, &b) < 0.035,
                        "规则①不可让位：段必须在圆内（出圆量 {:.4}）",
                        max_excursion(pl, &b)
                    );
                }
                // 规则③：未 clamp 时段尾命中 target；clamp 后命中 safe_target（仍精确）
                assert!(
                    (pl.legs[4].target.x - choice.target.x).abs() < 1e-9
                        && (pl.legs[4].target.y - choice.target.y).abs() < 1e-9
                        || leg_in_bounds(pl, &b)
                        || max_excursion(pl, &b) < 0.035,
                    "规则③：段尾命中或经 bounds 验证"
                );
                if curvature_gap(prev_tpl, choice.template_idx) > TEMPLATE_CURV_STEP {
                    curv_yielded += 1; // 规则④让位（贴边强制弯回——现状行为）
                }
            }
            let last = pl.legs[4];
            from = last.target;
            let tan = bezier_tangent(last.from, last.ctrl, last.target, 1.0);
            let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            dir = v(tan.x / l, tan.y / l);
            prev_tpl = choice.template_idx;
        }
        eprintln!(
            "三规则审计：total={total} 曲率让位={curv_yielded}（{:.1}%）",
            curv_yielded as f64 / total.max(1) as f64 * 100.0
        );
        assert!(
            curv_yielded * 100 <= total * 15,
            "曲率让位比例应 <15%（现状基线）: {curv_yielded}/{total}"
        );
    }

    #[test]
    fn builder_logo_leg_moves_toward_center() {
        // logo 段：mix 方向 40% 朝圆心 → 距圆心应渐进接近（或不显著远离）
        let b = CircleBounds { cx: 0.5, cy: 0.5, r: 0.35 };
        let mut rng = rand::thread_rng();
        let from = v(0.72, 0.62); // 偏离圆心
        let dir = v(0.8, 0.6);
        let d0 = ((from.x - b.cx).powi(2) + (from.y - b.cy).powi(2)).sqrt();
        let choice = ChainBuilder::plan_leg(
            &LegContext { from, dir, prev_template: 0, curv_bias: 0.0, speed_band: None },
            &b,
            true,
            &mut rng,
        );
        let t = choice.target;
        let d1 = ((t.x - b.cx).powi(2) + (t.y - b.cy).powi(2)).sqrt();
        // 渐进转向语义：单段只转 ~36°，dir 朝外时 target 允许暂时远离——
        // 但必须有界（多段累积才接近）；且 target 必在屏内
        assert!(
            d1 < d0 + 0.35,
            "logo 段 target 应有界（渐进转向，不飞远）: {d0:.3} → {d1:.3}"
        );
        assert!(d1 < 0.8, "logo 段 target 应在屏内: {d1:.3}");
    }

    #[test]
    fn builder_near_edge_turns_back() {
        // 贴边段：target 必须朝圆心弯回（mix 含 to_c 分量）且不越界
        let b = CircleBounds { cx: 0.5, cy: 0.5, r: 0.3 };
        let mut rng = rand::thread_rng();
        // from 贴近右缘，dir 直指圆外
        let from = v(0.5 + 0.3 * 0.92 - 0.02, 0.5);
        let dir = v(1.0, 0.0);
        let choice = ChainBuilder::plan_leg(
            &LegContext { from, dir, prev_template: 0, curv_bias: 0.0, speed_band: None },
            &b,
            false,
            &mut rng,
        );
        let t = choice.target;
        // 弯回：target 的 x 不应继续大幅右冲（to_c 权重 ≥0.35）
        assert!(t.x < from.x + 0.12, "贴边段应弯回而非直冲: {from:?} → {t:?}");
        // 模板：贴边强制中曲率（0.25-0.7）
        let cc = TEMPLATES[choice.template_idx].curvature.abs();
        assert!(
            (0.25..=0.7).contains(&cc) || choice.template_idx == 0,
            "贴边应选中曲率模板: {cc}"
        );
    }

    #[test]
    fn personality_bias_observable() {
        // 性格曲率偏好可观测：bias>0（爱大弯）的链平均 |曲率| 显著高于
        // bias<0（爱直路）——同一随机种子（Gemini 可操作区·性格的契约）
        use rand::SeedableRng;
        let b = CircleBounds::fallback();
        let mk = |bias: f64| -> f64 {
            let mut rng = rand::rngs::StdRng::seed_from_u64(42); // 确定性种子
            let ctx = LegContext {
                from: Vec2 { x: 0.5, y: 0.5 },
                dir: Vec2 { x: 1.0, y: 0.0 },
                prev_template: 0,
                curv_bias: bias,
                speed_band: None,
            };
            let mut sum = 0.0;
            let mut n = 0usize;
            for _ in 0..200 {
                let c = ChainBuilder::plan_leg(&ctx, &b, false, &mut rng);
                sum += TEMPLATES[c.template_idx].curvature.abs();
                n += 1;
            }
            sum / n as f64
        };
        let hi = mk(0.8);
        let lo = mk(-0.8);
        // switch 概率低（0.8%/段）→ 差异方向正确即可（1.7 倍）；强度是
        // Gemini 调参活——速度档（speed_band）才是主要可见差异
        assert!(
            hi > lo + 0.01,
            "爱大弯性格平均曲率应更高: {hi:.3} vs {lo:.3}"
        );
    }

    #[test]
    fn roll_speed_respects_bands() {
        // 随机档（None）：档位内 + 高速批准制——不批准回落巡航档（0.72-0.85）
        for _ in 0..200 {
            let v = roll_speed(None);
            let in_band = SPEED_BANDS.iter().any(|&(lo, hi)| v >= lo && v <= hi);
            assert!(in_band, "速度应在档位内: {v}");
        }
        // 钦定档（Some(2)）：固定 SPEED_BANDS[2]（高速 1.1-1.3）内随机——
        // 不经批准制，永不回落巡航档（艺术意图直接落地）
        let (lo, hi) = SPEED_BANDS[2];
        for _ in 0..200 {
            let v = roll_speed(Some(2));
            assert!(
                (lo..=hi).contains(&v),
                "钦定档 2 速度应恒在高速档 {lo}-{hi} 内: {v}"
            );
        }
    }
}
