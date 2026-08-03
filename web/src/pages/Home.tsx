import { Link } from 'react-router-dom'
import Card from '../components/Card'

// /home — 卡片页：链接卡片集合（雏形：静态数据，后续接链接库/管理工具）
interface LinkItem {
  id: string
  title: string
  url: string
  icon?: string
  desc?: string
}

const DEMO_LINKS: LinkItem[] = [
  { id: 'x', title: 'X (Twitter)', url: 'https://x.com', icon: '𝕏', desc: '乐队动态' },
  { id: 'yt', title: 'YouTube', url: 'https://youtube.com', icon: '▶', desc: '视频与音乐' },
  { id: 'web', title: '官方网站', url: 'https://tayori.com', icon: '◎', desc: '官网' },
]

export default function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <Link to="/heart" className="home-back">
          ← 回主页
        </Link>
        <h2>卡片墙</h2>
      </header>
      <main className="card-grid">
        {DEMO_LINKS.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </main>
      <footer className="home-footer">链接库接入中 · isui.ren</footer>
    </div>
  )
}
