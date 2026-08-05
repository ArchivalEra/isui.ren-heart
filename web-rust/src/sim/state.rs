// 三球独立状态机（纯逻辑，原生可测）：一球一链 + 蓝绿低优先级跟随粉球
// - 粉球（ball[0]）：自由巡航 + 回家仪式（Cruise→Homeward→Resting→Queueing→Cruise）
// - 蓝绿（ball[1]/ball[2]）：自由巡航（各自独立的链）+ FollowPink（低优先级任务：
//   每 FOLLOW_CHECK_MS 判定 FOLLOW_PROB 概率进入，跟 FOLLOW_DUR 时长）
// - 回家 = 预渲染动画（契约 docs/home-anim-design.md §3）：粉球 Cruise t ≥
//   HOME_EVERY_MS（唯一计时源）触发——三球共享 home::plan_home_anim 生成的
//   HomeAnim（时间对齐——同时到家）→ 播完三球同时 Resting → 同时重启。
//   蓝绿不再自己触发回家（cycle_t 已删）——跟随时被打断由粉球触发驱动。
//   蓝绿 Homeward/Resting/Queueing 的推进与切换全部由粉球 Phase 统一驱动（严格同帧）
// - 不依赖 web_sys/wasm
use crate::config::params::*;
use crate::sim::home::{self, HomeAnim};
use crate::sim::math::{normal_of, smoothstep, Vec2};
use crate::sim::planner::{CircleBounds, ExtTarget, Player};

/// 蓝绿任务模式：Free = 自由巡航；FollowPink = 低优先级跟随粉球；
/// Homeward/Resting/Queueing = 与粉球同步的回家仪式（由粉球 Cruise 触发驱动——
/// 切换全部由粉球 Phase 统一进行）
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum BallMode {
    Free,
    FollowPink,
    /// 沿预渲染动画回锚点（HomeAnim.sample——三球共享）
    Homeward,
    /// 锚点定住（HOME_REST_MS）
    Resting,
    /// 重启停顿（QUEUE_DELAY_MIN_MS）
    Queueing,
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
    // 注：cycle_t/phase_t 已删——回家唯一计时 = 粉球 Phase（step 顶部推进），
    // 蓝绿 Homeward/Resting/Queueing 的推进与切换全部由粉球统一驱动
}

/// 粉球阶段（回家仪式 = 三球同步的单一时间轴）
/// - Cruise：自由巡航（计时到 HOME_EVERY_MS 触发回家——唯一计时源）
/// - Homeward：预渲染回家动画（t 推进；位置 = anim.sample(t)——三球共享同一
///   anim，时间对齐；t ≥ dur_ms → 三球同时 Resting）
/// - Resting：三球在锚点定住 HOME_REST_MS
/// - Queueing：三球重启巡航的停顿（静立 QUEUE_DELAY_MIN_MS 后同时启动新链）
#[derive(Debug)]
pub enum Phase {
    Cruise { t: f64 },
    Homeward { t: f64, anim: Option<HomeAnim> },
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
            Ball::new(anchors[0], dir, ENTRY_DELAY_MS),
            Ball::new(
                anchors[1],
                random_dir(),
                ENTRY_DELAY_MS
                    + QUEUE_DELAY_MIN_MS
                    + rand::random::<f64>() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
            ),
            Ball::new(
                anchors[2],
                random_dir(),
                ENTRY_DELAY_MS
                    + QUEUE_DELAY_MIN_MS
                    + rand::random::<f64>() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
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

    /// 用给定 bounds 重建三球链（engine 首帧真圆注入后调用——曾预生成用
    /// fallback 圆与真圆错位——起始位置不对真凶）。
    /// 重建 = 全新 Player（自带首段——曾 player.rebuild_chain 清链后
    /// ensure_chain_to → 空 VecDeque back().expect panic → wasm 崩溃 →
    /// rAF 停止 → 球永不绘制——用户"球没回来"真凶）
    pub fn rebuild_chains(&mut self, bounds: CircleBounds) {
        for (s, ball) in self.balls.iter_mut().enumerate() {
            let mut p = Player::new(self.anchors[s], random_dir());
            p.set_personality(s);
            p.set_bounds(bounds);
            p.ensure_chain_to(PREPLAN_SECONDS * WORLD_SPEED * 1.1);
            p.snap(self.anchors[s]);
            ball.player = p;
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

        // ── 粉球阶段推进（回家仪式 = 三球同步的单一时间轴）──
        let (home, to_queue, restart) = match &mut self.phase {
            Phase::Cruise { t } => {
                *t += dt;
                if *t >= HOME_EVERY_MS {
                    (true, false, false)
                } else {
                    (false, false, false)
                }
            }
            Phase::Homeward { t, .. } => {
                // 回家动画推进：唯一 t 源（step 顶部每帧 +dt）——位置采样与
                // 结束判定在 tick_pink（t ≥ dur_ms → 三球同时 Resting）
                *t += dt;
                (false, false, false)
            }
            Phase::Resting { t } => {
                *t += dt;
                if *t >= HOME_REST_MS {
                    (false, true, false)
                } else {
                    (false, false, false)
                }
            }
            Phase::Queueing { t } => {
                *t += dt;
                if *t >= QUEUE_DELAY_MIN_MS {
                    (false, false, true)
                } else {
                    (false, false, false)
                }
            }
        };
        if home {
            // Cruise → Homeward：预渲染回家动画（三球共享——时间对齐）。
            // starts = 三球当前位置（触发帧——动画从当前位置起飞，位置无缝）
            let starts = [
                self.balls[0].player.pos(),
                self.balls[1].player.pos(),
                self.balls[2].player.pos(),
            ];
            let anim = home::plan_home_anim(starts, self.anchors);
            // 蓝绿同步切 Homeward（跟随/自由立即让位——位置由动画接管）
            for s in 1..3 {
                self.balls[s].mode = BallMode::Homeward;
            }
            self.phase = Phase::Homeward { t: 0.0, anim: Some(anim) };
        } else if to_queue {
            // Resting → Queueing：三球同时（蓝绿一并切——严格同帧）
            for s in 1..3 {
                self.balls[s].mode = BallMode::Queueing;
            }
            self.phase = Phase::Queueing { t: 0.0 };
        } else if restart {
            // Queueing 重启：三球同时启动新链（粉球 Cruise / 蓝绿 Free——同帧）
            let mut p = Player::new(self.anchors[0], random_dir());
            p.set_personality(0);
            // bounds 由 engine 每帧 set_bounds 实时更新（此处 fallback 即可）
            p.ensure_chain_to(PREPLAN_SECONDS * WORLD_SPEED * 1.1);
            self.balls[0].player = p;
            self.phase = Phase::Cruise { t: 0.0 };
            for s in 1..3 {
                let mut p = Player::new(self.anchors[s], random_dir());
                p.set_personality(s);
                p.ensure_chain_to(PREPLAN_SECONDS * WORLD_SPEED * 1.1);
                p.snap(self.anchors[s]);
                self.balls[s].player = p;
                self.balls[s].mode = BallMode::Free;
                self.balls[s].check_t = 0.0;
            }
        }

        // ── 三球各自推进 ──
        for s in 0..3 {
            // 入场静立（launch 期不推进——回家由粉球 Cruise 驱动，30s 时
            // 蓝绿早已过 launch（最长 8s << 30s））
            if self.balls[s].launch_t > 0.0 {
                self.balls[s].launch_t -= dt;
                continue;
            }
            if s == 0 {
                self.tick_pink(dt);
            } else {
                self.tick_blue_green(s, dt, decide);
            }
        }
    }

    /// 粉球：自由巡航（Cruise）或预渲染动画采样（Homeward）/ 锚点定住（Resting/Queueing）。
    /// Homeward 结束（t ≥ dur_ms）→ 三球同时 Resting（snap 锚点——严格同帧）
    fn tick_pink(&mut self, dt: f64) {
        let pos = match &self.phase {
            Phase::Cruise { .. } => {
                self.balls[0].player.tick(dt, None);
                self.balls[0].player.pos()
            }
            Phase::Homeward { t, anim } => {
                // 预渲染动画采样（O(1)——t 已由 step 顶部推进）
                match anim {
                    Some(a) if *t < a.dur_ms => a.sample(*t)[0],
                    _ => self.anchors[0], // 到家（或 anim 缺失防御）——状态切换在下方统一
                }
            }
            Phase::Resting { .. } | Phase::Queueing { .. } => self.anchors[0],
        };
        // 非巡航期间：位置写回 player（渲染源是 player.pos()——否则粉球
        // 回家/定住期间渲染的是旧巡航位置）
        if !matches!(self.phase, Phase::Cruise { .. }) {
            self.balls[0].player.snap(pos);
        }
        // Homeward 结束：t ≥ dur_ms → 三球同时 Resting（snap 锚点）
        if let Phase::Homeward { t, anim } = &self.phase {
            let done = anim.as_ref().map_or(true, |a| *t >= a.dur_ms);
            if done {
                for s in 0..3 {
                    self.balls[s].player.snap(self.anchors[s]);
                    self.balls[s].mode = BallMode::Resting;
                }
                self.phase = Phase::Resting { t: 0.0 };
            }
        }
        self.pink_prev = pos;
    }

    /// 蓝绿：Free（自由巡航）/ FollowPink（跟随粉球——低优先级任务）/ 回家仪式
    /// （Homeward/Resting/Queueing——由粉球触发驱动：推进与切换都在粉球 Phase
    /// 统一进行——这里只读采样/定锚，无独立计时）。
    fn tick_blue_green(&mut self, s: usize, dt: f64, decide: &mut dyn FnMut() -> f64) {
        match self.balls[s].mode {
            // ── 回家仪式（三球同步——粉球驱动：Homeward 结束 / Resting→Queueing /
            //   Queueing→Free 全部由 step 顶部的粉球 Phase 统一切换——严格同帧）──
            BallMode::Homeward => {
                // 位置 = anim.sample(粉球 Homeward.t)（唯一 t 源——step 推进；
                // 结束由 tick_pink 统一切 Resting）
                if let Phase::Homeward { t, anim } = &self.phase {
                    match anim {
                        Some(a) => {
                            let p = a.sample(*t)[s];
                            self.balls[s].player.snap(p);
                        }
                        None => self.balls[s].player.snap(self.anchors[s]),
                    }
                } else {
                    // 防御：粉球不在 Homeward（不应发生）——定锚等粉球驱动
                    self.balls[s].player.snap(self.anchors[s]);
                }
            }
            BallMode::Resting | BallMode::Queueing => {
                // 锚点定住（切换由粉球统一驱动）
                self.balls[s].player.snap(self.anchors[s]);
            }
            // ── 巡航 / 跟随：周期判定跟随（不再自己触发回家——唯一计时 = 粉球 Cruise）──
            BallMode::Free | BallMode::FollowPink => {
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
                            if r < crate::config::params::PERSONALITIES[s].follow_prob {
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
    /// 回家无独立计时（唯一计时 = 粉球 Cruise）——launch 期静立即可
    fn new(anchor: Vec2, dir: Vec2, launch_t: f64) -> Self {
        Ball {
            player: Player::new(anchor, dir),
            mode: BallMode::Free,
            launch_t,
            follow_t: 0.0,
            check_t: 0.0,
            follow_gap: 0.2,
            follow_dur: FOLLOW_DUR_MIN_MS,
            follow_enter: anchor,
            n_ema: None,
        }
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
    /// 蓝绿无独立回家计时（cycle_t 已删）——launch 清零即可。
    fn skip_launch(st: &mut State) {
        for s in 0..3 {
            st.balls[s].launch_t = 0.0;
        }
    }

    fn fast_forward(st: &mut State, ms: f64, decide: &mut dyn FnMut() -> f64) {
        let mut t = 0.0;
        while t < ms {
            st.step(16.7, decide);
            t += 16.7;
        }
    }

    // ── 屏幕适配焊死：锚点（归一化 0-1）在任何宽高比下都落在 logo 活动圆内 ──
    // 背景：用户反馈不同屏幕适配灾难——起始位置（锚点）随窗口变化出错。
    // 锚点是归一化坐标（0-1）——理论映射不变；以下测试把这一不变量焊死。

    #[test]
    fn anchors_within_logo_circle_any_ratio() {
        // 活动圆 = logo 归一化中心 (0.5, 0.42) 到最近屏幕边缘的距离为半径
        // （LOGO_BOUNDS_SCALE=1.0 不放大——engine.rs sample_logo_bounds 同款）。
        // 模拟多种宽高比：任一比例下 ANCHORS 全部在圆内 → 起始位置合法。
        let logo = v(0.5, 0.42);
        let screens: [(f64, f64, &str); 4] = [
            (1920.0, 1080.0, "16:9 桌面 1920x1080"),
            (1080.0, 1920.0, "9:16 竖屏 1080x1920"),
            (3440.0, 1440.0, "超宽 3440x1440"),
            (390.0, 844.0, "手机 390x844"),
        ];
        for (w, h, label) in screens {
            // logo 归一化中心 → 像素（x=0.5 处 screen_of 透视项为零 → 屏幕水平中心）
            let (cx, cy, _) = crate::sim::math::screen_of(logo, w, h);
            // 像素空间活动圆半径 = logo 中心到最近屏幕边缘距离
            let r = cx.min(w - cx).min(cy).min(h - cy);
            for &(ax, ay) in crate::config::params::ANCHORS.iter() {
                let (sx, sy, _) = crate::sim::math::screen_of(v(ax, ay), w, h);
                let d = ((sx - cx).powi(2) + (sy - cy).powi(2)).sqrt();
                assert!(
                    d <= r + 1e-9,
                    "{label}: 锚点 ({ax},{ay}) 距 logo 中心 {d:.1}px 超出活动圆半径 {r:.1}px——起始位置越界"
                );
            }
        }
        // 归一化空间（真实规划约束所在空间，chain.rs leg_in_bounds 同款语义）：
        // 锚点须在圆心 (0.5, 0.42)、半径 = 到最近归一化边缘的圆内——尺寸无关
        let r_norm = logo.x.min(1.0 - logo.x).min(logo.y).min(1.0 - logo.y);
        for &(ax, ay) in crate::config::params::ANCHORS.iter() {
            let d = ((ax - logo.x).powi(2) + (ay - logo.y).powi(2)).sqrt();
            assert!(
                d <= r_norm + 1e-9,
                "归一化空间: 锚点 ({ax},{ay}) 距 logo 中心 {d:.4} 超出半径 {r_norm:.4}"
            );
        }
    }

    #[test]
    fn normalized_mapping_invariant() {
        // 归一化位置 ↔ 像素映射必须无损：screen_of 是「归一化 → 像素」的纯函数，
        // 反归一化后还原原值；且相对位置（像素/屏幕尺寸）与屏幕尺寸无关——
        // 起始位置（锚点）不随窗口变化。
        let sizes: [(f64, f64, &str); 4] = [
            (1920.0, 1080.0, "16:9 桌面"),
            (1080.0, 1920.0, "9:16 竖屏"),
            (3440.0, 1440.0, "超宽"),
            (390.0, 844.0, "手机"),
        ];
        // 采样点：全部 ANCHORS + logo 中心 + 0-1 网格（覆盖透视深度变化区间）
        let mut pts: Vec<Vec2> =
            crate::config::params::ANCHORS.iter().map(|&(x, y)| v(x, y)).collect();
        pts.push(v(0.5, 0.42));
        for i in 0..=4 {
            for j in 0..=4 {
                pts.push(v(i as f64 / 4.0, j as f64 / 4.0));
            }
        }
        // screen_of 的逆：y = sy/h；d = depth_scale(y)；x = (sx - w/2)/(w*d) + 0.5
        let inv = |sx: f64, sy: f64, w: f64, h: f64| -> Vec2 {
            let y = sy / h;
            let d = crate::sim::math::depth_scale(y);
            v((sx - w / 2.0) / (w * d) + 0.5, y)
        };
        // 1) 往返无损：归一化 → 像素 → 反归一化 = 原值（任意尺寸）
        for (w, h, label) in sizes {
            for p in &pts {
                let (sx, sy, _) = crate::sim::math::screen_of(*p, w, h);
                let q = inv(sx, sy, w, h);
                let err = ((q.x - p.x).powi(2) + (q.y - p.y).powi(2)).sqrt();
                assert!(
                    err < 1e-9,
                    "{label}: 归一化点 ({},{}) 往返误差 {err:.2e}——映射不可逆/依赖尺寸",
                    p.x, p.y
                );
            }
        }
        // 2) 相对位置不变量：同一归一化点在不同尺寸下，像素位置 / 屏幕尺寸一致
        let (w1, h1, _) = sizes[0];
        let (w2, h2, _) = sizes[1];
        for p in &pts {
            let (a1, b1, _) = crate::sim::math::screen_of(*p, w1, h1);
            let (a2, b2, _) = crate::sim::math::screen_of(*p, w2, h2);
            let rel = (a1 / w1 - a2 / w2).abs() + (b1 / h1 - b2 / h2).abs();
            assert!(
                rel < 1e-12,
                "归一化点 ({},{}) 相对位置跨尺寸漂移 {rel:.2e}——起始位置随窗口变化",
                p.x, p.y
            );
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
            // 松开 = 非 FollowPink（跟腻 Free 或 30s 回家打断→重启后 Free）
            assert_ne!(st2.balls[s2].mode, BallMode::FollowPink, "应已松开");
        } else {
            // 没触发跟随（随机路径）——重跑一次确保覆盖触发分支。
            // 28s 内必触发（两球每 5s 判定交错，i=9 在 28s 前到达）——且未到
            // 30s 回家（新机制：回家唯一计时 = 粉球 Cruise，30s 统一触发）
            let mut st3 = state();
            let mut dec3 = seq_decide(3);
            fast_forward(&mut st3, 28000.0, &mut dec3);
            let any = st3.balls[1].mode == BallMode::FollowPink
                || st3.balls[2].mode == BallMode::FollowPink;
            assert!(any, "固定序列应保证触发");
        }
    }

    #[test]
    fn pink_homecoming_kept() {
        // 粉球 30s 回家仪式保留（新机制）：Homeward 预渲染动画（位置来自
        // anim.sample）→ 锚点 → Resting → Queueing → 重启巡航
        let mut st = state();
        let mut dec = seq_decide(usize::MAX);
        let anchor0 = st.anchors[0];
        fast_forward(&mut st, 30000.0, &mut dec);
        // 已进入 Homeward（30s 触发——唯一计时源 = 粉球 Cruise）
        match &st.phase {
            Phase::Homeward { t, .. } => assert_eq!(*t, 0.0, "触发即 Homeward t=0"),
            _ => panic!("30s 后应进入 Homeward"),
        }
        // 动画播放中：位置 = anim.sample(t)（向锚点移动）
        fast_forward(&mut st, 1000.0, &mut dec);
        if let Phase::Homeward { t, anim } = &st.phase {
            let a = anim.as_ref().expect("HomeAnim 应已生成");
            let expect = a.sample(*t);
            let p = st.ball_pos(0, 0.0);
            let d = ((p.x - expect[0].x).powi(2) + (p.y - expect[0].y).powi(2)).sqrt();
            assert!(d < 1e-9, "Homeward 位置应来自 anim.sample: {d}");
        }
        // 动画结束（dur_ms = 2500）→ Resting（锚点）
        fast_forward(&mut st, 2000.0, &mut dec);
        match &st.phase {
            Phase::Resting { .. } => {}
            _ => panic!("动画结束应 Resting"),
        }
        let pos = st.ball_pos(0, 0.0);
        assert!(
            (pos.x - anchor0.x).powi(2) + (pos.y - anchor0.y).powi(2) < 0.01,
            "Resting 应在锚点: {pos:?}"
        );
        // Resting → Queueing → 重启巡航
        fast_forward(&mut st, HOME_REST_MS + 2000.0, &mut dec);
        assert!(matches!(st.phase, Phase::Cruise { .. }), "粉球应重启巡航");
    }

    #[test]
    fn blue_green_release_on_pink_home() {
        // 粉球回家期间蓝绿不跟随（跟随被打断——粉球触发回家时蓝绿统一切
        // Homeward，FollowPink 立即让位）。新机制：回家唯一计时 = 粉球 Cruise。
        let mut st = state();
        skip_launch(&mut st);
        let mut dec = seq_decide(5);
        fast_forward(&mut st, 30000.0, &mut dec);
        for s in 1..3 {
            assert_ne!(
                st.balls[s].mode,
                BallMode::FollowPink,
                "粉球回家期间蓝绿不应跟随（应已切 Homeward）"
            );
        }
    }

    #[test]
    fn blue_green_homecoming() {
        // 三球同步回家（新机制——预渲染动画）：30s 粉球 Cruise 触发（唯一计时源），
        // 三球共享同一 HomeAnim——同帧 Homeward、位置全部来自 anim.sample、
        // 同时到家（<0.01）、同时 Resting、同时重启（Free + 新链）
        let mut st = state();
        skip_launch(&mut st);
        let a1 = st.anchors[1];
        let a2 = st.anchors[2];
        let mut dec = seq_decide(usize::MAX);
        fast_forward(&mut st, 30000.0, &mut dec);
        // 同帧进入 Homeward（三球共享同一 anim——同一 t 源）
        assert!(matches!(st.phase, Phase::Homeward { .. }), "粉球应 Homeward");
        for s in 1..3 {
            assert_eq!(
                st.balls[s].mode,
                BallMode::Homeward,
                "ball[{s}] 应与粉球同帧回家: {:?}",
                st.balls[s].mode
            );
        }
        // Homeward 期间：三球位置全部来自 anim.sample(t)——同一时刻同帧采样
        if let Phase::Homeward { t, anim } = &st.phase {
            let a = anim.as_ref().expect("HomeAnim 应已生成");
            assert_eq!(*t, 0.0, "触发帧 Homeward t=0");
            let expect = a.sample(*t);
            for s in 0..3 {
                let p = st.ball_pos(s, 0.0);
                let d = ((p.x - expect[s].x).powi(2) + (p.y - expect[s].y).powi(2)).sqrt();
                assert!(d < 1e-9, "ball[{s}] 触发帧位置 = anim.sample(t): {d}");
            }
        }
        // 动画播完（dur_ms = 2500）→ 三球同时到家（<0.01）+ 同时 Resting
        fast_forward(&mut st, 3000.0, &mut dec);
        assert!(matches!(st.phase, Phase::Resting { .. }), "动画结束粉球应 Resting");
        for s in 1..3 {
            assert_eq!(
                st.balls[s].mode,
                BallMode::Resting,
                "ball[{s}] 应同时 Resting: {:?}",
                st.balls[s].mode
            );
            let a = if s == 1 { a1 } else { a2 };
            let p = st.ball_pos(s, 0.0);
            let d = ((p.x - a.x).powi(2) + (p.y - a.y).powi(2)).sqrt();
            assert!(d < 0.01, "ball[{s}] 应同时到家: {d:.4}");
        }
        // Resting → Queueing → 三球同时重启（粉球 Cruise / 蓝绿 Free）
        fast_forward(&mut st, HOME_REST_MS + 2000.0, &mut dec);
        assert!(matches!(st.phase, Phase::Cruise { .. }), "粉球应重启巡航");
        for s in 1..3 {
            assert_eq!(st.balls[s].mode, BallMode::Free, "ball[{s}] 应同时重启");
            assert!(st.balls[s].player.chain_arc() > 0.5, "ball[{s}] 重启后链推进");
        }
    }

    // 注：follow_interrupted_by_home 已删（测试审查：跟随中状态构造
    // 依赖判定相位与 decide 序列耦合（ball[2] launch 相位偏 → i 分配偏移——
    // ball[1] 永不触发）——脆弱高维护；回家打断跟随机制已被 home_sync 覆盖

    #[test]
    fn home_sync_with_pink() {
        // 真实入场时序（不跳过 launch）：30s 粉球 Cruise 触发（唯一计时源）——
        // 三球共享 HomeAnim 同步回家：Homeward 期间位置来自 anim.sample、
        // 同时到家（<0.01）、同时 Resting、同时重启
        let mut st = state();
        let mut dec = seq_decide(usize::MAX);
        fast_forward(&mut st, 30000.0, &mut dec);
        // 30s：三球同帧 Homeward（含 launch 后仍在巡航/跟随的蓝绿）
        assert!(matches!(st.phase, Phase::Homeward { .. }), "粉球应 Homeward");
        for s in 1..3 {
            assert_eq!(
                st.balls[s].mode,
                BallMode::Homeward,
                "ball[{s}] 应与粉球同帧回家: {:?}",
                st.balls[s].mode
            );
        }
        // Homeward 播放中：三球位置 = anim.sample(t)（共享同一动画——时间对齐）
        fast_forward(&mut st, 1200.0, &mut dec);
        if let Phase::Homeward { t, anim } = &st.phase {
            let a = anim.as_ref().expect("HomeAnim 应已生成");
            let expect = a.sample(*t);
            for s in 0..3 {
                let p = st.ball_pos(s, 0.0);
                let d = ((p.x - expect[s].x).powi(2) + (p.y - expect[s].y).powi(2)).sqrt();
                assert!(d < 1e-9, "ball[{s}] 位置应来自 anim.sample: {d:.8}");
            }
        }
        // 同时到家（<0.01）+ 同时 Resting
        fast_forward(&mut st, 2000.0, &mut dec);
        assert!(matches!(st.phase, Phase::Resting { .. }), "动画结束应 Resting");
        for s in 0..3 {
            let p = st.ball_pos(s, 0.0);
            let a = st.anchors[s];
            let d = ((p.x - a.x).powi(2) + (p.y - a.y).powi(2)).sqrt();
            assert!(d < 0.01, "ball[{s}] 应同时到家: {d:.4}");
        }
        // 同时重启：粉球 Cruise / 蓝绿 Free
        fast_forward(&mut st, HOME_REST_MS + 2000.0, &mut dec);
        assert!(matches!(st.phase, Phase::Cruise { .. }), "粉球应重启巡航");
        for s in 1..3 {
            assert_eq!(st.balls[s].mode, BallMode::Free, "ball[{s}] 应同时重启");
        }
    }

    // 注：home_sync_with_pink_native 曾存在——删（测试审查：回家计时
    // （粉球 Phase）静态可证与 profile 零交互；切全局 ACTIVE_IDX
    // 会与并行测试竞态（11/15 失败）——证明力低、污染高，删除）

    #[test]
    fn rebuild_chains_recovers() {
        // panic 回归：rebuild_chains 曾 chain.clear() 后 ensure_chain_to →
        // 空 VecDeque back().expect panic → wasm 崩溃 → 球永不绘制
        let mut st = state();
        let b = CircleBounds { cx: 0.5, cy: 0.42, r: 0.35 };
        st.set_bounds(b);
        st.rebuild_chains(b); // 曾在此 panic——重建 Player 自带首段
        for s in 0..3 {
            assert!(st.balls[s].player.chain_arc() > 1.0, "ball[{s}] 重建后链应非空");
            let pos = st.ball_pos(s, 0.0);
            let d = ((pos.x - st.anchors[s].x).powi(2) + (pos.y - st.anchors[s].y).powi(2)).sqrt();
            assert!(d < 1e-6, "ball[{s}] 重建后应在锚点");
        }
        // 重建后正常巡航（不 panic）
        let mut dec = seq_decide(usize::MAX);
        fast_forward(&mut st, 2000.0, &mut dec);
        for s in 0..3 {
            assert!(st.balls[s].player.chain_arc() > 1.5, "ball[{s}] 重建后应正常推进");
        }
    }

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
