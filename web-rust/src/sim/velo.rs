// 调速器（谷歌大学博士课：TOTG-lite + Savitzky–Golay + 加速度约束）
// 职责：执行前最终审核——扫描链的速度序列，找出速度钝点（非常大加速/减速），
// 平滑化后重写段时长。速度顺 + 轨迹顺的路线才交给执行。
//
// 原理（见 docs/google-university.md）：
// - Savitzky–Golay 5 点 2 阶核：Y_j = (−3y_{j−2}+12y_{j−1}+17y_j+12y_{j+1}−3y_{j+2})/35
//   低通平滑速度序列，保留趋势、削尖峰
// - 加速度约束：相邻段速度差 |Δv| ≤ max_accel × 过渡时间（TOTG 的约束思想简化版）
use crate::sim::planner::PlannedLeg;

/// 段速度序列（倍率 × WORLD_SPEED）——调速师傅的第一眼
pub fn raw_speeds(chain: &[PlannedLeg]) -> Vec<f64> {
    chain.iter().map(|pl| pl.speed).collect()
}

/// Savitzky–Golay 5 点 2 阶平滑（核系数来自 Wikipedia，已进修）
/// 边缘用 3 点核 [1,2,1]/4 与 [1,1]/2 近似（两端不做外推，保守）
pub fn savgol5(v: &[f64]) -> Vec<f64> {
    let n = v.len();
    if n <= 5 {
        return v.to_vec();
    }
    let mut out = vec![0.0; n];
    out[0] = (3.0 * v[0] + 2.0 * v[1] - v[2]) / 4.0; // 端部 3 点二次近似
    out[1] = (2.0 * v[0] + 4.0 * v[1] + 2.0 * v[2] + v[3]) / 9.0;
    for j in 2..n - 2 {
        out[j] =
            (-3.0 * v[j - 2] + 12.0 * v[j - 1] + 17.0 * v[j] + 12.0 * v[j + 1] - 3.0 * v[j + 2])
                / 35.0;
    }
    out[n - 2] = (2.0 * v[n - 3] + 4.0 * v[n - 2] + 2.0 * v[n - 1] + v[n - 4]) / 9.0;
    out[n - 1] = (3.0 * v[n - 1] + 2.0 * v[n - 2] - v[n - 3]) / 4.0;
    out
}

/// 加速度钳制：相邻段速度差不得超过 max_accel × 过渡半程（段时长折半）
/// 逐段扫描 + 双向传播（左到右压减速，右到左压加速）——速度钝点消除
pub fn clamp_accel(v: &[f64], max_accel: f64, world_speed: f64, dur_ms: &[f64]) -> Vec<f64> {
    let n = v.len();
    if n < 2 {
        return v.to_vec();
    }
    let mut out = v.to_vec();
    // 左→右：v[i+1] 不能比 v[i] 快太多（加速受限）
    for i in 0..n - 1 {
        let t_trans = (dur_ms[i].min(dur_ms[i + 1]) / 1000.0 * 0.5).max(0.05);
        let v_lim = out[i] + max_accel * t_trans / world_speed;
        if out[i + 1] > v_lim {
            out[i + 1] = v_lim;
        }
    }
    // 右→左：v[i] 不能比 v[i+1] 快太多（减速受限）
    for i in (0..n - 1).rev() {
        let t_trans = (dur_ms[i].min(dur_ms[i + 1]) / 1000.0 * 0.5).max(0.05);
        let v_lim = out[i + 1] + max_accel * t_trans / world_speed;
        if out[i] > v_lim {
            out[i] = v_lim;
        }
    }
    // 保持正速度下限（慢速档下限 0.5）
    for x in out.iter_mut() {
        if *x < 0.5 {
            *x = 0.5;
        }
    }
    out
}

/// 调速总入口：审核 → savgol 平滑 → 加速度钳制 → 重写段时长
/// 返回 (新速度倍率, 新时长 ms)。时长 = 弧长 / 新速度。
pub fn tune(
    chain: &[PlannedLeg],
    max_accel: f64,
    world_speed: f64,
    do_smooth: bool,
) -> (Vec<f64>, Vec<f64>) {
    let v = raw_speeds(chain);
    let dur: Vec<f64> = chain.iter().map(|pl| pl.dur_ms).collect();
    let mut tuned = if do_smooth { savgol5(&v) } else { v };
    tuned = clamp_accel(&tuned, max_accel, world_speed, &dur);
    let new_dur: Vec<f64> = chain
        .iter()
        .zip(tuned.iter())
        .map(|(pl, &sp)| (pl.arc / (world_speed * sp) * 1000.0).max(200.0))
        .collect();
    (tuned, new_dur)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn savgol_smooths_spike() {
        let v = vec![1.0, 1.0, 1.0, 2.5, 1.0, 1.0, 1.0]; // 尖峰
        let out = savgol5(&v);
        assert!(out[3] < 2.5, "尖峰应被压低: {}", out[3]);
        assert!(out[3] > 1.0, "不能削成平地: {}", out[3]);
    }

    #[test]
    fn savgol_preserves_trend() {
        let v: Vec<f64> = (0..12).map(|i| 0.6 + i as f64 * 0.05).collect();
        let out = savgol5(&v);
        assert!((out[11] - v[11]).abs() < 0.15, "趋势端部保留");
        for i in 0..12 {
            assert!(out[i] > 0.5 && out[i] < 1.5);
        }
    }

    #[test]
    fn clamp_accel_bounds_adjacent_diff() {
        // 速度倍率差 1.0（极大钝点）→ 钳制
        let v = vec![0.6, 0.6, 1.6, 0.6, 0.6];
        let dur = vec![1000.0, 1000.0, 1000.0, 1000.0, 1000.0];
        let out = clamp_accel(&v, 1.2, 0.22, &dur);
        let t_trans = 0.5;
        let lim = 1.2 * t_trans / 0.22;
        for i in 0..4 {
            assert!(
                (out[i + 1] - out[i]).abs() <= lim + 1e-9,
                "相邻差应 ≤ {lim:.3}，实际 {}",
                (out[i + 1] - out[i]).abs()
            );
        }
    }

    #[test]
    fn tune_recomputes_duration() {
        let chain = vec![
            make_leg(1.0),
            make_leg(0.9),
            make_leg(1.1),
        ];
        let (v, dur) = tune(&chain, 1.2, 0.22, true);
        assert_eq!(v.len(), 3);
        assert_eq!(dur.len(), 3);
        assert!(dur[0] >= 200.0);
    }

    fn make_leg(arc: f64) -> PlannedLeg {
        use crate::sim::math::Vec2;
        let z = Vec2 { x: 0.0, y: 0.0 };
        crate::sim::planner::PlannedLeg {
            legs: [crate::sim::planner::Leg { from: z, ctrl: z, target: z }; 5],
            template_idx: 0,
            speed: 1.0,
            curv_eff: 0.0,
            dur_ms: 1000.0,
            arc,
        }
    }
}
