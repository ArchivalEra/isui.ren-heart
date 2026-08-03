// /home — 卡片页（保留路由；heart 的卡片墙已改为下拉，此页为完整版）
export default function Home() {
  const links = [
    { title: "X (Twitter)", url: "https://x.com", icon: "𝕏", desc: "乐队动态" },
    { title: "YouTube", url: "https://youtube.com", icon: "▶", desc: "视频与音乐" },
    { title: "官方网站", url: "https://tayori-official.com", icon: "◎", desc: "官网" },
  ];
  return (
    <div class="home-page">
      <header class="home-header">
        <a href="#/heart" class="home-back">← 回主页</a>
        <h2>卡片墙</h2>
      </header>
      <main class="card-grid">
        {links.map((item) => (
          <a class="card" href={item.url} target="_blank" rel="noopener noreferrer" key={item.url}>
            <span class="card-icon" aria-hidden="true">{item.icon}</span>
            <span class="card-body">
              <span class="card-title">{item.title}</span>
              <span class="card-desc">{item.desc}</span>
            </span>
          </a>
        ))}
      </main>
      <footer class="home-footer">链接库接入中 · isui.ren</footer>
    </div>
  );
}
