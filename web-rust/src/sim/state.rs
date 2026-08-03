// 状态机（纯逻辑，原生可测）：入场静止构图 → 粉球先行蓝绿跟上 → 永久编队巡航
// - Free 阶段已删除（做不好就去掉）：三球永远成队，链无限延伸
// - 不依赖 web_sys/wasm
use crate::config::params::*;
use crate::sim::math::{lerp, smoothstep, Vec2};
use crate::sim::planner::Player;

/// 动画阶段
/// - Queueing：入场——三球静止构图，粉球 delay 后沿链开跑，蓝绿再等 1-3s 滑向槽位跟上
/// - Formation：永久编队巡航（粉蓝绿沿链错开），链无限增长，模板/速度/摆动段级变化
pub enum Phase {
    Queueing {
        t: f64,
        player: Player,
        /// 静止构图位置（= 锚点）
        from: [Vec2; 3],
        /// 每球思考期（粉 5s；蓝绿 5+1-3s）——各自决定啥时候跟上粉球
        delays: [f64; 3],
    },
    Formation { player: Player },
}

pub struct State {
    phase: Phase,
    /// 页面年龄（淡入用）
    age: f64,
}

impl State {
    /// 开场：三球静止构图（粉球停 5 秒），粉球先行、蓝绿思考后跟上，然后永久巡航
    pub fn new(anchors: [Vec2; 3]) -> Self {
        let dir = random_dir();
        let mut player = Player::new(anchors[0], dir);
        // 预生成风暴：入场空闲期一次性生成几分钟的链（运行期 ensure_chain 静默）
        player.ensure_chain_to(PREPLAN_SECONDS * WORLD_SPEED * 1.1);
        // 开场节奏：粉球先停 5 秒，蓝绿在粉球出发后再等 1-3 秒
        let delays = [
            ENTRY_DELAY_MS,
            ENTRY_DELAY_MS
                + QUEUE_DELAY_MIN_MS
                + rand::random::<f64>() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
            ENTRY_DELAY_MS
                + QUEUE_DELAY_MIN_MS
                + rand::random::<f64>() * (QUEUE_DELAY_MAX_MS - QUEUE_DELAY_MIN_MS),
        ];
        State {
            phase: Phase::Queueing { t: 0.0, player, from: anchors, delays },
            age: 0.0,
        }
    }

    /// 推进一帧。`decide` 保留签名（历史测试兼容；当前状态机无随机决策点）
    pub fn step(&mut self, dt: f64, _decide: &mut dyn FnMut() -> f64) {
        self.age += dt;
        let mut next: Option<Phase> = None;
        match &mut self.phase {
            Phase::Queueing { t, player, delays, .. } => {
                *t += dt;
                player.tick(dt);
                // 完成条件 = 最晚思考期 + 滑行期 + 余量
                let max_delay = delays.iter().cloned().fold(0.0, f64::max);
                if *t >= max_delay + QUEUE_TRANSIT_MS + 200.0 {
                    // 过渡完成 → 永久编队巡航（player 直接转移，无跳变）
                    let player = std::mem::replace(
                        player,
                        Player::new(Vec2 { x: 0.5, y: 0.5 }, Vec2 { x: 1.0, y: 0.0 }),
                    );
                    next = Some(Phase::Formation { player });
                }
            }
            Phase::Formation { player } => {
                // 永久巡航：链无限增长，段级变化（曲线/速度/摆动）由 Player 内部驱动
                player.tick(dt);
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
                // 思考期（t < delay）：静止构图；思考结束 2s 内自然汇入链上槽位
                let k = smoothstep(((t - delays[color_slot]) / QUEUE_TRANSIT_MS).clamp(0.0, 1.0));
                let slot = player.world_pos(color_slot, offset);
                lerp(from[color_slot], slot, k)
            }
            Phase::Formation { player } => player.world_pos(color_slot, offset),
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
            Phase::Formation { player } => player.order,
            _ => [0, 1, 2],
        }
    }

    /// 共享链阶段使用固定队形常量
    pub fn template_offsets(&self) -> Option<[f64; 3]> {
        Some(FORMATION_OFFSETS)
    }

    /// 调试：Formation 阶段的目标点（其他阶段 None）
    pub fn formation_targets(&self) -> Option<[Vec2; 3]> {
        match &self.phase {
            Phase::Formation { player } => {
                Some([player.target_of(0), player.target_of(1), player.target_of(2)])
            }
            _ => None,
        }
    }
}

/// 拖尾是否记录：速度（世界单位/秒）低于阈值视为静止（思考期/入场构图）不记录
pub fn should_track(speed_per_sec: f64) -> bool {
    speed_per_sec >= 0.02
}

/// 拖尾历史点上限：高速跳跃段拉长（12），常规 8
pub fn trail_cap(speed_per_sec: f64) -> usize {
    if speed_per_sec > JUMP_SPEED {
        TRAIL_FRAMES_HIGH
    } else {
        8
    }
}

pub fn random_dir() -> Vec2 {
    let angle = rand::random::<f64>() * std::f64::consts::PI * 2.0;
    Vec2 { x: angle.cos(), y: angle.sin() }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trail_tracking_decisions() {
        // 巡航（0.22/s）→ 记录 + 常规 8 点；静止（0.01）→ 不记录；跳跃（0.5）→ 12 点
        assert!(should_track(0.22), "巡航应记录拖尾");
        assert!(should_track(0.05));
        assert!(!should_track(0.01), "静止不记录（思考期无拖尾）");
        assert_eq!(trail_cap(0.22), 8, "巡航常规上限");
        assert_eq!(trail_cap(0.5), TRAIL_FRAMES_HIGH, "高速跳跃拉长");
        assert_eq!(trail_cap(0.1), 8);
    }

    #[test]
    fn opens_directly_in_queueing() {
        // 开场即排队表演：没有自由乱跑
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let s = State::new(anchors);
        assert!(matches!(s.phase, Phase::Queueing { .. }), "开场即排队表演");
    }

    #[test]
    fn entry_rhythm_pink_waits_then_runs() {
        // 开场节奏：粉球先停 ENTRY_DELAY_MS（5s），期间不动，之后开跑
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let mut s = State::new(anchors);
        let p0_first = s.ball_pos(0, 0.0);
        let mut moved_early = false;
        let mut moved_later = false;
        let mut decide = |_: &mut dyn FnMut() -> f64| {};
        let _ = &mut decide;
        for _ in 0..(ENTRY_DELAY_MS / 16.7) as usize - 5 {
            s.step(16.7, &mut || 0.5);
            let p = s.ball_pos(0, 0.0);
            if (p.x - p0_first.x).abs() > 1e-6 || (p.y - p0_first.y).abs() > 1e-6 {
                moved_early = true;
            }
        }
        assert!(!moved_early, "粉球开场应先停 5 秒（构图停留）");
        for _ in 0..60 {
            s.step(16.7, &mut || 0.5);
            let p = s.ball_pos(0, 0.0);
            if (p.x - p0_first.x).abs() > 1e-6 || (p.y - p0_first.y).abs() > 1e-6 {
                moved_later = true;
            }
        }
        assert!(moved_later, "5 秒后粉球开跑（蓝绿之后再跟上）");
    }

    #[test]
    fn queueing_advances_to_formation() {
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let mut s = State::new(anchors);
        let total = (ENTRY_DELAY_MS + QUEUE_DELAY_MAX_MS + QUEUE_TRANSIT_MS + 500.0) / 16.7;
        for _ in 0..total as usize + 10 {
            s.step(16.7, &mut || 0.5);
        }
        assert!(
            matches!(s.phase, Phase::Formation { .. }),
            "Queueing 超时后应进入 Formation"
        );
    }

    #[test]
    fn formation_never_ends() {
        // Free 已删除：Formation 永久巡航（30s 后仍是 Formation，且球持续运动）
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let mut s = State::new(anchors);
        let total = (ENTRY_DELAY_MS + QUEUE_DELAY_MAX_MS + QUEUE_TRANSIT_MS + 500.0) / 16.7;
        for _ in 0..total as usize + 10 {
            s.step(16.7, &mut || 0.5);
        }
        assert!(matches!(s.phase, Phase::Formation { .. }));
        let last = s.ball_pos(0, 0.0);
        let mut moved = false;
        for _ in 0..(30.0 * 1000.0 / 16.7) as usize {
            s.step(16.7, &mut || 0.5);
            assert!(matches!(s.phase, Phase::Formation { .. }), "Formation 应永久");
            let p = s.ball_pos(0, 0.0);
            if (p.x - last.x).abs() > 1e-6 || (p.y - last.y).abs() > 1e-6 {
                moved = true;
            }
        }
        assert!(moved, "Formation 期间球应持续运动（无限轨迹）");
    }

    #[test]
    fn no_teleport_at_transition() {
        // Queueing → Formation 转移瞬间球位置连续（无跳变）
        let anchors = [Vec2 { x: 0.2, y: 0.2 }, Vec2 { x: 0.4, y: 0.4 }, Vec2 { x: 0.6, y: 0.6 }];
        let mut s = State::new(anchors);
        let mut last = [Vec2 { x: 0.0, y: 0.0 }; 3];
        for slot in 0..3 {
            last[slot] = s.ball_pos(slot, 0.0);
        }
        let mut max_jump = 0.0;
        let total = (ENTRY_DELAY_MS + QUEUE_DELAY_MAX_MS + QUEUE_TRANSIT_MS + 500.0) / 16.7;
        for _ in 0..total as usize + 5 {
            s.step(16.7, &mut || 0.5);
            for slot in 0..3 {
                let p = s.ball_pos(slot, 0.0);
                let d = ((p.x - last[slot].x).powi(2) + (p.y - last[slot].y).powi(2)).sqrt();
                if d > max_jump {
                    max_jump = d;
                }
                last[slot] = p;
            }
        }
        assert!(max_jump < 0.05, "转移不应产生位置跳变，最大跳变 {max_jump}");
    }

    #[test]
    fn lifecycle_90s_no_teleport() {
        // 90s 完整生命周期：任何球任何时刻帧间跳变 > 0.08 即报
        let anchors = [Vec2 { x: 0.555, y: 0.355 }, Vec2 { x: 0.473, y: 0.379 }, Vec2 { x: 0.525, y: 0.471 }];
        let mut s = State::new(anchors);
        let mut last = [Vec2 { x: 0.0, y: 0.0 }; 3];
        for slot in 0..3 {
            last[slot] = s.ball_pos(slot, 0.0);
        }
        let mut worst = (0.0f64, 0usize, 0usize, 0.0);
        for i in 0..(90.0 * 1000.0 / 16.7) as usize {
            s.step(16.7, &mut || 0.5);
            for slot in 0..3 {
                let p = s.ball_pos(slot, 0.0);
                let d = ((p.x - last[slot].x).powi(2) + (p.y - last[slot].y).powi(2)).sqrt();
                if d > worst.0 {
                    worst = (d, slot, i, i as f64 * 16.7 / 1000.0);
                }
                last[slot] = p;
            }
        }
        assert!(
            worst.0 < 0.08,
            "90s 生命周期出现跳变: 球{} 第{}帧({:.1}s) 跳变 {:.4}",
            worst.1, worst.2, worst.3, worst.0
        );
    }
}
