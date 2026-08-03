interface LinkItem {
  id: string
  title: string
  url: string
  icon?: string
  desc?: string
}

export default function Card({ item }: { item: LinkItem }) {
  return (
    <a
      className="card"
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.title}
    >
      <span className="card-icon" aria-hidden>
        {item.icon ?? '🔗'}
      </span>
      <span className="card-body">
        <span className="card-title">{item.title}</span>
        {item.desc && <span className="card-desc">{item.desc}</span>}
      </span>
    </a>
  )
}
