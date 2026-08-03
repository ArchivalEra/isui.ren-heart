import { useEffect, useRef } from 'react'
import { BallsEngine } from './engine'

/** 三球队列动画（Canvas 全屏层） */
export default function BallsAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const engine = new BallsEngine(canvas)
    engine.start()
    return () => engine.destroy()
  }, [])

  return <canvas ref={canvasRef} className="balls-canvas" aria-hidden />
}
