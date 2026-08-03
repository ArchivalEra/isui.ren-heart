// 全局可配置参数 —— 解耦教科书：改这里即可改行为，不动引擎

export const BALL_COLORS = ['#F09ABD', '#6EC6E6', '#7FC39F'] as const // 粉 / 水蓝 / 薄荷绿

export const BALL_RADIUS = 10 // px（大屏可按 viewport 缩放）

/** 三球排列：6 种全排列（索引对应 BALL_COLORS） */
export const ORDERS: number[][] = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
]

/** 区域内独立概率事件 */
export const PROB = {
  /** 进入新区域时切换曲线模板的概率 */
  switchTemplate: 0.03,
  /** 进入新区域时切换排列（队首）的概率 */
  switchOrder: 0.008,
}

/** 屏幕分块：网格数（3x3） */
export const GRID = { cols: 3, rows: 3 }

/** 动画节奏 */
export const SPEED = {
  /** 主曲线推进速度（t 每秒增量） */
  tps: 0.06,
  /** 球沿曲线的相位差基数（球 i 的相位 = t + i * phaseGap） */
  phaseGap: 0.06,
  /** 法线偏移缓动速度（0~1，越大越快） */
  offsetLerp: 0.02,
  /** 悠悠球弹性幅度（相位差的正弦扰动） */
  yoYoAmp: 0.02,
  /** 悠悠球弹性频率 */
  yoYoFreq: 3,
  /** 法线偏移随机变化范围（弧度大小，单位：曲线尺度） */
  offsetRange: 0.06,
}

/** 阴影氛围（灰阶） */
export const AMBIENT = {
  shadowColor: 'rgba(17, 17, 17, 0.06)',
  shadowBlur: 24,
  trailAlpha: 0.25,
}
