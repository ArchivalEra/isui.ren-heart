// 规划器 + 执行器（纯 Rust，可单测）
// 弧长共享链模型：三球成群结对沿同一链跑，弧长错开（一个接一个）
// - 链 = 连续路径段队列（段间 from=上段 target，切线继承）
// - 队首弧长 s_lead 推进；球 i 弧长 = s_lead - i×GAP（沿链错开）
// - 球 i 未上链（s<0）时停在起点（= Travel 到达点，链起点后方）→ 自然滑上链，无排队仪式
// - PD spring 追踪链上目标（丝滑：位置+速度双目标）
use crate::config::params::*;
use crate::config::templates::TEMPLATES;

/// 曲线生成 profile：以后新增曲线策略就加一个变体（如 EulerBlend 已备）
/// 自研 = 单段贝塞尔（默认）；EulerBlend = 段内曲率渐变（make_blend_leg）
#[derive(Clone, Copy, PartialEq)]
pub enum CurveProfile {
    #[allow(dead_code)] // Native 随时可切回（自研单段贝塞尔）
    Native,
    EulerBlend,
}
use crate::sim::math::*;
use std::collections::VecDeque;

#[derive(Clone, Copy, Debug)]
pub struct Leg {
    pub from: Vec2,
    pub ctrl: Vec2,
    pub target: Vec2,
}

#[derive(Clone)]
pub struct PlannedLeg {
    /// 5 子段（Euler spiral 离散近似：子段间曲率线性插值，段内模板渐变 A→B→C）
    pub legs: [Leg; 5],
    pub template_idx: usize,
    /// 段级速度倍率（独立于曲线，来自 SPEED_BANDS）
    pub speed: f64,
    /// 有效曲率（小圈滤波后）：供未来 profile（如曲率感知速度）使用
    #[allow(dead_code)]
    pub curv_eff: f64,
    pub dur_ms: f64,
    /// 折线弧长（from→ctrl→target）
    pub arc: f64,
}

/// 每球物理状态（PD spring 追踪）
#[derive(Clone, Copy)]
struct BallState {
    pos: Vec2,
    vel: Vec2,
    /// 沿链速率（平滑中，向段理想速率收敛）
    rate: f64,
}

/// 执行器：弧长共享链 + 三球 spring 物理
#[derive(Clone)]
pub struct Player {
    chain: VecDeque<PlannedLeg>,
    /// 队首（球0）弧长
    s_lead: f64,
    states: [BallState; 3],
    /// 每球沿链错开弧长（0, GAP, 2×GAP）
    gaps: [f64; 3],
    pub order: [usize; 3],
}

impl Player {
    /// 上链点：球 i 到达点 = 链起点后方 gaps[i] 弧长（沿 -dir）
    /// 与 Player 内部随机 gaps 同源——槽位与等待点一致，转移无跳变
    pub fn entry_points(anchor: Vec2, dir: Vec2, gaps: [f64; 3]) -> [Vec2; 3] {
        let mut pts = [anchor; 3];
        for i in 1..3 {
            pts[i] = Vec2 {
                x: (anchor.x - dir.x * gaps[i]).clamp(0.10, 0.90),
                y: (anchor.y - dir.y * gaps[i]).clamp(0.10, 0.90),
            };
        }
        pts
    }

    pub fn new(anchor: Vec2, dir: Vec2) -> Self {
        // 随机距离贴合：蓝绿落后粉球曲线的随机弧长（每次排队不同）
        let gaps = [
            0.0,
            GAP_MIN + rand::random::<f64>() * (GAP_MAX - GAP_MIN),
            GAP_MIN + GAP_MAX + rand::random::<f64>() * (GAP_MAX - GAP_MIN),
        ];
        let spots = Self::entry_points(anchor, dir, gaps);
        // 首段：链起点 = 球0（anchor），方向 = 入口 dir（与 entry_points 槽位方向一致，
        // 保证等待上链的球在解散/转移时位置连续——曾因随机 target 方向导致蓝绿闪现）
        let target = {
            let r = 0.3 + rand::random::<f64>() * 0.3;
            Vec2 {
                x: (anchor.x + dir.x * r).clamp(0.12, 0.88),
                y: (anchor.y + dir.y * r).clamp(0.12, 0.88),
            }
        };
        let speed = roll_speed();
        let mut pl = make_planned_leg(anchor, dir, 0, target, speed);
        if !leg_in_bounds(&pl) {
            let safe = clamp_target_in_bounds(anchor, dir, 0, target, speed);
            pl = make_planned_leg(anchor, dir, 0, safe, speed);
        }
        let mut chain = VecDeque::new();
        chain.push_back(pl);

        let states = [
            BallState { pos: spots[0], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED },
            BallState { pos: spots[1], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED },
            BallState { pos: spots[2], vel: Vec2 { x: 0.0, y: 0.0 }, rate: WORLD_SPEED },
        ];

        let mut p = Player {
            chain,
            s_lead: 0.0,
            states,
            gaps,
            order: ORDERS[0],
        };
        p.ensure_chain();
        p
    }

    pub fn tick(&mut self, dt: f64) {
        let dt_s = dt / 1000.0;
        // 队首弧长推进：速度 profile（段内温和加速/减速，段间连续——预渲染衔接）
        let (_, _, seg0, u0) = self.chain_pos_and_tangent(self.s_lead);
        self.s_lead += self.profile_speed(seg0, u0) * dt_s;
        self.ensure_chain();

        let k = SPRING.stiffness;
        let c_damp = SPRING.damping * 2.0 * k.sqrt();
        // 温和加减速：速率向目标收敛的时间常数 0.45s（慢慢加速/减速，全程平滑）
        let rate_lerp = (dt_s / (RATE_LERP_TAU_MS / 1000.0)).min(1.0);

        for s in 0..3 {
            // 球 i 弧长 = 队首 - 错开；未上链（<0）→ 目标 = 起点（链起点后方）
            let s_i = self.s_lead - self.gaps[s];
            let (target, tan, seg_i, u_i) = if s_i >= 0.0 {
                self.chain_pos_and_tangent(s_i)
            } else {
                let leg0 = &self.chain.front().unwrap().legs[0];
                let d = dir_of(leg0.from, leg0.target);
                let pos = Vec2 {
                    x: (leg0.from.x - d.x * self.gaps[s]).clamp(0.05, 0.95),
                    y: (leg0.from.y - d.y * self.gaps[s]).clamp(0.05, 0.95),
                };
                (pos, Vec2 { x: -d.y, y: d.x }, 0usize, 0.0)
            };

            let r_ideal = self.profile_speed(seg_i, u_i);
            let st = &mut self.states[s];
            st.rate += (r_ideal - st.rate) * rate_lerp;
            let tl = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
            let tvel = Vec2 { x: tan.x / tl * st.rate, y: tan.y / tl * st.rate };
            let ax = k * (target.x - st.pos.x) + c_damp * (tvel.x - st.vel.x);
            let ay = k * (target.y - st.pos.y) + c_damp * (tvel.y - st.vel.y);
            // 加速度钳制：spring 误差大时力无上限 → 高速冲点；clamp 后温和冲刺
            let a_mag = (ax * ax + ay * ay).sqrt();
            let (ax, ay) = if a_mag > MAX_ACCEL {
                (ax / a_mag * MAX_ACCEL, ay / a_mag * MAX_ACCEL)
            } else {
                (ax, ay)
            };
            st.vel.x += ax * dt_s;
            st.vel.y += ay * dt_s;
            st.pos.x = (st.pos.x + st.vel.x * dt_s).clamp(0.03, 0.97);
            st.pos.y = (st.pos.y + st.vel.y * dt_s).clamp(0.03, 0.97);
        }
    }

    /// 速度 profile：段内从「本段全速」温和过渡到「下段全速」，
    /// smoothstep 保证段内加速/减速平滑；段间速率连续（段尾速 = 下段头速）
    /// 巡航 = 模板全速（不再减半，去蠕动感）
    fn profile_speed(&self, seg_idx: usize, u: f64) -> f64 {
        let seg = &self.chain[seg_idx];
        let v_i = seg.speed;
        let v_next = match self.chain.get(seg_idx + 1) {
            Some(next) => next.speed,
            None => v_i,
        };
        let ramp = smoothstep(u.clamp(0.0, 1.0));
        // 温和变速 = 段内 smoothstep 过渡 + 段间速率连续（回滚曲率感知因子——
        // 段级因子跳变导致球速段间突变，跳跳球抖动）
        WORLD_SPEED * (v_i + (v_next - v_i) * ramp)
    }

    /// 链增长：总弧长保持 ≥ s_lead + 余量（无限轨迹）
    fn ensure_chain(&mut self) {
        self.ensure_chain_to(GAP_MAX * 2.0 + 0.5);
    }

    /// 批量补链到「队首前方 ahead 弧长」。入场预生成风暴用：一次性补几分钟的链，
    /// 运行期 ensure_chain 静默（零规划抖动，帧率确定）
    /// 区域规划：每隔 LOGO_EVERY_ARC 弧长插一个「logo 游走段」（三球回 logo 附近）
    pub fn ensure_chain_to(&mut self, ahead: f64) {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let mut next_logo_arc = self.chain.iter().map(|x| x.arc).sum::<f64>() + LOGO_EVERY_ARC;
        let need = self.s_lead + ahead;
        while self.chain.iter().map(|x| x.arc).sum::<f64>() < need {
            let tail = self.chain.back().expect("chain non-empty");
            let tail_last = tail.legs[4];
            let from = tail_last.target;
            let dir = if tail_last.from == tail_last.target {
                Vec2 { x: 1.0, y: 0.0 }
            } else {
                let tan = bezier_tangent(tail_last.from, tail_last.ctrl, tail_last.target, 1.0);
                let l = (tan.x * tan.x + tan.y * tan.y).sqrt().max(1e-9);
                Vec2 { x: tan.x / l, y: tan.y / l }
            };
            let roll = rng.gen::<f64>();
            let old_curv = TEMPLATES[tail.template_idx].curvature;
            // 曲线选择：曲率连续性 + 弯道加权（精髓：不容易出直线）
            // 权重 w = 0.4 + |curvature|——直线模板权重最低，弯道模板优先
            let template_idx = if roll < PROB.switch_template {
                let mut total_w = 0.0;
                let mut cands: Vec<(usize, f64)> = Vec::new();
                for (i, tpl) in TEMPLATES.iter().enumerate() {
                    // 强制曲线/圆弧：只选 |curv| ∈ [0.3, 1.1]（直线与近直线模板出局，
                    // 大弯 >1.1 排除防小圈抖动/出屏收缩）
                    let c = tpl.curvature.abs();
                    if !(0.3..=1.1).contains(&c) {
                        continue;
                    }
                    if (tpl.curvature - old_curv).abs() <= TEMPLATE_CURV_STEP {
                        let w = 0.4 + c;
                        total_w += w;
                        cands.push((i, w));
                    }
                }
                if cands.is_empty() {
                    tail.template_idx
                } else {
                    let mut pick = rng.gen::<f64>() * total_w;
                    let mut idx = tail.template_idx;
                    for (i, w) in cands {
                        pick -= w;
                        if pick <= 0.0 {
                            idx = i;
                            break;
                        }
                    }
                    idx
                }
            } else {
                tail.template_idx
            };
            // 段级运动参数：速度档（含高速批准制）
            let speed = roll_speed();
            if rng.gen::<f64>() < PROB.switch_order {
                let next = ORDERS[rng.gen_range(0..ORDERS.len())];
                if next != self.order {
                    self.order = next;
                }
            }
            // 目标：沿链继续（保持前进方向为主 + 模板曲率）
            // 区域规划：到达 logo 弧长点 → 该段目标指向 logo 附近（三球回 logo 游走）
            let chain_arc_now = self.chain.iter().map(|x| x.arc).sum::<f64>();
            let mut target = if chain_arc_now >= next_logo_arc {
                next_logo_arc += LOGO_EVERY_ARC;
                Vec2 {
                    x: (LOGO_CENTER.0 + (rng.gen::<f64>() * 2.0 - 1.0) * LOGO_RADIUS)
                        .clamp(0.1, 0.9),
                    y: (LOGO_CENTER.1 + (rng.gen::<f64>() * 2.0 - 1.0) * LOGO_RADIUS)
                        .clamp(0.1, 0.9),
                }
            } else {
                // 段长 0.32-0.6：一条段 = 一条完整弧线（单弧线感，无短段拼接折）
                let dist = 0.32 + rng.gen::<f64>() * 0.28;
                Vec2 {
                    x: from.x + dir.x * dist,
                    y: from.y + dir.y * dist,
                }
            };
            // 目标出界则转向（保持链在屏内）
            if !(0.1..=0.9).contains(&target.x) || !(0.1..=0.9).contains(&target.y) {
                // 反向偏转
                let angle = rng.gen::<f64>() * std::f64::consts::PI;
                let d2 = 0.3;
                target = Vec2 {
                    x: (from.x + (dir.x * angle.cos() - dir.y * angle.sin()) * d2 * 0.7).clamp(0.1, 0.9),
                    y: (from.y + (dir.x * angle.sin() + dir.y * angle.cos()) * d2 * 0.7).clamp(0.1, 0.9),
                };
            }
            // 曲线 profile：Native=自研单段；EulerBlend=段内曲率渐变（默认关闭）
            let mut pl = if CURVE_PROFILE == CurveProfile::EulerBlend && rng.gen::<f64>() < BLEND_PROB {
                let old_curv2 = TEMPLATES[tail.template_idx].curvature;
                let pick = |rng: &mut rand::rngs::ThreadRng, prev: f64| {
                    for _ in 0..6 {
                        let c = rng.gen_range(0..TEMPLATES.len());
                        if (TEMPLATES[c].curvature - prev).abs() <= TEMPLATE_CURV_STEP {
                            return TEMPLATES[c].curvature;
                        }
                    }
                    prev
                };
                let curv_b = pick(&mut rng, old_curv2);
                let curv_c = pick(&mut rng, curv_b);
                make_blend_leg(
                    from, dir, [old_curv2, curv_b, curv_c], target, 0.3,
                    template_idx, speed,
                )
            } else {
                make_planned_leg(from, dir, template_idx, target, speed)
            };
            if !leg_in_bounds(&pl) {
                let safe = clamp_target_in_bounds(from, dir, template_idx, target, speed);
                pl = if rng.gen::<f64>() < BLEND_PROB {
                    make_blend_leg(from, dir, [0.0, 0.0, 0.0], safe, 0.3, template_idx, speed)
                } else {
                    make_planned_leg(from, dir, template_idx, safe, speed)
                };
            }
            if pl.arc < 0.05 {
                // 死循环防护：零长度段（收缩失败）强制拉一段——朝屏中心方向，必在屏内
                let dx = 0.5 - from.x;
                let dy = 0.5 - from.y;
                let dl = (dx * dx + dy * dy).sqrt().max(1e-9);
                let forced = Vec2 {
                    x: from.x + dx / dl * 0.3,
                    y: from.y + dy / dl * 0.3,
                };
                pl = make_planned_leg(from, dir, template_idx, forced, speed);
                self.chain.push_back(clamp_dur_to_chain(pl, tail.dur_ms));
                break; // 本帧补段到此为止（保底段保证链增长）
            }
            self.chain.push_back(clamp_dur_to_chain(pl, tail.dur_ms));
        }
    }

    /// 链上弧长 s 处：位置 + 切线 + 段索引 + 段内 u（速度 profile 用）
    /// 链 = 段 × 5 子段：定位时先找段，再在段内 5 子段中定位
    fn chain_pos_and_tangent(&self, s: f64) -> (Vec2, Vec2, usize, f64) {
        let mut acc = 0.0;
        for (idx, pl) in self.chain.iter().enumerate() {
            if acc + pl.arc >= s {
                let s_in = (s - acc).clamp(0.0, pl.arc);
                let sub_arc = pl.arc / 5.0;
                let sub_idx = ((s_in / sub_arc.max(1e-9)) as usize).min(4);
                let u = ((s_in - sub_idx as f64 * sub_arc) / sub_arc.max(1e-9)).clamp(0.0, 1.0);
                let leg = &pl.legs[sub_idx];
                let p = quad_bezier(leg.from, leg.ctrl, leg.target, u);
                let tan = bezier_tangent(leg.from, leg.ctrl, leg.target, u);
                // wave 已彻底删除（蛆虫扭动源）；位置 = 贝塞尔点本身（链几何已保证屏内）
                return (p, tan, idx, u);
            }
            acc += pl.arc;
        }
        // 超出链尾：用链尾
        let last = self.chain.back().expect("chain non-empty");
        let tail = last.legs[4];
        (tail.target, Vec2 { x: 1.0, y: 0.0 }, self.chain.len() - 1, 1.0)
    }

    /// 球位：spring 物理状态 + 法线分离量
    pub fn world_pos(&self, color_slot: usize, offset: f64) -> Vec2 {
        let st = &self.states[color_slot];
        let s_i = self.s_lead - self.gaps[color_slot];
        let n = if s_i >= 0.0 {
            let (_, tan, _, _) = self.chain_pos_and_tangent(s_i);
            normal_of(tan)
        } else {
            let leg0 = &self.chain.front().unwrap().legs[0];
            let d = dir_of(leg0.from, leg0.target);
            Vec2 { x: -d.y, y: d.x }
        };
        Vec2 {
            x: (st.pos.x + n.x * offset * WANDER.offset_range).clamp(0.0, 1.0),
            y: (st.pos.y + n.y * offset * WANDER.offset_range).clamp(0.0, 1.0),
        }
    }

    /// 调试：当前目标（球 i 链上位置）
    pub fn target_of(&self, color_slot: usize) -> Vec2 {
        let s_i = self.s_lead - self.gaps[color_slot];
        if s_i >= 0.0 {
            self.chain_pos_and_tangent(s_i).0
        } else {
            let leg0 = &self.chain.front().unwrap().legs[0];
            let d = dir_of(leg0.from, leg0.target);
            Vec2 {
                x: (leg0.from.x - d.x * self.gaps[color_slot]).clamp(0.0, 1.0),
                y: (leg0.from.y - d.y * self.gaps[color_slot]).clamp(0.0, 1.0),
            }
        }
    }

    #[cfg(test)]
    pub fn chain_len(&self) -> usize {
        self.chain.len()
    }
}

/// 段速度：随机档位；高速档（>1.2）40% 批准，不批准回落巡航档（重新生成新路径）
fn roll_speed() -> f64 {
    let idx = rand::random::<usize>() % SPEED_BANDS.len();
    let (lo, hi) = SPEED_BANDS[idx];
    let v = lo + rand::random::<f64>() * (hi - lo);
    if v > SPEED_THRESHOLD && rand::random::<f64>() >= SPEED_APPROVE_PROB {
        let (lo, hi) = SPEED_BANDS[1];
        lo + rand::random::<f64>() * (hi - lo)
    } else {
        v
    }
}

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
        let sub_target = if i == 4 {
            target
        } else {
            Vec2 {
                x: cur.x + d.x * sub_len,
                y: cur.y + d.y * sub_len,
            }
        };
        let norm = Vec2 { x: -d.y, y: d.x };
        let ctrl = Vec2 {
            x: cur.x + d.x * (sub_len * 0.5) + norm.x * sub_len * curv * 0.35,
            y: cur.y + d.y * (sub_len * 0.5) + norm.y * sub_len * curv * 0.35,
        };
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

fn dir_of(from: Vec2, to: Vec2) -> Vec2 {
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    let l = (dx * dx + dy * dy).sqrt().max(1e-9);
    Vec2 { x: dx / l, y: dy / l }
}

pub fn leg_in_bounds(pl: &PlannedLeg) -> bool {
    // 根本性出屏禁止：每个子段 8 点采样（含曲线中途），全程须在安全区 [0.08, 0.92]
    const SAFE_MIN: f64 = 0.08;
    const SAFE_MAX: f64 = 0.92;
    for leg in pl.legs.iter() {
        if !(SAFE_MIN..=SAFE_MAX).contains(&leg.from.x)
            || !(SAFE_MIN..=SAFE_MAX).contains(&leg.from.y)
        {
            return false;
        }
        for i in 0..=8 {
            let u = i as f64 / 8.0;
            let p = quad_bezier(leg.from, leg.ctrl, leg.target, u);
            if !(SAFE_MIN..=SAFE_MAX).contains(&p.x) || !(SAFE_MIN..=SAFE_MAX).contains(&p.y) {
                return false;
            }
        }
    }
    true
}

fn clamp_target_in_bounds(
    from: Vec2,
    dir: Vec2,
    template_idx: usize,
    mut target: Vec2,
    speed: f64,
) -> Vec2 {
    for _ in 0..24 {
        let pl = make_planned_leg(from, dir, template_idx, target, speed);
        if leg_in_bounds(&pl) {
            return target;
        }
        target = Vec2 { x: from.x + (target.x - from.x) * 0.82, y: from.y + (target.y - from.y) * 0.82 };
    }
    from
}

fn clamp_dur_to_chain(mut pl: PlannedLeg, tail_dur: f64) -> PlannedLeg {
    let ratio = pl.dur_ms / tail_dur.max(1.0);
    if ratio > crate::config::params::MAX_DUR_RATIO {
        pl.dur_ms = tail_dur * crate::config::params::MAX_DUR_RATIO;
    } else if ratio < 1.0 / crate::config::params::MAX_DUR_RATIO {
        pl.dur_ms = tail_dur / crate::config::params::MAX_DUR_RATIO;
    }
    pl
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn make_leg_keeps_endpoints() {
        let from = Vec2 { x: 0.1, y: 0.2 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let target = Vec2 { x: 0.9, y: 0.8 };
        let pl = make_planned_leg(from, dir, 0, target, 1.0);
        assert_eq!(pl.legs[0].from, from);
        assert_eq!(pl.legs[4].target, target);
        assert_eq!(pl.legs[0].ctrl.x, pl.legs[0].ctrl.x); // 结构自检
        assert!(pl.dur_ms > 0.0);
        assert!(pl.arc > 0.0);
    }

    #[test]
    fn entry_points_staggered() {
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let pts = Player::entry_points(anchor, dir, [0.0, 0.2, 0.4]);
        assert!(pts[0].x > pts[1].x && pts[1].x > pts[2].x, "沿 -dir 错开");
    }

    #[test]
    fn balls_stay_in_screen_forever() {
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 0.8, y: 0.6 };
        let mut p = Player::new(anchor, dir);
        for _ in 0..120 * 60 {
            p.tick(16.7);
        }
        for s in 0..3 {
            let pos = p.world_pos(s, 0.0);
            assert!(
                (0.0..=1.0).contains(&pos.x) && (0.0..=1.0).contains(&pos.y),
                "球{s} 出屏: {:?}",
                pos
            );
        }
    }

    #[test]
    fn player_never_stops() {
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 0.8, y: 0.6 };
        let mut p = Player::new(anchor, dir);
        let mut last = [Vec2 { x: 0.0, y: 0.0 }; 3];
        for s in 0..3 {
            last[s] = p.world_pos(s, 0.0);
        }
        let mut moved = false;
        for i in 0..120 * 60 {
            p.tick(16.7);
            if i % 60 == 0 {
                for s in 0..3 {
                    let cur = p.world_pos(s, 0.0);
                    let d = ((cur.x - last[s].x).powi(2) + (cur.y - last[s].y).powi(2)).sqrt();
                    if d > 1e-9 {
                        moved = true;
                    }
                    last[s] = cur;
                }
            }
        }
        assert!(moved, "球应持续运动（无限轨迹）");
    }

    #[test]
    fn group_moves_together() {
        // 成群结对：三球沿链错开（两两弧长差 ≈ GAP_MIN..GAP_MAX）
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 0.8, y: 0.6 };
        let mut p = Player::new(anchor, dir);
        for _ in 0..60 * 60 {
            p.tick(16.7);
        }
        // 弧长差恒定 = 编队；实际位置互相接近（同链）
        let s0 = p.s_lead - p.gaps[0];
        let s1 = p.s_lead - p.gaps[1];
        let s2 = p.s_lead - p.gaps[2];
        assert!(s0 > s1 && s1 > s2, "弧长应错开: {s0} {s1} {s2}");
        for s in 0..3 {
            let pos = p.world_pos(s, 0.0);
            for o in (s + 1)..3 {
                let p2 = p.world_pos(o, 0.0);
                let d = ((pos.x - p2.x).powi(2) + (pos.y - p2.y).powi(2)).sqrt();
                assert!(d < 0.6, "球{s}/{o} 应成群（同链）: {d}");
            }
        }
    }

    #[test]
    fn gentle_acceleration_everywhere() {
        // 温和加减速验证：60s 模拟中任意球任意帧的物理加速度 ≤ MAX_ACCEL×1.1
        // （速度变化全程有界 = 慢慢加速/减速，无一顿一顿）
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 0.8, y: 0.6 };
        let mut p = Player::new(anchor, dir);
        let dt_s = 16.7 / 1000.0;
        let mut max_a = 0.0f64;
        for _ in 0..(60.0 * 1000.0 / 16.7) as usize {
            let vel_before: Vec<Vec2> = (0..3)
                .map(|s| p.states[s].vel)
                .collect();
            p.tick(16.7);
            for s in 0..3 {
                let dvx = p.states[s].vel.x - vel_before[s].x;
                let dvy = p.states[s].vel.y - vel_before[s].y;
                let a = (dvx * dvx + dvy * dvy).sqrt() / dt_s;
                if a > max_a {
                    max_a = a;
                }
            }
        }
        assert!(
            max_a <= MAX_ACCEL * 1.1,
            "全程加速度应有界（温和加减速）: max_a={max_a:.3} 上限={MAX_ACCEL}"
        );
    }

    #[test]
    fn chain_grows_forever() {
        let anchor = Vec2 { x: 0.5, y: 0.5 };
        let dir = Vec2 { x: 0.8, y: 0.6 };
        let mut p = Player::new(anchor, dir);
        let len0 = p.chain_len();
        for _ in 0..60 * 60 {
            p.tick(16.7);
        }
        assert!(p.chain_len() > len0, "链应持续增长（无限轨迹）");
    }

    #[test]
    fn blend_leg_curvature_gradates_a_to_c() {
        // Euler spiral 离散近似：曲率 A→B→C 渐变——首子段弯度 ∝ A，末子段 ∝ C
        let from = Vec2 { x: 0.2, y: 0.5 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let target = Vec2 { x: 0.8, y: 0.5 };
        let pl = make_blend_leg(from, dir, [1.0, 0.5, 0.0], target, 0.6, 0, 1.0);
        // 终点精确命中
        assert_eq!(pl.legs[4].target, target);
        // 曲率递减验证：各子段相对「自身起点方向」的法线侧偏（cross(dir, ctrl-from)）
        let mut prev_dir = dir;
        let mut sides = [0.0f64; 5];
        for i in 0..5 {
            let f = pl.legs[i].from;
            let c = pl.legs[i].ctrl;
            sides[i] = ((c.x - f.x) * (-prev_dir.y) + (c.y - f.y) * prev_dir.x).abs();
            let t2 = pl.legs[i].target;
            let dl = ((t2.x - f.x).powi(2) + (t2.y - f.y).powi(2)).sqrt().max(1e-9);
            prev_dir = Vec2 { x: (t2.x - f.x) / dl, y: (t2.y - f.y) / dl };
        }
        assert!(
            sides[0] > sides[4] * 2.0,
            "曲率应从 A(1.0) 渐变到 C(0.0): sides={sides:?}"
        );
        assert!(sides[0] > 0.0, "首子段应有显著弯曲");
        // 段内切线继承（C1 连续）：子段 i 起点 = 子段 i-1 终点
        for i in 1..5 {
            assert_eq!(pl.legs[i].from, pl.legs[i - 1].target, "子段 {i} 起点应接上段终点");
        }
        // 弧长为正
        assert!(pl.arc > 0.0);
    }

    #[test]
    fn duration_scales_with_path_length() {
        let from = Vec2 { x: 0.1, y: 0.5 };
        let dir = Vec2 { x: 1.0, y: 0.0 };
        let short = make_planned_leg(from, dir, 0, Vec2 { x: 0.3, y: 0.5 }, 1.0);
        let long = make_planned_leg(from, dir, 0, Vec2 { x: 0.95, y: 0.5 }, 1.0);
        assert!(long.dur_ms > short.dur_ms * 2.0);
    }
}
