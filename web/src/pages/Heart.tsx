import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// /heart — 博客主页：动态颜文字「关注isui谢谢喵」
const EMOJI = ['(｡･ω･｡)', 'ฅ^•ﻌ•^ฅ', '(*´∀`)~♥', '(๑•̀ㅂ•́)و✧', 'ﾟ+*:;;:*+ﾟ', '♪(´▽｀)', '(´｡• ᵕ •｡`)', '♡(◕‿◕)♡']
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
      <div className="heart-emoji" aria-hidden>
        {EMOJI.map((e, i) => (
          <span
            key={i}
            className="float-emoji"
            style={{
              left: `${(i * 13 + 4) % 92}%`,
              animationDelay: `${i * 0.7}s`,
              opacity: i === idx ? 1 : 0.25,
            }}
          >
            {e}
          </span>
        ))}
      </div>

      <main className="heart-main">
        <h1 className="heart-title">
          <Typewriter text={TARGET} />
        </h1>
        <p className="heart-sub">isui.ren · 这里收藏着喜欢的歌声</p>
        <nav className="heart-nav">
          <Link to="/home" className="heart-link">
            ✦ 卡片墙 ✦
          </Link>
        </nav>
      </main>
    </div>
  )
}
