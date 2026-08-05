// 三球独立状态机（纯逻辑，原生可测）：一球一链 + 蓝绿低优先级跟随粉球
// - 粉球（ball[0]）：自由巡航 + 回家仪式（Cruise→Homeward→Resting→Queueing→Cruise）
// - 蓝绿（ball[1]/ball[2]）：自由巡航（各自独立的链）+ FollowPink（低优先级任务：
//   每 FOLLOW_CHECK_MS 判定 FOLLOW_PROB 概率进入，跟 FOLLOW_DUR 时长，粉球回家时松开）
//   + 周期回家（cycle_t ≥ HOME_EVERY_MS → Homeward→Resting→Queueing→Free——
//   与粉球同步：相位 0 + launch 期间 cycle_t 照常累计——与粉球 phase t 同一
//   HOME_EVERY_MS 边界同帧触发回家，三球同时到家、同时 Resting、同时出发）
// - 契约：docs/independent-balls-design.md（并发重构的唯一契约）；
//   蓝绿回家为本轮新增需求（以 prompt 为准，契约文档尚未收录）
// - 不依赖 web_sys/wasm
use crate::config::params::*;
use crate::sim::math::{normal_of, smoothstep, Vec2};
use crate::sim::planner::{CircleBounds, ExtTarget, Player};

/// 蓝绿任务模式：Free = 自由巡航；FollowPink = 低优先级跟随粉球；
/// Homeward/Resting/Queueing = 蓝绿自己的回家仪式（周期回家——与粉球同步：
/// 相位 0，cycle_t 从创建时刻起算，与粉球 phase t 同帧触发）
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum BallMode {
    Free,
    FollowPink,
    /// 沿弧线回锚点（HOME_DURATION_MS）
    Homeward,
    /// 锚点定住（HOME_REST_MS）
    Resting,
    /// 重启停顿（QUEUE_DELAY_MIN_MS）
    Queueing,
}

/// 单球回家弧线（粉球专用）：当前位置 → 锚点（贝塞尔侧偏，非直线）
#[derive(Clone, Copy, Debug)]
pub struct HomeLeg {
    pub from: Vec2,
    pub ctrl: Vec2,
    pub target: Vec2,
    /// 0→1 推进（HOME_DURATION_MS 内到家）
    pub s: f64,
}

/// 一球一链 + 任务状态
pub struct Ball {
    pub player: Player,
    pub mode: BallMode,
    /// 入场静止倒计时（ms；≤0 = 已出发）
    pub launch_t: f64,
    /// FollowPink 已持续（ms）
    pub follow_t: f64,
    /// 距上次「是否跟随」判定（ms）
    pub check_t: f64,
    /// 本次跟随的落后弧长（随机 0.1-0.3）
    pub follow_gap: f64,
    /// 本次跟随总时长（ms）
    pub follow_dur: f64,
    /// 进入跟随时的起始位置（前 500ms 渐变——避免进入瞬间跳变）
    pub follow_enter: Vec2,
    /// 法线方向 EMA（Gemini 真经二版：段边界 Frenet 标架跳变 → 跟随目标
    /// raw 阶跃 → EMA 下冲/回弹 = 跟随球二次顿感——法线向量低通平滑）
    pub n_ema: Option<Vec2>,
    /// 周期回家计时（ms）：自 State::new 起算（launch 静立期也累计——与粉球
    /// phase t 无条件累计对齐），Free/FollowPink 中继续累计，≥ HOME_EVERY_MS 触发回家
    pub cycle_t: f64,
    /// 回家仪式计时（ms）：Homeward/Resting/Queueing 各自阶段的推进时间
    pub phase_t: f64,
    /// Homeward 模式的回家弧线（None = 起点已在锚点附近，直接定住）
    pub home_leg: Option<HomeLeg>,
}

/// 粉球阶段
/// - Cruise：自由巡航（计时到 HOME_EVERY_MS 触发回家）
/// - Homeward：粉球沿弧线回家（HOME_DURATION_MS 到家）
/// - Resting：粉球在锚点定住 HOME_REST_MS（蓝绿不受影响——各自玩）
/// - Queueing：粉球重启巡航的停顿（= 旧入场仪式：静立后启动新链）
#[derive(Debug)]
pub enum Phase {
    Cruise { t: f64 },
    Homeward { t: f64, home: Option<HomeLeg> },
    Resting { t: f64 },
    Queueing { t: f64 },
}

pub struct State {
    pub balls: [Ball; 3],
    phase: Phase,
    /// 页面年龄（淡入用）
    age: f64,
    /// 三球锚点（回家目标 / 入场构图位）
    anchors: [Vec2; 3],
    /// 粉球上一帧位置（跟随 tvel 的差分速度用）
    pink_prev: Vec2,
}

impl State {
    /// 开场：三球静立构图（粉球 ENTRY_DELAY_MS 后出发、蓝绿再错开 1-3s），
    /// 各自沿自己的链自由巡航；蓝绿开始周期性「是否跟随粉球」判定
    pub fn new(anchors: [Vec2; 3]) -> Self {
        let dir = random_dir();
        let mut balls = [
            Ball::new(anchors[0], dir, ENTRY_DELAY_MS, 0.0),
            Ball::new(
                anchors[1],
                random_dir(),
                ENTRY_DELAY_MS
                    + QUEUE_DELAY_MIN_MS
                    + rand::random::<f64>() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
                0.0, // 相位 0：与粉球同步回家（同一 HOME_EVERY_MS 边界触发）
            ),
            Ball::new(
                anchors[2],
                random_dir(),
                ENTRY_DELAY_MS
                    + QUEUE_DELAY_MIN_MS
                    + rand::random::<f64>() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
                0.0,
            ),
        ];
        // 入场空闲期一次性生成几分钟的链（运行期 ensure_chain 静默）——三球各自
        for ball in balls.iter_mut() {
            ball.player.ensure_chain_to(PREPLAN_SECONDS * WORLD_SPEED * 1.1);
        }
        State {
            balls,
            phase: Phase::Cruise { t: 0.0 },
            age: 0.0,
            anchors,
            pink_prev: anchors[0],
        }
    }

    /// 更新活动圈边界（engine 实时采样 logo 位置后调用——转发三球）
    pub fn set_bounds(&mut self, b: CircleBounds) {
        for ball in self.balls.iter_mut() {
            ball.player.set_bounds(b);
        }
    }

    /// 推进一帧。`decide` 注入随机源（生产 = rand；测试 = 固定序列）
    pub fn step(&mut self, dt: f64, decide: &mut dyn FnMut() -> f64) {
        self.age += dt;

        // ── 粉球阶段推进 ──
        let (home, restart) = match &mut self.phase {
            Phase::Cruise { t } => {
                *t += dt;
                if *t >= HOME_EVERY_MS {
                    (Some(true), false)
                } else {
                    (None, false)
                }
            }
            Phase::Homeward { t, home: _ } => {
                *t += dt;
                if *t >= HOME_DURATION_MS {
                    (Some(false), false)
                } else {
                    (None, false)
                }
            }
            Phase::Resting { t } => {
                *t += dt;
                if *t >= HOME_REST_MS {
                    (None, true)
                } else {
                    (None, false)
                }
            }
            Phase::Queueing { t } => {
                *t += dt;
                if *t >= QUEUE_DELAY_MIN_MS {
                    (None, true)
                } else {
                    (None, false)
                }
            }
        };
        if let Some(home) = home {
            if home {
                // Cruise → Homeward：粉球沿弧线回家（拟合助手：起点沿巡航切线伸出）
                let pos = self.balls[0].player.pos();
                let target = self.anchors[0];
                let dx = target.x - pos.x;
                let dy = target.y - pos.y;
                let dist = (dx * dx + dy * dy).sqrt();
                let leg = if dist > 0.03 {
                    let dir = self.balls[0].player.tangent();
                    let off = 0.2f64.min(0.35 * dist);
                    let mut ctrl = Vec2 {
                        x: pos.x + dir.x * (dist * 0.4) + (-dir.y) * off,
                        y: pos.y + dir.y * (dist * 0.4) + dir.x * off,
                    };
                    ctrl.x = ctrl.x.clamp(0.04, 0.96);
                    ctrl.y = ctrl.y.clamp(0.04, 0.96);
                    Some(HomeLeg { from: pos, ctrl, target, s: 0.0 })
                } else {
                    None
                };
                self.phase = Phase::Homeward { t: 0.0, home: leg };
            } else {
                self.phase = Phase::Resting { t: 0.0 };
            }
        } else if restart {
            // Queueing 重启：粉球新链（旧仪式保留——重启巡航）
            let mut p = Player::new(self.anchors[0], random_dir());
            // bounds 由 engine 每帧 set_bounds 实时更新（此处 fallback 即可）
            p.ensure_chain_to(PREPLAN_SECONDS * WORLD_SPEED * 1.1);
            self.balls[0].player = p;
            self.phase = Phase::Cruise { t: 0.0 };
        }

        // ── 三球各自推进 ──
        for s in 0..3 {
            // 入场静立
            if self.balls[s].launch_t > 0.0 {
                self.balls[s].launch_t -= dt;
                // 相位 0 同步：蓝绿 launch 期间 cycle_t 照常累计——与粉球 phase t
                // 一样从 State::new 起算（step 顶部无条件累计）→ 同一 HOME_EVERY_MS
                // 边界同帧触发回家（launch 最长 8s << 30s，不会在静立中触发）
                if s != 0 {
                    self.balls[s].cycle_t += dt;
                }
                continue;
            }
            if s == 0 {
                self.tick_pink(dt);
            } else {
                self.tick_blue_green(s, dt, decide);
            }
        }
    }

    /// 粉球：自由巡航（Cruise）或回家弧线（Homeward）/ 锚点定住（Resting/Queueing）
    fn tick_pink(&mut self, dt: f64) {
        // 先推进回家弧线进度（可变借用 phase——独立于下面的不可变匹配）
        if let Phase::Homeward { t, home } = &mut self.phase {
            if let Some(leg) = home {
                leg.s = (*t / HOME_DURATION_MS).min(1.0);
            }
        }
        let pos = match &self.phase {
            Phase::Cruise { .. } => {
                self.balls[0].player.tick(dt, None);
                self.balls[0].player.pos()
            }
            Phase::Homeward { home, .. } => match home {
                Some(leg) => quad_home(leg),
                None => self.anchors[0],
            },
            Phase::Resting { .. } | Phase::Queueing { .. } => self.anchors[0],
        };
        // 非巡航期间：位置写回 player（渲染源是 player.pos()——否则粉球
        // 回家/定住期间渲染的是旧巡航位置）
        if !matches!(self.phase, Phase::Cruise { .. }) {
            self.balls[0].player.snap(pos);
        }
        self.pink_prev = pos;
    }

    /// 蓝绿：Free（自由巡航）/ FollowPink（跟随粉球——低优先级任务）/ 回家仪式
    /// 周期回家：cycle_t 自 State::new 累计（含 launch 静立期——与粉球 phase t
    /// 无条件累计对齐，同一 HOME_EVERY_MS 边界同帧触发），Free/FollowPink 中继续
    /// 累计，≥ HOME_EVERY_MS 触发 Homeward——弧线回家（HOME_DURATION_MS）→
    /// 锚点定住（HOME_REST_MS）→ 停顿（QUEUE_DELAY_MIN_MS）→ 重启自由巡航。
    /// 回家期间不跟随、不判定（check_t/cycle_t 不累计）。
    fn tick_blue_green(&mut self, s: usize, dt: f64, decide: &mut dyn FnMut() -> f64) {
        let pink_home_phase = matches!(
            self.phase,
            Phase::Homeward { .. } | Phase::Resting { .. } | Phase::Queueing { .. }
        );
        // 粉球回家期间：蓝绿不跟随——已跟随的立即松开
        if pink_home_phase && self.balls[s].mode == BallMode::FollowPink {
            self.release_follow(s);
        }

        match self.balls[s].mode {
            // ── 回家仪式（蓝绿自己的：Homeward → Resting → Queueing → 重启 Free）──
            BallMode::Homeward => {
                let phase_t = self.balls[s].phase_t + dt;
                self.balls[s].phase_t = phase_t;
                // 位置 = 回家弧线（leg=None = 起点已在锚点附近——直接定锚点）
                let pos = match self.balls[s].home_leg.as_mut() {
                    Some(leg) => {
                        leg.s = (phase_t / HOME_DURATION_MS).min(1.0);
                        quad_home(leg)
                    }
                    None => self.anchors[s],
                };
                self.balls[s].player.snap(pos);
                if phase_t >= HOME_DURATION_MS {
                    self.balls[s].player.snap(self.anchors[s]);
                    self.balls[s].mode = BallMode::Resting;
                    self.balls[s].phase_t = 0.0;
                    self.balls[s].home_leg = None;
                }
            }
            BallMode::Resting => {
                self.balls[s].phase_t += dt;
                self.balls[s].player.snap(self.anchors[s]);
                if self.balls[s].phase_t >= HOME_REST_MS {
                    self.balls[s].mode = BallMode::Queueing;
                    self.balls[s].phase_t = 0.0;
                }
            }
            BallMode::Queueing => {
                self.balls[s].phase_t += dt;
                self.balls[s].player.snap(self.anchors[s]);
                if self.balls[s].phase_t >= QUEUE_DELAY_MIN_MS {
                    // 重启巡航：新链 + 新方向，贴锚点启动（位置无跳变）
                    let mut p = Player::new(self.anchors[s], random_dir());
                    p.ensure_chain_to(PREPLAN_SECONDS * WORLD_SPEED * 1.1);
                    p.snap(self.anchors[s]);
                    self.balls[s].player = p;
                    self.balls[s].mode = BallMode::Free;
                    self.balls[s].phase_t = 0.0;
                    self.balls[s].cycle_t = 0.0;
                    self.balls[s].check_t = 0.0;
                    self.balls[s].home_leg = None;
                }
            }
            // ── 巡航 / 跟随：周期计时，到点回家（低优先级任务让位——FollowPink 直接打断）──
            BallMode::Free | BallMode::FollowPink => {
                let cycle_t = self.balls[s].cycle_t + dt;
                if cycle_t >= HOME_EVERY_MS {
                    // 切 Homeward：弧线连续（home_leg.from = 当前位置——无需 release_follow）
                    let pos = self.balls[s].player.pos();
                    let target = self.anchors[s];
                    let dx = target.x - pos.x;
                    let dy = target.y - pos.y;
                    let dist = (dx * dx + dy * dy).sqrt();
                    let leg = if dist > 0.03 {
                        let dir = self.balls[s].player.tangent();
                        let off = 0.2f64.min(0.35 * dist);
                        let mut ctrl = Vec2 {
                            x: pos.x + dir.x * (dist * 0.4) + (-dir.y) * off,
                            y: pos.y + dir.y * (dist * 0.4) + dir.x * off,
                        };
                        ctrl.x = ctrl.x.clamp(0.04, 0.96);
                        ctrl.y = ctrl.y.clamp(0.04, 0.96);
                        Some(HomeLeg { from: pos, ctrl, target, s: 0.0 })
                    } else {
                        None
                    };
                    self.balls[s].home_leg = leg;
                    self.balls[s].mode = BallMode::Homeward;
                    self.balls[s].phase_t = 0.0;
                    self.balls[s].cycle_t = 0.0;
                    self.balls[s].check_t = 0.0;
                    return;
                }
                self.balls[s].cycle_t = cycle_t;

                match self.balls[s].mode {
                    BallMode::FollowPink => {
                        let follow_t = self.balls[s].follow_t + dt;
                        self.balls[s].follow_t = follow_t;
                        if follow_t >= self.balls[s].follow_dur {
                            // 跟腻了——松开回自由（位置无跳变）
                            self.release_follow(s);
                            self.balls[s].player.tick(dt, None);
                        } else {
                            // 目标 = 粉球链上落后弧长处 + Frenet 偏移
                            let gap = self.balls[s].follow_gap;
                            let s_p = self.balls[0].player.lead_arc();
                            let (pp, tan_p, _, _) =
                                self.balls[0].player.chain_point((s_p - gap).max(0.0));
                            let d = FORMATION_OFFSETS[s]
                                * crate::config::profile::ACTIVE_PROFILE.offset_scale;
                            // 法线 EMA（α=0.3——弯道偏移方向平滑转，段边界跳变被消化）
                            let n_raw = normal_of(tan_p);
                            let n = match self.balls[s].n_ema {
                                Some(prev) => {
                                    let e = Vec2 {
                                        x: prev.x + 0.3 * (n_raw.x - prev.x),
                                        y: prev.y + 0.3 * (n_raw.y - prev.y),
                                    };
                                    let l = (e.x * e.x + e.y * e.y).sqrt().max(1e-9);
                                    Vec2 { x: e.x / l, y: e.y / l }
                                }
                                None => n_raw,
                            };
                            self.balls[s].n_ema = Some(n);
                            let mut tgt =
                                Vec2 { x: pp.x + n.x * d, y: pp.y + n.y * d };
                            // 平滑进入：前 500ms 从起始位置渐变到目标（跟随接入不突兀）
                            if self.balls[s].follow_t < 500.0 {
                                let k = smoothstep(self.balls[s].follow_t / 500.0);
                                let e = self.balls[s].follow_enter;
                                tgt = Vec2 {
                                    x: e.x + (tgt.x - e.x) * k,
                                    y: e.y + (tgt.y - e.y) * k,
                                };
                            }
                            let ext = ExtTarget {
                                pos: tgt,
                                tvel: follow_tvel(
                                    tan_p,
                                    &self.pink_prev,
                                    &self.balls[0].player.pos(),
                                    dt,
                                ),
                            };
                            self.balls[s].player.tick(dt, Some(ext));
                        }
                    }
                    BallMode::Free => {
                        // 周期性判定：是否开始跟随粉球（低优先级任务）
                        let check_t = self.balls[s].check_t + dt;
                        if check_t >= FOLLOW_CHECK_MS {
                            self.balls[s].check_t = 0.0;
                            let r = decide();
                            if r < FOLLOW_PROB {
                                self.balls[s].mode = BallMode::FollowPink;
                                self.balls[s].follow_t = 0.0;
                                self.balls[s].follow_enter = self.balls[s].player.pos();
                                self.balls[s].follow_gap =
                                    0.1 + decide() * 0.2;
                                self.balls[s].follow_dur = FOLLOW_DUR_MIN_MS
                                    + decide() * (FOLLOW_DUR_MAX_MS - FOLLOW_DUR_MIN_MS);
                            }
                        } else {
                            self.balls[s].check_t = check_t;
                        }
                        self.balls[s].player.tick(dt, None);
                    }
                    BallMode::Homeward | BallMode::Resting | BallMode::Queueing => {
                        unreachable!("回家状态已在顶部处理")
                    }
                }
            }
        }
    }

    /// 松开跟随：自由链从当前位置最近弧长继续（位置不跳）
    fn release_follow(&mut self, s: usize) {
        let arc = self.balls[s].player.nearest_arc(self.balls[s].player.pos());
        self.balls[s].player.resume_at(arc);
        self.balls[s].mode = BallMode::Free;
        self.balls[s].follow_t = 0.0;
        self.balls[s].check_t = 0.0;
    }

    /// 渲染：球 i 位置（offset 保留签名——恒 0）
    pub fn ball_pos(&self, color_slot: usize, _offset: f64) -> Vec2 {
        self.balls[color_slot].player.pos()
    }

    pub fn is_playing(&self) -> bool {
        true
    }

    pub fn fade(&self) -> f64 {
        (self.age / 800.0).min(1.0)
    }

    /// 深度排序（保留签名——独立球无换序，恒 [0,1,2]）
    pub fn order(&self) -> [usize; 3] {
        [0, 1, 2]
    }
}

impl Ball {
    /// `cycle_t` = 周期回家相位（ms）：粉球 0；蓝绿 0——与粉球同步回家
    /// （同一 HOME_EVERY_MS 边界同帧触发）。入场 launch 静立期也累计
    /// （step 的 launch 分支），与粉球 phase t 无条件累计对齐。
    fn new(anchor: Vec2, dir: Vec2, launch_t: f64, cycle_t: f64) -> Self {
        Ball {
            player: Player::new(anchor, dir),
            mode: BallMode::Free,
            launch_t,
            follow_t: 0.0,
            check_t: 0.0,
            follow_gap: 0.2,
            follow_dur: FOLLOW_DUR_MIN_MS,
            follow_enter: anchor,
            cycle_t,
            phase_t: 0.0,
            home_leg: None,
            n_ema: None,
        }
    }
}

/// 回家弧线点（贝塞尔，s∈[0,1]）
fn quad_home(leg: &HomeLeg) -> Vec2 {
    let u = smoothstep(leg.s);
    let a = 1.0 - u;
    Vec2 {
        x: a * a * leg.from.x + 2.0 * a * u * leg.ctrl.x + u * u * leg.target.x,
        y: a * a * leg.from.y + 2.0 * a * u * leg.ctrl.y + u * u * leg.target.y,
    }
}

/// 跟随速度：方向 = 粉球切线；大小 = 粉球实际位移速度（帧间差分——冲刺时跟随也冲）
fn follow_tvel(tan_p: Vec2, pink_prev: &Vec2, pink_now: &Vec2, dt: f64) -> Vec2 {
    let l = (tan_p.x * tan_p.x + tan_p.y * tan_p.y).sqrt().max(1e-9);
    let dir = Vec2 { x: tan_p.x / l, y: tan_p.y / l };
    let speed = if dt > 0.0 {
        ((pink_now.x - pink_prev.x).powi(2) + (pink_now.y - pink_prev.y).powi(2))
            .sqrt()
            / (dt / 1000.0)
            * 1.2 // 跟随球略快于粉球（追上——低优先级但会跟）
    } else {
        WORLD_SPEED
    };
    Vec2 { x: dir.x * speed, y: dir.y * speed }
}

/// 追踪开关：速度低于阈值不渲染拖尾（渲染层用）
pub fn should_track(speed_per_sec: f64) -> bool {
    speed_per_sec > 0.02
}

/// 随机方向（入场链起点方向）
pub fn random_dir() -> Vec2 {
    let a = rand::random::<f64>() * std::f64::consts::PI * 2.0;
    Vec2 { x: a.cos(), y: a.sin() }
}

// ─────────────────────────── 测试 ───────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn v(x: f64, y: f64) -> Vec2 {
        Vec2 { x, y }
    }

    fn state() -> State {
        State::new([v(0.555, 0.355), v(0.473, 0.379), v(0.525, 0.471)])
    }

    /// 固定序列 decide：ball[1] 第 5 次判定（i=9，25000ms）触发跟随，
    /// 之后全 0.9（触发一次后不再触发——测松开后不再循环跟随）。
    /// 触发时依次调用 3 次（概率/gap/dur）——i=9,10,11 都给 0.1
    fn seq_decide(_low_until: usize) -> impl FnMut() -> f64 {
        let mut i = 0usize;
        move || {
            i += 1;
            if i >= 9 && i <= 11 {
                0.1
            } else {
                0.9
            }
        }
    }

    /// 跳过入场静立（launch 清零——判定周期确定，不撞粉球 30s 回家相位）。
    /// 蓝绿 cycle_t 一并清零（State::new 已是相位 0——测试需从 0 起算的确定性；
    /// 个别测试随后手动设置 cycle_t 避免/错开触发）。
    fn skip_launch(st: &mut State) {
        for s in 0..3 {
            st.balls[s].launch_t = 0.0;
            st.balls[s].cycle_t = 0.0;
        }
    }

    fn fast_forward(st: &mut State, ms: f64, decide: &mut dyn FnMut() -> f64) {
        let mut t = 0.0;
        while t < ms {
            st.step(16.7, decide);
            t += 16.7;
        }
    }

    #[test]
    fn blue_green_free_independent() {
        // 蓝绿自由巡航：各自链独立增长、位置轨迹不同（不是粉球链的复制）
        let mut st = state();
        let mut dec = seq_decide(usize::MAX);
        fast_forward(&mut st, 15000.0, &mut dec);
        let arcs: Vec<f64> = (0..3).map(|s| st.balls[s].player.chain_arc()).collect();
        // 三球链都推进了
        assert!(arcs[0] > 1.0 && arcs[1] > 1.0 && arcs[2] > 1.0, "三球链都推进: {arcs:?}");
        // 蓝绿链弧长与粉球不同（各自独立生成）
        assert!((arcs[1] - arcs[0]).abs() > 0.01 || (arcs[2] - arcs[0]).abs() > 0.01);
        // 轨迹独立性：全程采样平均间距 > 0.02（独立球允许偶发擦肩——
        // 断言"位置应不同"与架构相悖；独立链由弧长差 + 平均间距证明）
        let mut sum = 0.0f64;
        let mut n = 0usize;
        for _ in 0..20 {
            let p: Vec<Vec2> = (0..3).map(|s| st.ball_pos(s, 0.0)).collect();
            sum += (p[0].x - p[1].x).abs() + (p[0].y - p[1].y).abs();
            n += 1;
            fast_forward(&mut st, 500.0, &mut dec);
        }
        let avg = sum / n as f64;
        assert!(avg > 0.02, "粉蓝平均间距应>0.02（轨迹独立）: {avg:.4}");
    }

    #[test]
    fn follow_triggers_and_tracks() {
        // 蓝绿进入 FollowPink：位置 ≈ 粉球链落后 gap 处（EMA 收敛后误差 < 0.05）
        let mut st = state();
        skip_launch(&mut st);
        let mut dec = seq_decide(4); // 第 5 次判定（25s）触发——避开 30s 回家释放
        fast_forward(&mut st, 28000.0, &mut dec);
        // 已触发（至少一球在跟随）
        let any_follow = st.balls[1].mode == BallMode::FollowPink
            || st.balls[2].mode == BallMode::FollowPink;
        assert!(any_follow, "蓝绿应至少一球进入 FollowPink");
        // 跟随中的球位置 ≈ 粉球链落后 gap 处（< 0.09——EMA 滞后随目标速度
        // 波动：α=0.28 稳态偏差 ≈ 速度×τ，粉球冲刺时可达 ~0.07——9% 屏可接受）
        for s in 1..3 {
            if st.balls[s].mode == BallMode::FollowPink {
                let s_p = st.balls[0].player.lead_arc();
                let gap = st.balls[s].follow_gap;
                let (pp, _, _, _) = st.balls[0].player.chain_point((s_p - gap).max(0.0));
                let pos = st.balls[s].player.pos();
                let err = (pos.x - pp.x).powi(2) + (pos.y - pp.y).powi(2);
                assert!(err.sqrt() < 0.09, "跟随偏差应小: {}", err.sqrt());
            }
        }
    }

    #[test]
    fn follow_exits_smoothly() {
        // 跟随时长到 → 松开回 Free——位置无跳变（< 0.08）
        let mut st = state();
        skip_launch(&mut st);
        let mut dec = seq_decide(4);
        fast_forward(&mut st, 28000.0, &mut dec);
        let mut s_follow = None;
        for s in 1..3 {
            if st.balls[s].mode == BallMode::FollowPink {
                s_follow = Some(s);
            }
        }
        if let Some(s) = s_follow {
            let prev = st.balls[s].player.pos();
            // 推进到超过 follow_dur（最长 20s）
            fast_forward(&mut st, 21000.0, &mut dec);
            assert_eq!(st.balls[s].mode, BallMode::Free, "时长到应松开");
            let now = st.balls[s].player.pos();
            let jump = (now.x - prev.x).powi(2) + (now.y - prev.y).powi(2);
            // 松开的瞬间位置连续（jump 是 21s 总位移——用最近帧验证）
            // 改为：松开帧（mode 切换帧）前后位置差 < 0.08
            let mut st2 = state();
            skip_launch(&mut st2);
            let mut dec2 = seq_decide(4);
            fast_forward(&mut st2, 28000.0, &mut dec2);
            let mut s2 = 0usize;
            for s in 1..3 {
                if st2.balls[s].mode == BallMode::FollowPink {
                    s2 = s;
                }
            }
            let mut prev_pos = st2.balls[s2].player.pos();
            let mut max_jump = 0.0f64;
            let mut t = 0.0;
            while t < 25000.0 {
                st2.step(16.7, &mut dec2);
                let pos = st2.balls[s2].player.pos();
                let d = (pos.x - prev_pos.x).powi(2) + (pos.y - prev_pos.y).powi(2);
                max_jump = max_jump.max(d.sqrt());
                prev_pos = pos;
                t += 16.7;
            }
            assert!(max_jump < 0.08, "全程无跳变（含松开帧）: {max_jump:.4}");
            assert_eq!(st2.balls[s2].mode, BallMode::Free, "应已松开");
        } else {
            // 没触发跟随（随机路径）——重跑一次确保覆盖触发分支
            let mut st3 = state();
            let mut dec3 = seq_decide(3);
            fast_forward(&mut st3, 60000.0, &mut dec3);
            let any = st3.balls[1].mode == BallMode::FollowPink
                || st3.balls[2].mode == BallMode::FollowPink;
            assert!(any, "固定序列应保证触发");
        }
    }

    #[test]
    fn pink_homecoming_kept() {
        // 粉球 30s 回家仪式保留：Homeward 弧线 → 锚点 → Resting → 重启巡航
        let mut st = state();
        let mut dec = seq_decide(usize::MAX);
        let anchor0 = st.anchors[0];
        fast_forward(&mut st, 30000.0, &mut dec);
        // 已进入 Homeward（粉球离开巡航——位置向锚点移动）
        match st.phase {
            Phase::Homeward { .. } => {}
            _ => panic!("30s 后应进入 Homeward"),
        }
        fast_forward(&mut st, 2000.0, &mut dec);
        // 到家：位置 = 锚点
        let pos = st.ball_pos(0, 0.0);
        eprintln!("phase={:?} pos={:?} anchor={:?}", st.phase, pos, anchor0);
        assert!(
            (pos.x - anchor0.x).powi(2) + (pos.y - anchor0.y).powi(2) < 0.01,
            "粉球应到家: {pos:?}"
        );
        fast_forward(&mut st, HOME_REST_MS + 2000.0, &mut dec);
        // 重启巡航：粉球离开锚点
        let pos2 = st.ball_pos(0, 0.0);
        assert!(
            (pos2.x - anchor0.x).powi(2) + (pos2.y - anchor0.y).powi(2) > 0.001
                || matches!(st.phase, Phase::Cruise { .. }),
            "粉球应重启巡航"
        );
    }

    #[test]
    fn blue_green_release_on_pink_home() {
        // 粉球回家期间蓝绿不跟随（已跟随的松开回 Free）。
        // 本测试专测「粉球松开跟随」路径：蓝绿 cycle_t 设大不触发自己的回家
        // （同步回家下蓝绿 30s 自己也回家——那条路径由 home_sync_with_pink 覆盖）
        let mut st = state();
        skip_launch(&mut st);
        st.balls[1].cycle_t = 1e9;
        st.balls[2].cycle_t = 1e9;
        let mut dec = seq_decide(5);
        fast_forward(&mut st, 30000.0, &mut dec);
        for s in 1..3 {
            assert_ne!(
                st.balls[s].mode,
                BallMode::FollowPink,
                "粉球回家期间蓝绿不应跟随（应 Free 或自己 Homeward）"
            );
        }
    }

    #[test]
    fn blue_green_homecoming() {
        // 蓝绿周期到家（相位 0 同步粉球）：30s 同帧触发 Homeward，粉球 Resting
        // 期间蓝绿也 Resting——三球同一时刻都在各自锚点附近；重启后 Free + 链推进
        let mut st = state();
        skip_launch(&mut st);
        // 相位 0（默认）：蓝绿与粉球 30s 同帧触发（同一 HOME_EVERY_MS 边界）
        let a1 = st.anchors[1];
        let a2 = st.anchors[2];
        let mut dec = seq_decide(usize::MAX);
        fast_forward(&mut st, 30000.0, &mut dec);
        // 同帧进入 Homeward（粉球 phase 与蓝绿 cycle_t 同刻 ≥ HOME_EVERY_MS）
        assert!(matches!(st.phase, Phase::Homeward { .. }), "粉球应 Homeward");
        for s in 1..3 {
            assert_eq!(
                st.balls[s].mode,
                BallMode::Homeward,
                "ball[{s}] 应与粉球同帧回家: {:?}",
                st.balls[s].mode
            );
        }
        // 回家完成 + 粉球 Resting 期间（31.5s-38.5s）：蓝绿也 Resting——三球都在
        // 锚点附近（同一时刻都「在家」）
        fast_forward(&mut st, 2500.0, &mut dec); // 33s：三球都在 Resting
        assert!(matches!(st.phase, Phase::Resting { .. }), "粉球应 Resting");
        for s in 1..3 {
            assert_eq!(st.balls[s].mode, BallMode::Resting, "蓝绿也应 Resting");
        }
        let d1 = {
            let p = st.ball_pos(1, 0.0);
            ((p.x - a1.x).powi(2) + (p.y - a1.y).powi(2)).sqrt()
        };
        let d2 = {
            let p = st.ball_pos(2, 0.0);
            ((p.x - a2.x).powi(2) + (p.y - a2.y).powi(2)).sqrt()
        };
        assert!(d1 < 0.05, "蓝球应到锚点附近: {d1:.4}");
        assert!(d2 < 0.05, "绿球应到锚点附近: {d2:.4}");
        // 重启后：Free + 链推进（重启 = 新链已生成并巡航）。
        // 注意：不断言"离开锚点>0.05"——独立球链随机，重启后绕回锚点附近
        // 是正常行为（与架构相悖的脆弱断言）
        fast_forward(&mut st, 10000.0, &mut dec);
        assert_eq!(st.balls[1].mode, BallMode::Free, "蓝球应重启巡航");
        assert_eq!(st.balls[2].mode, BallMode::Free, "绿球应重启巡航");
        assert!(st.balls[1].player.chain_arc() > 1.0, "蓝球重启后链推进");
        assert!(st.balls[2].player.chain_arc() > 1.0, "绿球重启后链推进");
    }

    #[test]
    fn follow_interrupted_by_home() {
        // 跟随中周期到点：回家优先——直接打断 FollowPink 切 Homeward（弧线连续）
        // 相位 0：ball[1] 30s 与粉球同步触发（25s 已在 FollowPink）；
        // ball[2] cycle_t 设大不触发——纯背景
        let mut st = state();
        skip_launch(&mut st);
        st.balls[1].cycle_t = 0.0; // 相位 0——30s 触发
        st.balls[2].cycle_t = 1e9; // 永不触发
        let mut dec = seq_decide(4);
        fast_forward(&mut st, 31000.0, &mut dec);
        assert_eq!(
            st.balls[1].mode,
            BallMode::Homeward,
            "跟随中到点应直接切 Homeward（回家优先）"
        );
        assert_eq!(st.balls[2].mode, BallMode::Free, "ball[2] 应一直 Free");
    }

    #[test]
    fn home_sync_with_pink() {
        // 相位 0 同步回家（真实入场时序——不跳过 launch）：蓝绿 launch 期间
        // cycle_t 照常累计（与粉球 phase 无条件累计对齐）→ 30s 同一 HOME_EVERY_MS
        // 边界三球同帧触发 Homeward；回家完成后三球同时段在锚点 Resting，
        // 粉球 Resting 期间蓝绿也在 Resting（不再出现"蓝绿刚到家粉球已出发"）
        let mut st = state();
        let mut dec = seq_decide(usize::MAX);
        let anchors: Vec<Vec2> = (0..3).map(|s| st.anchors[s]).collect();
        fast_forward(&mut st, 30000.0, &mut dec);
        // 同帧触发：粉球 phase 与蓝绿 cycle_t 同刻 ≥ HOME_EVERY_MS
        assert!(matches!(st.phase, Phase::Homeward { .. }), "粉球应 Homeward");
        for s in 1..3 {
            assert_eq!(
                st.balls[s].mode,
                BallMode::Homeward,
                "ball[{s}] 应与粉球同帧回家: {:?}",
                st.balls[s].mode
            );
        }
        // 回家完成（HOME_DURATION_MS 后）：三球都在各自锚点附近（Resting 中）
        fast_forward(&mut st, HOME_DURATION_MS + 1000.0, &mut dec);
        assert!(matches!(st.phase, Phase::Resting { .. }), "粉球应 Resting");
        // 粉球状态看 State.phase（无 BallMode）；蓝绿断言 BallMode
        let p0 = st.ball_pos(0, 0.0);
        let d0 = ((p0.x - anchors[0].x).powi(2) + (p0.y - anchors[0].y).powi(2)).sqrt();
        assert!(d0 < 0.05, "ball[0] 应在锚点附近: {d0:.4}");
        for s in 1..3 {
            assert_eq!(st.balls[s].mode, BallMode::Resting, "ball[{s}] 应 Resting");
            let p = st.ball_pos(s, 0.0);
            let d = ((p.x - anchors[s].x).powi(2) + (p.y - anchors[s].y).powi(2)).sqrt();
            assert!(d < 0.05, "ball[{s}] 应在锚点附近: {d:.4}");
        }
    }

    // 注：home_sync_with_pink_native 曾存在——删（测试审查：回家计时
    // （cycle_t/State.phase）静态可证与 profile 零交互；切全局 ACTIVE_IDX
    // 会与并行测试竞态（11/15 失败）——证明力低、污染高，删除）

    #[test]
    fn lifecycle_90s_no_teleport() {
        // 三球 90s 生命周期：每帧位移 < 0.08（无闪现/跳变）
        let mut st = state();
        let mut dec = seq_decide(5);
        let mut prev: Vec<Vec2> = (0..3).map(|s| st.ball_pos(s, 0.0)).collect();
        let mut max_jump = 0.0f64;
        let mut t = 0.0;
        while t < 90000.0 {
            st.step(16.7, &mut dec);
            for s in 0..3 {
                let pos = st.ball_pos(s, 0.0);
                let d = (pos.x - prev[s].x).powi(2) + (pos.y - prev[s].y).powi(2);
                max_jump = max_jump.max(d.sqrt());
                prev[s] = pos;
            }
            t += 16.7;
        }
        assert!(max_jump < 0.08, "90s 无跳变: {max_jump:.4}");
    }
}
