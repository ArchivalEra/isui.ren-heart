// 动画引擎：主曲线 + 法线偏移 + 分块概率 + 排列弹性
import { CURVES, normalAt, type CurveFn } from './curves'
import { BALL_COLORS, BALL_RADIUS, ORDERS, PROB, GRID, SPEED, AMBIENT } from '../config/params'
import { TEMPLATES, randomTemplate, type Template } from '../config/templates'

interface Ball {
  /** 当前排列中的位置（0/1/2） */
  slot: number
  /** 目标法线偏移倍率（-1~1） */
  targetOffset: number
  /** 当前法线偏移倍率（缓动中） */
  offset: number
  color: string
}

export class BallsEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private raf = 0
  private running = false

  private template: Template = TEMPLATES[0]
  private curve: CurveFn = CURVES[TEMPLATES[0].curve]
  private order: number[] = [...ORDERS[0]]
  private balls: Ball[] = []
  private t = 0
  private lastGrid = ''

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.balls = BALL_COLORS.map((color, slot) => ({
      slot,
      targetOffset: this.template.offsets[slot] ?? 0,
      offset: 0,
      color,
    }))
    this.resize()
    window.addEventListener('resize', this.resize)
  }

  private resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const { clientWidth: w, clientHeight: h } = this.canvas
    this.canvas.width = w * dpr
    this.canvas.height = h * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  start() {
    if (this.running) return
    this.running = true
    const loop = () => {
      if (!this.running) return
      this.step()
      this.render()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  destroy() {
    this.running = false
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resize)
  }

  // ---------- 逻辑 ----------

  private step() {
    this.t += SPEED.tps

    // 法线偏移缓动
    for (const b of this.balls) {
      b.offset += (b.targetOffset - b.offset) * SPEED.offsetLerp
    }

    // 排列对应的球（slot 由 order 决定哪个颜色球在哪个槽）
    const sorted = [...this.order]

    // 区域检测：以「队首球」位置判定所在网格
    const lead = this.ballWorldPos(sorted[0])
    const gx = Math.min(GRID.cols - 1, Math.floor(lead.x * GRID.cols))
    const gy = Math.min(GRID.rows - 1, Math.floor(lead.y * GRID.rows))
    const key = `${gx},${gy}`
    if (key !== this.lastGrid) {
      this.lastGrid = key
      this.onRegionEnter()
    }
  }

  private onRegionEnter() {
    // 独立概率事件（解耦：两件事互不影响）
    if (Math.random() < PROB.switchTemplate) {
      this.template = randomTemplate(this.template.id)
      this.curve = CURVES[this.template.curve]
      // 新模板的偏移目标
      for (const b of this.balls) {
        b.targetOffset = this.template.offsets[b.slot] ?? 0
      }
    }
    if (Math.random() < PROB.switchOrder) {
      const next = ORDERS[Math.floor(Math.random() * ORDERS.length)]
      if (next.join() !== this.order.join()) this.order = [...next]
    }
  }

  /** 球在排列中的世界坐标 */
  private ballWorldPos(slot: number): { x: number; y: number } {
    // 悠悠球弹性：相位差随运动扰动
    const yo = Math.sin(this.t * SPEED.yoYoFreq) * SPEED.yoYoAmp
    const phase = this.t + slot * (SPEED.phaseGap + yo)
    const p = this.curve(phase)
    const n = normalAt(this.curve, phase)
    const ball = this.balls.find((b) => b.slot === slot)
    const off = (ball?.offset ?? 0) * SPEED.offsetRange
    return { x: p.x + n.x * off, y: p.y + n.y * off }
  }

  // ---------- 渲染（自然俯视透视：近大远小 + 地面阴影 + 球体感） ----------

  private render() {
    const { ctx, canvas } = this
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    ctx.clearRect(0, 0, w, h)

    const pos = this.order.map((slot) => this.ballWorldPos(slot))

    // 透视：深度由 y 决定（0=远处地平线，1=近处镜头前）
    const depth = (y: number) => 0.55 + 0.45 * y
    const toScreen = (p: { x: number; y: number }) => {
      const d = depth(p.y)
      return { x: (p.x - 0.5) * w * d + w / 2, y: p.y * h, d }
    }
    const pts = pos.map(toScreen)

    // 连接线（地面上的路径感：线在阴影层）
    ctx.strokeStyle = AMBIENT.shadowColor
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y)
      else ctx.lineTo(pts[i].x, pts[i].y)
    }
    ctx.stroke()

    // 球（按深度排序：远的先画）
    const orderByDepth = pts
      .map((_, i) => i)
      .sort((a, b) => pts[a].y - pts[b].y)

    for (const i of orderByDepth) {
      const slot = this.order[i]
      const ball = this.balls.find((b) => b.slot === slot)!
      const { x: px, y: py, d } = pts[i]
      const radius = BALL_RADIUS * d * Math.min(1, Math.max(0.6, Math.min(w, h) / 700))

      // 地面阴影（椭圆，随深度缩放；球体离地的投影感）
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(px, py + radius * 0.85, radius * 1.15, radius * 0.32, 0, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(17, 17, 17, ${0.07 * d + 0.05})`
      ctx.filter = `blur(${2 + (1 - d) * 3}px)`
      ctx.fill()
      ctx.restore()

      // 3D 球体：径向渐变高光（左上受光，右下暗部）
      ctx.save()
      const grad = ctx.createRadialGradient(
        px - radius * 0.35,
        py - radius * 0.35,
        radius * 0.1,
        px,
        py,
        radius * 1.1,
      )
      grad.addColorStop(0, lighten(ball.color, 0.55))
      grad.addColorStop(0.45, ball.color)
      grad.addColorStop(1, darken(ball.color, 0.35))
      ctx.beginPath()
      ctx.arc(px, py, radius, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.shadowColor = AMBIENT.shadowColor
      ctx.shadowBlur = AMBIENT.shadowBlur * d
      ctx.shadowOffsetY = 8 * d
      ctx.fill()
      ctx.restore()
    }
  }
}

/** 颜色提亮（0~1） */
function lighten(hex: string, amt: number): string {
  return mix(hex, '#ffffff', amt)
}

/** 颜色压暗（0~1） */
function darken(hex: string, amt: number): string {
  return mix(hex, '#000000', amt)
}

function mix(hex: string, to: string, amt: number): string {
  const a = hexToRgb(hex)
  const b = hexToRgb(to)
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amt))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
