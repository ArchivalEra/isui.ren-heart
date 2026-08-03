// 状态机（纯逻辑，原生可测）：开场直接「粉球先行、蓝绿跟上」的排队表演
// - 转移决策通过 `decide` 注入（生产 = rand，测试 = 固定序列）→ 确定性可测
// - 不依赖 web_sys/wasm
use crate::config::params::*;
use crate::sim::math::{lerp, smoothstep, Vec2};
use crate::sim::planner::Player;

/// 动画阶段
/// - Queueing：粉球立刻沿共享链开跑；蓝绿各自思考 delays[i] 后 2s 内滑向槽位
/// - Formation：共享链排队跑（粉蓝绿沿链错开），维持随机时长后解散
/// - Free：三球各自独立链自由运动；每 5s 判定 30% 概率触发下一次排队
pub enum Phase {
    Queueing {
        t: f64,
        player: Player,
        /// 进入排队时三球位置快照（思考期冻结点）
        from: [Vec2; 3],
        /// 每球思考期（粉 0；蓝绿随机 1-3s）
        delays: [f64; 3],
    },
    Formation {
        player: Player,
        hold_t: f64,
        hold_ms: f64,
    },
    Free {
        players: [Player; 3],
        check_t: f64,
    },
}

pub struct State {
    phase: Phase,
    /// 页面年龄（淡入用）
    age: f64,
}

impl State {
    /// 开场直接进入排队表演：粉球在锚点[0]开跑，蓝绿从锚点思考后跟上
    pub fn new(anchors: [Vec2; 3]) -> Self {
        let dir = random_dir();
        let player = Player::new(anchors[0], dir);
        let delays = [
            0.0,
            QUEUE_DELAY_MIN_MS
                + rand::random::<f64>() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
            QUEUE_DELAY_MIN_MS
                + rand::random::<f64>() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
        ];
        State {
            phase: Phase::Queueing { t: 0.0, player, from: anchors, delays },
            age: 0.0,
        }
    }

    /// 推进一帧。`decide` 返回 [0,1) 的决策值（生产 = rand，测试 = 固定序列）
    pub fn step(&mut self, dt: f64, decide: &mut dyn FnMut() -> f64) {
        self.age += dt;
        let mut next: Option<Phase> = None;
        match &mut self.phase {
            Phase::Queueing { t, player, .. } => {
                *t += dt;
                player.tick(dt);
                if *t >= QUEUE_MS {
                    // 过渡完成 → 正式排队跑（player 直接转移，无跳变）
                    let player = std::mem::replace(
                        player,
                        Player::new(Vec2 { x: 0.5, y: 0.5 }, Vec2 { x: 1.0, y: 0.0 }),
                    );
                    next = Some(Phase::Formation {
                        player,
                        hold_t: 0.0,
                        hold_ms: FORMATION_HOLD_MIN_MS
                            + decide() * (FORMATION_HOLD_MAX_MS - FORMATION_HOLD_MIN_MS),
                    });
                }
            }
            Phase::Formation { player, hold_t, hold_ms } => {
                *hold_t += dt;
                player.tick(dt);
                if *hold_t >= *hold_ms {
                    // 自然解散：三球各自独立链（起点=当前位置，方向=链切线）
                    let players = [
                        {
                            let (pos, dir) = player.pos_and_dir(0);
                            Player::new(pos, dir)
                        },
                        {
                            let (pos, dir) = player.pos_and_dir(1);
                            Player::new(pos, dir)
                        },
                        {
                            let (pos, dir) = player.pos_and_dir(2);
                            Player::new(pos, dir)
                        },
                    ];
                    next = Some(Phase::Free { players, check_t: 0.0 });
                }
            }
            Phase::Free { players, check_t } => {
                *check_t += dt;
                for p in players.iter_mut() {
                    p.tick(dt);
                }
                // 每 5 秒判定：30% 概率触发下一次排队（固定粉蓝绿，粉队首）
                if *check_t >= FREE_CHECK_MS {
                    *check_t = 0.0;
                    if decide() < QUEUE_PROB {
                        let dir = random_dir();
                        let anchor = players[0].ball_center(0);
                        let player = Player::new(anchor, dir);
                        let mut from = [Vec2 { x: 0.0, y: 0.0 }; 3];
                        for (i, p) in players.iter().enumerate() {
                            from[i] = p.ball_center(i);
                        }
                        let delays = [
                            0.0,
                            QUEUE_DELAY_MIN_MS
                                + decide() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
                            QUEUE_DELAY_MIN_MS
                                + decide() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
                        ];
                        next = Some(Phase::Queueing { t: 0.0, player, from, delays });
                    }
                }
            }
        }
        if let Some(p) = next {
            self.phase = p;
        }
    }

    /// 球 i 渲染位置（含法线偏移）
    pub fn ball_pos(&self, color_slot: usize, offset: f64) -> Vec2 {
        match &self.phase {
            Phase::Queueing { t, player, from, delays } => {
                // 思考期（t < delay）：冻结在进入时位置；思考结束 2s 内滑向链上槽位
                let k = smoothstep(((t - delays[color_slot]) / QUEUE_TRANSIT_MS).clamp(0.0, 1.0));
                let slot = player.world_pos(color_slot, offset);
                lerp(from[color_slot], slot, k)
            }
            Phase::Formation { player, .. } => player.world_pos(color_slot, offset),
            Phase::Free { players, .. } => players[color_slot].world_pos(color_slot, offset),
        }
    }

    /// 拖尾采样开关：三球实际在动才算
    pub fn is_playing(&self) -> bool {
        true
    }

    /// 淡入（页面年龄）
    pub fn fade(&self) -> f64 {
        smoothstep(self.age / FADE_IN_MS)
    }

    /// 渲染排列（Formation 由 Player 随机换序）
    pub fn order(&self) -> [usize; 3] {
        match &self.phase {
            Phase::Formation { player, .. } => player.order,
            _ => [0, 1, 2],
        }
    }

    /// 共享链阶段（Queueing/Formation）的链头模板 offsets；Free 阶段 None
    pub fn template_offsets(&self) -> Option<[f64; 3]> {
        match &self.phase {
            Phase::Queueing { player, .. } | Phase::Formation { player, .. } => {
                Some(crate::config::templates::TEMPLATES[player.template_idx(0)].offsets)
            }
            Phase::Free { .. } => None,
        }
    }

    /// 调试：Formation 阶段的目标点（其他阶段 None）
    pub fn formation_targets(&self) -> Option<[Vec2; 3]> {
        match &self.phase {
            Phase::Formation { player, .. } => {
                Some([player.target_of(0), player.target_of(1), player.target_of(2)])
            }
            _ => None,
        }
    }
}

pub fn random_dir() -> Vec2 {
    let angle = rand::random::<f64>() * std::f64::consts::PI * 2.0;
    Vec2 { x: angle.cos(), y: angle.sin() }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// 决策注入：固定序列（先返回 0.9 系列避开排队判定，再指定概率）
    fn decide_seq(values: &mut Vec<f64>) -> impl FnMut() -> f64 + '_ {
        move || {
            if values.is_empty() {
                0.99 // 默认：不触发
            } else {
                values.remove(0)
            }
        }
    }

    #[test]
    fn opens_directly_in_queueing() {
        // 4️⃣ 开场直接「粉球先行蓝绿跟上」：没有 AtLogo 停留、没有自由乱跑
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let s = State::new(anchors);
        assert!(matches!(s.phase, Phase::Queueing { .. }), "开场即排队表演");
    }

    #[test]
    fn queueing_advances_to_formation() {
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let mut s = State::new(anchors);
        // 粉球先跑：t=0 起粉球就在动（s_lead 推进）
        let p0_first = s.ball_pos(0, 0.0);
        let mut moved = false;
        let mut decisions = vec![0.5]; // hold_ms 用
        let mut decide = decide_seq(&mut decisions);
        for _ in 0..50 {
            s.step(16.7, &mut decide);
            let p = s.ball_pos(0, 0.0);
            if (p.x - p0_first.x).abs() > 1e-6 || (p.y - p0_first.y).abs() > 1e-6 {
                moved = true;
            }
        }
        assert!(moved, "粉球开场立刻开跑（不等蓝绿）");
        // 模拟到过渡完成 → Formation
        for _ in 0..(QUEUE_MS / 16.7) as usize + 10 {
            s.step(16.7, &mut decide);
        }
        assert!(
            matches!(s.phase, Phase::Formation { .. }),
            "Queueing 超时后应进入 Formation"
        );
    }

    #[test]
    fn formation_dissolves_to_free() {
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let mut s = State::new(anchors);
        let mut decisions = vec![0.5]; // hold_ms = 8s + 0.5×10s = 13s
        let mut decide = decide_seq(&mut decisions);
        // 走完 Queueing
        for _ in 0..(QUEUE_MS / 16.7) as usize + 10 {
            s.step(16.7, &mut decide);
        }
        // hold 期间是 Formation；超过 hold_ms（13s）后解散
        let mut dissolved = false;
        for i in 0..(16.0 * 1000.0 / 16.7) as usize {
            s.step(16.7, &mut decide);
            if matches!(s.phase, Phase::Free { .. }) {
                dissolved = true;
                break;
            }
            assert!(
                !matches!(s.phase, Phase::Queueing { .. }),
                "hold 期间不应回到 Queueing（第 {i} 帧）"
            );
        }
        assert!(dissolved, "Formation 应自然解散回 Free");
    }

    #[test]
    fn free_triggers_queueing_on_decision() {
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let mut s = State::new(anchors);
        let mut decisions = vec![0.5]; // hold_ms
        let mut decide = decide_seq(&mut decisions);
        // 到 Free
        for _ in 0..(QUEUE_MS / 16.7) as usize + (16.0 * 1000.0 / 16.7) as usize + 10 {
            s.step(16.7, &mut decide);
        }
        assert!(matches!(s.phase, Phase::Free { .. }), "应已解散到 Free");
        // 下一个判定周期：decide 返回 0.1 < QUEUE_PROB(0.3) → 触发排队
        let mut decisions2 = vec![0.1, 0.5, 0.5, 0.5]; // 触发 + delays×2 + hold
        let mut decide2 = decide_seq(&mut decisions2);
        let mut triggered = false;
        for _ in 0..(FREE_CHECK_MS / 16.7) as usize + 10 {
            s.step(16.7, &mut decide2);
            if matches!(s.phase, Phase::Queueing { .. }) {
                triggered = true;
                break;
            }
        }
        assert!(triggered, "5s 判定 + 决策 < 0.3 → 应再次排队");
    }

    #[test]
    fn no_teleport_at_phase_boundaries() {
        // 转移瞬间球位置连续（无跳变）：Queueing 结束 → Formation 开始
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let mut s = State::new(anchors);
        let mut decisions = vec![0.5];
        let mut decide = decide_seq(&mut decisions);
        let mut last = [Vec2 { x: 0.0, y: 0.0 }; 3];
        for slot in 0..3 {
            last[slot] = s.ball_pos(slot, 0.0);
        }
        let mut max_jump = 0.0;
        for _ in 0..(QUEUE_MS / 16.7) as usize + 5 {
            s.step(16.7, &mut decide);
            for slot in 0..3 {
                let p = s.ball_pos(slot, 0.0);
                let d = ((p.x - last[slot].x).powi(2) + (p.y - last[slot].y).powi(2)).sqrt();
                if d > max_jump {
                    max_jump = d;
                }
                last[slot] = p;
            }
        }
        assert!(
            max_jump < 0.05,
            "阶段转移不应产生位置跳变（闪现），最大跳变 {max_jump}"
        );
    }
}
