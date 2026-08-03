import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BallsAnimation from '../animation/BallsAnimation'

// /heart — 博客主页：tayori 视觉（灰阶白 + 三球队列动画 + 唯一黑色 logo）

const EMOJI = ['(｡･ω･｡)', 'ฅ^•ﻌ•^ฅ', '(*´∀`)~♥', '(๑•̀ㅂ•́)و✧', '♪(´▽｀)', '(´｡• ᵕ •｡`)', '♡(◕‿◕)♡']
const TARGET = '关注isui谢谢喵'

function Typewriter({ text, speed = 180 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id)
          return v
        }
        return v + 1
      })
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return (
    <span>
      {text.slice(0, n)}
      <span className="cursor">▍</span>
    </span>
  )
}

export default function Heart() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % EMOJI.length), 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="heart-page">
      {/* 灰阶氛围背景 */}
      <div className="heart-bg" aria-hidden />

      {/* 三球动画（前景，z-index 高于 logo） */}
      <BallsAnimation />

      {/* tayori logo —— 全页唯一黑色（站主用管理工具替换为去三球版 PNG） */}
      <div className="heart-logo" aria-hidden>
        tayori
      </div>

      {/* 文字层 */}
      <main className="heart-main">
        <h1 className="heart-title">
          <Typewriter text={TARGET} />
        </h1>
        <p className="heart-sub">
          <span className="heart-emoji" aria-hidden>
            {EMOJI[idx]}
          </span>
        </p>
        <nav className="heart-nav">
          <Link to="/home" className="heart-link">
            ✦ 卡片墙 ✦
          </Link>
        </nav>
      </main>
    </div>
  )
}
