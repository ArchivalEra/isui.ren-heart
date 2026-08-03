// 模板定义：曲线 + 每球的法线偏移风格（配置化，增删改即变种类）
import type { CurveId } from '../animation/curves'

export interface Template {
  id: string
  name: string
  curve: CurveId
  /** 每球法线偏移目标倍率（相对 offsetRange） */
  offsets: [number, number, number]
}

export const TEMPLATES: Template[] = [
  { id: 'run', name: '直线跑', curve: 'run', offsets: [0, 0.6, -0.6] },
  { id: 'circle', name: '绕圈', curve: 'circle', offsets: [0, 0.5, -0.5] },
  { id: 'wave', name: '波浪滑行', curve: 'wave', offsets: [0, 0.8, -0.8] },
  { id: 'hop', name: '跳格子', curve: 'hop', offsets: [0, 0.4, 0.4] },
  { id: 'spiral', name: '螺旋', curve: 'spiral', offsets: [0, -0.5, 0.5] },
  { id: 'eight', name: '8字回旋', curve: 'eight', offsets: [0, 0.7, -0.7] },
  { id: 'chase', name: '追逐', curve: 'chase', offsets: [0.3, 0, -0.3] },
  { id: 'sway', name: '并肩摇', curve: 'sway', offsets: [0, 0.5, 0.5] },
  { id: 'scatter', name: '散开再聚', curve: 'scatter', offsets: [0, -0.6, 0.6] },
  { id: 'bounce', name: '地面弹跳', curve: 'bounce', offsets: [0, 0.5, -0.5] },
  { id: 'orbit', name: '绕点转', curve: 'orbit', offsets: [0, 0.6, -0.6] },
  { id: 'slide', name: '滑梯下', curve: 'slide', offsets: [0, 0.3, -0.3] },
  { id: 'swingPendulum', name: '荡秋千', curve: 'swingPendulum', offsets: [0, 0.6, -0.6] },
  { id: 'hideSeek', name: '捉迷藏', curve: 'hideSeek', offsets: [0.4, -0.2, 0.2] },
  { id: 'handCircle', name: '手拉手转圈', curve: 'handCircle', offsets: [0, 0.3, -0.3] },
  { id: 'idle', name: '发呆', curve: 'idle', offsets: [0, 0.5, 0.5] },
]

export function randomTemplate(excludeId?: string): Template {
  const pool = TEMPLATES.filter((t) => t.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}
