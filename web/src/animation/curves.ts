// 曲线数学：每种模板的曲线函数与法线
// 所有曲线返回归一化坐标 {x, y} ∈ [0,1]×[0,1]，由引擎缩放到画布

export interface Vec2 {
  x: number
  y: number
}

export type CurveFn = (t: number) => Vec2

/** 数值微分求切线，旋转 90° 得法线（归一化） */
export function normalAt(curve: CurveFn, t: number, eps = 0.001): Vec2 {
  const a = curve(t - eps)
  const b = curve(t + eps)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  // 法线 = 切线旋转 -90°（右侧法线）
  return { x: dy / len, y: -dx / len }
}

// ---------- 曲线库（十六种「小孩玩耍」） ----------

export const CURVES: Record<string, CurveFn> = {
  /** 直线跑：从左到右，y 缓慢漂移 */
  run: (t) => ({ x: t, y: 0.5 + 0.08 * Math.sin(t * 6.283) }),

  /** 绕圈：绕画面中心转 */
  circle: (t) => {
    const a = t * 6.283
    return { x: 0.5 + 0.35 * Math.cos(a), y: 0.5 + 0.3 * Math.sin(a) }
  },

  /** 波浪滑行：横向正弦大波浪 */
  wave: (t) => ({ x: t, y: 0.5 + 0.35 * Math.sin(t * 6.283 * 2) }),

  /** 跳格子：阶梯式跃迁（贝塞尔式跳跃） */
  hop: (t) => {
    const seg = Math.floor(t * 5) / 5
    const local = (t * 5) % 1
    const jump = Math.sin(local * Math.PI)
    return { x: seg, y: 0.7 - 0.35 * jump }
  },

  /** 螺旋：渐开螺旋，从中心向外 */
  spiral: (t) => {
    const a = t * 6.283 * 3
    const r = 0.08 + 0.35 * t
    return { x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) }
  },

  /** 8 字回旋：Lissajous 8 字 */
  eight: (t) => {
    const a = t * 6.283 * 2
    return { x: 0.5 + 0.32 * Math.sin(a), y: 0.5 + 0.3 * Math.sin(a * 2) }
  },

  /** 追逐：加速曲线，忽快忽慢（相位挤压） */
  chase: (t) => {
    const s = t + 0.08 * Math.sin(t * 6.283 * 4)
    return { x: s % 1, y: 0.5 + 0.25 * Math.sin(t * 6.283 * 1.5) }
  },

  /** 并肩摇：平行来回摆动 */
  sway: (t) => ({ x: 0.5 + 0.4 * Math.sin(t * 6.283), y: 0.5 + 0.1 * Math.sin(t * 6.283 * 3) }),

  /** 散开再聚：四散又收回 */
  scatter: (t) => {
    const spread = Math.sin(t * 6.283 * 2) * 0.35
    return { x: 0.5 + spread * Math.cos(t * 6.283), y: 0.5 + spread * Math.sin(t * 6.283) }
  },

  /** 地面弹跳：抛物线重力弹跳 */
  bounce: (t) => {
    const x = t
    const y = 0.85 - Math.abs(Math.sin(t * 6.283 * 1.5)) * 0.6
    return { x, y }
  },

  /** 绕点转：绕随机游走的中心公转 */
  orbit: (t) => {
    const a = t * 6.283 * 2.5
    const cx = 0.5 + 0.15 * Math.sin(t * 6.283 * 0.7)
    const cy = 0.5 + 0.1 * Math.cos(t * 6.283 * 0.5)
    return { x: cx + 0.25 * Math.cos(a), y: cy + 0.22 * Math.sin(a) }
  },

  /** 滑梯下：斜线滑下再回顶 */
  slide: (t) => {
    const seg = (t % 1) * 2
    if (seg < 1) return { x: seg, y: 0.15 + seg * 0.7 }
    return { x: 2 - seg, y: 0.85 - (2 - seg) * 0.2 }
  },

  /** 荡秋千：钟摆 */
  swingPendulum: (t) => {
    const a = Math.sin(t * 6.283 * 1.2) * 0.7
    return { x: 0.5 + 0.35 * Math.sin(a), y: 0.5 + 0.3 * Math.cos(a) }
  },

  /** 捉迷藏：绕场转，速度变化如躲藏 */
  hideSeek: (t) => {
    const a = t * 6.283 * 2
    const r = 0.28 + 0.06 * Math.sin(t * 6.283 * 6)
    return { x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) }
  },

  /** 手拉手转圈：三人绕小圈（大圈+小圈耦合） */
  handCircle: (t) => {
    const a = t * 6.283
    return {
      x: 0.5 + 0.3 * Math.cos(a) + 0.04 * Math.cos(a * 6),
      y: 0.5 + 0.25 * Math.sin(a) + 0.04 * Math.sin(a * 6),
    }
  },

  /** 发呆：原地微呼吸 */
  idle: (t) => ({
    x: 0.5 + 0.02 * Math.sin(t * 6.283 * 0.5),
    y: 0.5 + 0.02 * Math.cos(t * 6.283 * 0.35),
  }),
}

export type CurveId = keyof typeof CURVES
