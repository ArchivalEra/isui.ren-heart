/**
 * EdgeOne Makers Middleware
 * Runs before page load on EdgeOne edge nodes.
 *
 * Routes:
 * - /api/activity[...]  reverse-proxies to the upstream Cloudflare Worker.
 * - /repo/              renders the public repository portal.
 * - /repo/<repo>/[...]  mirrors archivalera.github.io/<repo>/ behind the domestic
 *                       edge; repositories without GitHub Pages get a README
 *                       landing page instead of a dead 404 placeholder.
 *
 * GitHub API access is unauthenticated and edge-cached. When the API is
 * unreachable, the portal falls back to the built-in inventory below.
 */

const GITHUB_OWNER = "ArchivalEra";
const GITHUB_API = "https://api.github.com";
const GITHUB_RAW = "https://raw.githubusercontent.com";
const GITHUB_WEB = "https://github.com";
const BLOG_URL = "https://isui.ren/MangoMesa/";

/** Repositories whose built static output ships with this repository. */
const LOCAL_STATIC_REPOS = new Set(["S26-1_202609"]);

/**
 * Built-in inventory used only when api.github.com is unreachable from the edge.
 * Keep in sync with `gh api users/ArchivalEra/repos?type=owner`.
 */
const FALLBACK_REPOS = [
	{ name: "Anti-Laborer-Skills", description: "", language: "JavaScript", stars: 0, hasPages: true, updatedAt: "2026-09-15T10:49:49Z" },
	{ name: "ArchivalEra", description: "hey shitass, want to see me speed bridge? → isui.ren", language: "", stars: 0, hasPages: true, updatedAt: "2026-09-19T14:48:48Z" },
	{ name: "clearmail", description: "", language: "Shell", stars: 0, hasPages: true, updatedAt: "2026-09-03T07:19:31Z" },
	{ name: "Clouddrive-as-Origin", description: "", language: "Rust", stars: 0, hasPages: true, updatedAt: "2026-09-19T16:37:01Z" },
	{ name: "H10e-11ac", description: "", language: "Shell", stars: 0, hasPages: true, updatedAt: "2026-09-05T10:15:00Z" },
	{ name: "hi3798mv300-debian-sid", description: "我牛逼", language: "Shell", stars: 0, hasPages: false, updatedAt: "2026-08-09T13:48:09Z" },
	{ name: "hi3798mv310-debian", description: "", language: "Shell", stars: 0, hasPages: true, updatedAt: "2026-09-15T07:21:00Z" },
	{ name: "isui.ren-Bahnhof", description: "isui.ren 站点中央调度与导航短链分发中枢 🚉", language: "TypeScript", stars: 0, hasPages: true, updatedAt: "2026-09-17T14:36:25Z" },
	{ name: "isui.ren-Blog-discussion", description: "", language: "", stars: 0, hasPages: false, updatedAt: "2026-09-04T09:38:39Z" },
	{ name: "isui.ren-heart", description: "😭📔🖋", language: "Rust", stars: 0, hasPages: true, updatedAt: "2026-09-19T15:42:11Z" },
	{ name: "My-Shirone-Plugins", description: "Plugins, extensions, and enhancements for the Shirone blog theme ecosystem.", language: "JavaScript", stars: 0, hasPages: true, updatedAt: "2026-09-17T14:21:18Z" },
	{ name: "my-themes-on-linux", description: "Catppuccin 主题设置（Linux）", language: "Shell", stars: 0, hasPages: true, updatedAt: "2026-09-08T10:05:20Z" },
	{ name: "nearlink-E573H-USBDC", description: "", language: "C", stars: 1, hasPages: true, updatedAt: "2026-09-17T09:03:18Z" },
	{ name: "newifi3-immortalwrt-personal", description: "校园网是哪个b发明的", language: "Shell", stars: 0, hasPages: true, updatedAt: "2026-08-12T09:43:43Z" },
	{ name: "Policy-Gateway", description: "", language: "Rust", stars: 0, hasPages: true, updatedAt: "2026-08-14T16:22:21Z" },
	{ name: "PureDns", description: "", language: "Rust", stars: 0, hasPages: true, updatedAt: "2026-09-08T13:57:25Z" },
	{ name: "S26-1_202609", description: "S26-1 课程知识库 · 高精度公式渲染阅读站（M3E 质感排版与动态色盘）", language: "JavaScript", stars: 0, hasPages: true, updatedAt: "2026-09-19T15:00:46Z" },
	{ name: "S3-Xray", description: "", language: "Python", stars: 0, hasPages: true, updatedAt: "2026-09-10T13:13:18Z" },
	{ name: "vps-related", description: "", language: "Rust", stars: 0, hasPages: true, updatedAt: "2026-09-08T11:25:05Z" },
];

const GITHUB_HEADERS = {
	Accept: "application/vnd.github+json",
	"User-Agent": "isui.ren-repo-portal",
	"X-GitHub-Api-Version": "2022-11-28",
};

const TEXT_HEADERS = {
	"Content-Type": "text/plain; charset=utf-8",
};

function escapeHtml(value) {
	return String(value ?? "").replace(
		/[&<>"']/g,
		(character) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[character],
	);
}

function formatDate(value) {
	return typeof value === "string" && value.length >= 10
		? value.slice(0, 10)
		: "";
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
	if (typeof AbortController === "undefined") return fetch(url, options);
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(url, { ...options, signal: controller.signal });
	} catch (_error) {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

function normalizeRepo(repo) {
	return {
		name: repo.name,
		description: repo.description || "",
		language: repo.language || "",
		stars: Number(repo.stargazers_count) || 0,
		hasPages: Boolean(repo.has_pages),
		updatedAt: repo.pushed_at || "",
		htmlUrl: repo.html_url || `${GITHUB_WEB}/${GITHUB_OWNER}/${repo.name}`,
	};
}

async function loadRepoList() {
	const response = await fetchWithTimeout(
		`${GITHUB_API}/users/${GITHUB_OWNER}/repos?per_page=100&type=owner&sort=pushed`,
		{ headers: GITHUB_HEADERS },
		5000,
	);
	if (!response || !response.ok) return { repos: FALLBACK_REPOS, degraded: true };
	const data = await response.json().catch(() => null);
	if (!Array.isArray(data)) return { repos: FALLBACK_REPOS, degraded: true };
	const repos = data
		.filter((repo) => !repo.fork && !repo.private)
		.map(normalizeRepo)
		.sort(
			(a, b) =>
				(b.updatedAt || "").localeCompare(a.updatedAt || "") ||
				a.name.localeCompare(b.name),
		);
	if (repos.length === 0) return { repos: FALLBACK_REPOS, degraded: true };
	return { repos, degraded: false };
}

async function loadRepoMeta(repoName) {
	const response = await fetchWithTimeout(
		`${GITHUB_API}/repos/${GITHUB_OWNER}/${encodeURIComponent(repoName)}`,
		{ headers: GITHUB_HEADERS },
		5000,
	);
	if (!response || !response.ok) return null;
	const data = await response.json().catch(() => null);
	if (!data || data.private || data.fork) return null;
	return {
		...normalizeRepo(data),
		defaultBranch: data.default_branch || "main",
		topics: Array.isArray(data.topics) ? data.topics.slice(0, 8) : [],
		license: data.license?.spdx_id || "",
	};
}

async function loadRepoReadme(repoName, branch) {
	for (const file of ["README.md", "README.en.md", "readme.md"]) {
		const response = await fetchWithTimeout(
			`${GITHUB_RAW}/${GITHUB_OWNER}/${encodeURIComponent(repoName)}/${encodeURIComponent(branch)}/${file}`,
			{ headers: { "User-Agent": GITHUB_HEADERS["User-Agent"] } },
			4500,
		);
		if (!response || !response.ok) continue;
		let text = await response.text().catch(() => "");
		if (!text.trim()) continue;
		if (text.length > 120_000) text = text.slice(0, 120_000);
		return { text, file, branch };
	}
	return null;
}

function renderInlineMarkdown(text, resolver) {
	const codeTokens = [];
	let out = escapeHtml(text).replace(/`([^`]+)`/g, (_match, code) => {
		codeTokens.push(code);
		return `\u0000${codeTokens.length - 1}\u0000`;
	});
	out = out.replace(
		/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
		(_match, alt, src) =>
			`<img src="${escapeHtml(resolver.image(src))}" alt="${alt}" loading="lazy">`,
	);
	out = out.replace(
		/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
		(_match, label, href) =>
			`<a href="${escapeHtml(resolver.link(href))}" target="_blank" rel="noopener noreferrer">${label}</a>`,
	);
	out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
	out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");
	out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
	out = out.replace(/\u0000(\d+)\u0000/g, (_match, index) => {
		return `<code>${codeTokens[Number(index)] || ""}</code>`;
	});
	return out;
}

function renderMarkdown(markdown, resolver) {
	const lines = String(markdown || "")
		.replace(/\r\n/g, "\n")
		.split("\n");
	const html = [];
	let inCode = false;
	let codeLines = [];
	let listType = null;

	const flushList = () => {
		if (listType) {
			html.push(`</${listType}>`);
			listType = null;
		}
	};
	const flushCode = () => {
		if (inCode) {
			html.push(
				`<pre class="readme__code"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
			);
			inCode = false;
			codeLines = [];
		}
	};

	for (const line of lines) {
		const fence = line.match(/^\s*```(.*)$/);
		if (fence) {
			if (inCode) {
				flushCode();
			} else {
				flushList();
				inCode = true;
			}
			continue;
		}
		if (inCode) {
			codeLines.push(line);
			continue;
		}
		if (!line.trim()) {
			flushList();
			continue;
		}

		const heading = line.match(/^(#{1,6})\s+(.*)$/);
		if (heading) {
			flushList();
			const level = Math.min(heading[1].length + 1, 6);
			html.push(
				`<h${level}>${renderInlineMarkdown(heading[2], resolver)}</h${level}>`,
			);
			continue;
		}

		const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
		if (bullet) {
			if (listType !== "ul") {
				flushList();
				html.push("<ul>");
				listType = "ul";
			}
			html.push(`<li>${renderInlineMarkdown(bullet[1], resolver)}</li>`);
			continue;
		}

		const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
		if (ordered) {
			if (listType !== "ol") {
				flushList();
				html.push("<ol>");
				listType = "ol";
			}
			html.push(`<li>${renderInlineMarkdown(ordered[1], resolver)}</li>`);
			continue;
		}

		const quote = line.match(/^>\s?(.*)$/);
		if (quote) {
			flushList();
			html.push(
				`<blockquote>${renderInlineMarkdown(quote[1], resolver)}</blockquote>`,
			);
			continue;
		}

		if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
			flushList();
			html.push("<hr>");
			continue;
		}

		flushList();
		html.push(`<p>${renderInlineMarkdown(line, resolver)}</p>`);
	}

	flushCode();
	flushList();
	return html.join("\n");
}

function createMarkdownResolver(repoName, branch) {
	const base = `${GITHUB_WEB}/${GITHUB_OWNER}/${encodeURIComponent(repoName)}`;
	const raw = `${GITHUB_RAW}/${GITHUB_OWNER}/${encodeURIComponent(repoName)}/${encodeURIComponent(branch)}`;
	const cleanRelative = (value) => {
		const path = String(value || "")
			.replace(/^\.\//, "")
			.replace(/^\/+/, "");
		if (!path || path.includes("..")) return "";
		return encodeURI(path);
	};
	return {
		link(value) {
			const href = String(value || "").trim();
			if (/^(https?:|mailto:|#)/i.test(href)) return href;
			const path = cleanRelative(href);
			return path ? `${base}/blob/${encodeURIComponent(branch)}/${path}` : "#";
		},
		image(value) {
			const src = String(value || "").trim();
			if (/^https?:/i.test(src)) return src;
			const path = cleanRelative(src);
			return path ? `${raw}/${path}` : "";
		},
	};
}

const PAGE_CSS = `
:root {
	--bg: #0f1013;
	--surface: #1a1b1f;
	--surface-high: #23242a;
	--on-surface: #e2e2e6;
	--muted: #8f9099;
	--primary: #80b3ff;
	--primary-container: rgba(128, 179, 255, 0.15);
	--outline: rgba(255, 255, 255, 0.12);
	--shape-m: 12px;
	--shape-l: 20px;
}
@media (prefers-color-scheme: light) {
	:root {
		--bg: #f8f9fa;
		--surface: #ffffff;
		--surface-high: #f1f3f4;
		--on-surface: #1a1b1f;
		--muted: #5f6368;
		--primary: #005fb8;
		--primary-container: rgba(0, 95, 184, 0.1);
		--outline: rgba(0, 0, 0, 0.12);
	}
}
* { box-sizing: border-box; }
body {
	margin: 0;
	min-height: 100vh;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", Roboto, sans-serif;
	background: var(--bg);
	color: var(--on-surface);
	line-height: 1.65;
}
a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }
.wrap { width: min(1080px, calc(100% - 40px)); margin: 0 auto; padding: 40px 0 64px; }
.crumbs { margin-bottom: 20px; font-size: 14px; }
.hero { padding: 24px 0 8px; }
.hero h1 { margin: 0 0 12px; font-size: clamp(28px, 4vw, 40px); line-height: 1.15; letter-spacing: -0.02em; }
.hero p { margin: 0; color: var(--muted); max-width: 680px; }
.badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 4px 12px;
	border-radius: 999px;
	background: var(--primary-container);
	color: var(--primary);
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.02em;
}
.badge--local { background: rgba(52, 199, 89, 0.14); color: #34c759; }
.badge--pages { background: var(--primary-container); color: var(--primary); }
.badge--readme { background: rgba(255, 159, 10, 0.14); color: #ff9f0a; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
.btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 10px 18px;
	border-radius: var(--shape-m);
	font-size: 14px;
	font-weight: 600;
	border: 1px solid var(--outline);
	color: var(--on-surface);
}
.btn:hover { text-decoration: none; background: var(--surface-high); }
.btn-primary { background: var(--primary); border-color: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary); opacity: 0.9; }
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
	gap: 16px;
	margin-top: 28px;
}
.card {
	display: flex;
	flex-direction: column;
	gap: 12px;
	background: var(--surface);
	border: 1px solid var(--outline);
	border-radius: var(--shape-l);
	padding: 20px;
	transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
}
.card:hover {
	transform: translateY(-2px);
	border-color: color-mix(in oklab, var(--primary) 45%, var(--outline));
	box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
}
.card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.card__name { font-size: 17px; font-weight: 700; color: var(--on-surface); word-break: break-word; }
.card__desc { margin: 0; color: var(--muted); font-size: 14px; flex: 1; }
.card__meta { display: flex; flex-wrap: wrap; gap: 12px; color: var(--muted); font-size: 12px; }
.card__actions { display: flex; flex-wrap: wrap; gap: 14px; font-size: 13px; font-weight: 600; }
.notice {
	margin-top: 20px;
	padding: 12px 16px;
	border-radius: var(--shape-m);
	border: 1px solid var(--outline);
	background: var(--surface-high);
	color: var(--muted);
	font-size: 13px;
}
.repo-hero { padding: 8px 0 24px; border-bottom: 1px solid var(--outline); }
.repo-hero h1 { margin: 14px 0 10px; font-size: clamp(26px, 4vw, 38px); letter-spacing: -0.02em; }
.repo-hero p { margin: 0; color: var(--muted); max-width: 720px; }
.repo-hero__meta { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 14px; color: var(--muted); font-size: 13px; }
.topics { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.topic { padding: 3px 10px; border-radius: 999px; border: 1px solid var(--outline); font-size: 12px; color: var(--muted); }
.readme { margin-top: 28px; }
.readme h1, .readme h2, .readme h3, .readme h4, .readme h5, .readme h6 {
	margin: 28px 0 12px;
	line-height: 1.3;
}
.readme h1 { font-size: 28px; }
.readme h2 { font-size: 22px; padding-bottom: 6px; border-bottom: 1px solid var(--outline); }
.readme h3 { font-size: 18px; }
.readme p { margin: 0 0 14px; }
.readme ul, .readme ol { margin: 0 0 14px; padding-left: 24px; }
.readme li { margin: 4px 0; }
.readme img { max-width: 100%; height: auto; border-radius: var(--shape-m); }
.readme blockquote {
	margin: 0 0 14px;
	padding: 8px 16px;
	border-left: 3px solid var(--primary);
	background: var(--surface-high);
	border-radius: 0 var(--shape-m) var(--shape-m) 0;
	color: var(--muted);
}
.readme code {
	font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Consolas, monospace;
	font-size: 0.9em;
	background: var(--surface-high);
	padding: 2px 6px;
	border-radius: 6px;
}
.readme__code {
	overflow-x: auto;
	background: var(--surface-high);
	border: 1px solid var(--outline);
	border-radius: var(--shape-m);
	padding: 14px 16px;
}
.readme__code code { background: none; padding: 0; }
.readme hr { border: none; border-top: 1px solid var(--outline); margin: 24px 0; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--outline); color: var(--muted); font-size: 13px; }
`;

function renderPage({ title, description, body }) {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="${escapeHtml(description)}">
	<title>${escapeHtml(title)} | isui.ren</title>
	<style>${PAGE_CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
}

function repoBadge(repo) {
	if (LOCAL_STATIC_REPOS.has(repo.name)) {
		return { label: "本地加速", className: "badge--local" };
	}
	if (repo.hasPages) {
		return { label: "Pages 镜像", className: "badge--pages" };
	}
	return { label: "README 页面", className: "badge--readme" };
}

function renderRepoCard(repo) {
	const badge = repoBadge(repo);
	const href = `/repo/${encodeURIComponent(repo.name)}/`;
	const meta = [
		repo.language ? `<span>${escapeHtml(repo.language)}</span>` : "",
		repo.stars > 0 ? `<span>★ ${repo.stars}</span>` : "",
		repo.updatedAt ? `<span>${formatDate(repo.updatedAt)}</span>` : "",
	]
		.filter(Boolean)
		.join("");
	return `<article class="card">
	<div class="card__head">
		<a class="card__name" href="${href}">${escapeHtml(repo.name)}</a>
		<span class="badge ${badge.className}">${badge.label}</span>
	</div>
	<p class="card__desc">${escapeHtml(repo.description || "暂无仓库简介")}</p>
	<div class="card__meta">${meta}</div>
	<div class="card__actions">
		<a href="${href}">站内页面 →</a>
		<a href="${escapeHtml(repo.htmlUrl || `${GITHUB_WEB}/${GITHUB_OWNER}/${repo.name}`)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
	</div>
</article>`;
}

function renderPortal(repos, degraded) {
	const body = `<main class="wrap">
	<header class="hero">
		<span class="badge">⚡ EdgeOne 国内加速路由</span>
		<h1>开源仓库集群</h1>
		<p>ArchivalEra 的全部公开仓库统一反代到 <code>isui.ren/repo/&lt;repo&gt;/</code>：有 GitHub Pages 的仓库走边缘镜像与强缓存，没有 Pages 的仓库自动生成本地 README 页面。</p>
		<div class="actions">
			<a class="btn btn-primary" href="${BLOG_URL}">返回博客</a>
			<a class="btn" href="${GITHUB_WEB}/${GITHUB_OWNER}" target="_blank" rel="noopener noreferrer">GitHub 主页 ↗</a>
		</div>
	</header>
	${degraded ? '<div class="notice">GitHub API 暂时不可达，当前展示内置仓库清单；稍后刷新即可恢复实时状态。</div>' : ""}
	<section class="grid">
		${repos.map(renderRepoCard).join("\n")}
	</section>
	<footer class="footer">共 ${repos.length} 个公开仓库 · 由 EdgeOne 边缘节点提供国内加速与缓存</footer>
</main>`;
	return renderPage({
		title: "开源仓库集群",
		description: "ArchivalEra 公开仓库的国内加速镜像门户",
		body,
	});
}

function renderRepoLanding(meta, readme, { degraded } = {}) {
	const branch = readme?.branch || meta.defaultBranch || "main";
	const resolver = createMarkdownResolver(meta.name, branch);
	const readmeHtml = readme?.text
		? renderMarkdown(readme.text, resolver)
		: `<div class="notice">该仓库没有可用的 README 文件，请前往 GitHub 查看源码与提交记录。</div>`;
	const badge = repoBadge(meta);
	const topics = meta.topics?.length
		? `<div class="topics">${meta.topics
				.map((topic) => `<span class="topic">${escapeHtml(topic)}</span>`)
				.join("")}</div>`
		: "";
	const metaItems = [
		meta.language ? `<span>语言：${escapeHtml(meta.language)}</span>` : "",
		meta.stars > 0 ? `<span>★ ${meta.stars}</span>` : "",
		meta.license && meta.license !== "NOASSERTION"
			? `<span>${escapeHtml(meta.license)}</span>`
			: "",
		meta.updatedAt ? `<span>更新于 ${formatDate(meta.updatedAt)}</span>` : "",
	]
		.filter(Boolean)
		.join("");
	const body = `<main class="wrap">
	<nav class="crumbs"><a href="/repo/">← 返回仓库门户</a></nav>
	<header class="repo-hero">
		<span class="badge ${badge.className}">${badge.label}</span>
		<h1>${escapeHtml(meta.name)}</h1>
		<p>${escapeHtml(meta.description || "该仓库尚未填写简介。")}</p>
		<div class="repo-hero__meta">${metaItems}</div>
		${topics}
		<div class="actions">
			<a class="btn btn-primary" href="${escapeHtml(meta.htmlUrl)}" target="_blank" rel="noopener noreferrer">在 GitHub 查看源码 ↗</a>
			<a class="btn" href="/repo/">全部仓库</a>
		</div>
	</header>
	${degraded ? '<div class="notice">GitHub API 暂时不可达，页面元数据可能不是最新。</div>' : ""}
	${readme ? `<div class="notice">以下内容来自仓库 ${escapeHtml(readme.file)}${meta.hasPages ? "；GitHub Pages 构建完成后会自动切换为站点镜像。" : "。"}</div>` : ""}
	<article class="readme">${readmeHtml}</article>
</main>`;
	return renderPage({
		title: meta.name,
		description: meta.description || `${meta.name} 仓库页面`,
		body,
	});
}

function renderRepoNotFound(repoName) {
	const body = `<main class="wrap">
	<div class="card" style="max-width:560px;margin:8vh auto;text-align:center;">
		<span class="badge badge--readme">404</span>
		<h1 style="margin:16px 0 10px;font-size:24px;">${escapeHtml(repoName)}</h1>
		<p class="card__desc">没有找到这个公开仓库。它可能已改名、转为私有，或者从未存在。</p>
		<div class="actions" style="justify-content:center;">
			<a class="btn btn-primary" href="/repo/">返回仓库门户</a>
			<a class="btn" href="${GITHUB_WEB}/${GITHUB_OWNER}" target="_blank" rel="noopener noreferrer">GitHub 主页</a>
		</div>
	</div>
</main>`;
	return renderPage({
		title: "仓库不存在",
		description: "没有找到对应的公开仓库",
		body,
	});
}

function renderPathNotFound(repoName, requestPath) {
	const body = `<main class="wrap">
	<div class="card" style="max-width:560px;margin:8vh auto;text-align:center;">
		<span class="badge badge--readme">404</span>
		<h1 style="margin:16px 0 10px;font-size:24px;">页面不存在</h1>
		<p class="card__desc">仓库 <strong>${escapeHtml(repoName)}</strong> 中没有找到 <code>${escapeHtml(requestPath)}</code>。</p>
		<div class="actions" style="justify-content:center;">
			<a class="btn btn-primary" href="/repo/${encodeURIComponent(repoName)}/">返回仓库首页</a>
			<a class="btn" href="/repo/">全部仓库</a>
		</div>
	</div>
</main>`;
	return renderPage({
		title: "页面不存在",
		description: `${repoName} 中没有找到该页面`,
		body,
	});
}

function injectBaseAndRewrite(html, repoName) {
	const baseTarget = `/repo/${repoName}/`;
	let output = html;
	if (output.includes("<head>")) {
		output = output.replace("<head>", `<head>\n    <base href="${baseTarget}">`);
	} else if (output.includes("<head ")) {
		output = output.replace(/(<head[^>]*>)/i, `$1\n    <base href="${baseTarget}">`);
	}
	const repoRegex = new RegExp(`(href|src|action)=["']/${repoName}/`, "g");
	return output.replace(repoRegex, `$1="${baseTarget}`);
}

export async function middleware(context) {
	const { request, rewrite, next } = context;
	const url = new URL(request.url);

	if (url.pathname === "/api/activity") {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, OPTIONS",
					"Access-Control-Allow-Headers": "*",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		try {
			const upstreamResp = await fetch(
				"https://api.mango-mesa.ccwu.cc/api/activity",
				{
					headers: {
						Accept: "application/json",
						"User-Agent":
							request.headers.get("user-agent") || "EdgeOne-Middleware-Proxy",
					},
				},
			);
			const body = await upstreamResp.text();
			return new Response(body, {
				status: upstreamResp.status,
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, OPTIONS",
					"Access-Control-Allow-Headers": "*",
					"Cache-Control": "public, max-age=5, s-maxage=10",
				},
			});
		} catch (_err) {
			return rewrite("https://api.mango-mesa.ccwu.cc/api/activity");
		}
	}

	if (url.pathname === "/api/activity/report") {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "POST, OPTIONS",
					"Access-Control-Allow-Headers": "*",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		if (request.method === "POST") {
			try {
				const body = await request.text();
				const upstreamResp = await fetch(
					"https://api.mango-mesa.ccwu.cc/api/activity/report",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: request.headers.get("authorization") || "",
							"User-Agent":
								request.headers.get("user-agent") || "EdgeOne-Middleware-Proxy",
						},
						body,
					},
				);
				const respBody = await upstreamResp.text();
				return new Response(respBody, {
					status: upstreamResp.status,
					headers: {
						"Content-Type": "application/json; charset=utf-8",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "POST, OPTIONS",
						"Access-Control-Allow-Headers": "*",
					},
				});
			} catch (_err) {
				return rewrite("https://api.mango-mesa.ccwu.cc/api/activity/report");
			}
		}
	}

	// Hard-wire /Bahnhof slash normalization
	if (url.pathname === "/Bahnhof") {
		const redirectUrl = new URL(request.url);
		redirectUrl.pathname = "/Bahnhof/";
		return Response.redirect(redirectUrl.toString(), 301);
	}

	// Repository portal: every public repository, with Pages mirrors or README pages.
	if (url.pathname === "/repo" || url.pathname === "/repo/") {
		const { repos, degraded } = await loadRepoList();
		return new Response(renderPortal(repos, degraded), {
			status: 200,
			headers: {
				"Content-Type": "text/html; charset=utf-8",
				"Cache-Control": degraded
					? "public, max-age=30, s-maxage=60"
					: "public, max-age=120, s-maxage=600",
			},
		});
	}

	if (url.pathname.startsWith("/repo/")) {
		const repoMatch = url.pathname.match(/^\/repo\/([^/]+)(\/.*)?$/);
		if (repoMatch) {
			const repoName = repoMatch[1];
			const restPath = repoMatch[2] || "";
			const accept = request.headers.get("accept") || "";
			const wantsHtml = accept.includes("text/html") || restPath.endsWith("/");

			// Only ordinary GitHub repository names reach the API / upstream.
			if (!/^[A-Za-z0-9._-]+$/.test(repoName) || repoName.includes("..")) {
				return new Response(renderRepoNotFound(repoName), {
					status: 404,
					headers: { "Content-Type": "text/html; charset=utf-8" },
				});
			}

			// Enforce trailing slash on repository root path (/repo/<repoName> -> /repo/<repoName>/)
			if (!restPath && !url.pathname.endsWith("/")) {
				const redirectUrl = new URL(request.url);
				redirectUrl.pathname = `/repo/${repoName}/`;
				return Response.redirect(redirectUrl.toString(), 301);
			}

			// 301 redirect legacy repo name S26-1Shitass to S26-1_202609
			if (repoName === "S26-1Shitass") {
				const redirectUrl = new URL(request.url);
				redirectUrl.pathname = `/repo/S26-1_202609${restPath || "/"}`;
				return Response.redirect(redirectUrl.toString(), 301);
			}

			// Repositories whose static output ships with this repository.
			if (LOCAL_STATIC_REPOS.has(repoName)) {
				return next();
			}

			if (request.method === "OPTIONS") {
				return new Response(null, {
					status: 204,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
						"Access-Control-Allow-Headers": "*",
						"Access-Control-Max-Age": "86400",
					},
				});
			}

			const cleanRest = restPath.startsWith("/") ? restPath.slice(1) : restPath;
			const upstreamUrl = `https://${GITHUB_OWNER.toLowerCase()}.github.io/${repoName}/${cleanRest}${url.search}`;

			try {
				const upstreamResp = await fetch(upstreamUrl, {
					method: request.method,
					headers: {
						"User-Agent":
							request.headers.get("user-agent") || "EdgeOne-RepoProxy/1.0",
						Accept: request.headers.get("accept") || "*/*",
					},
				});

				const contentType = upstreamResp.headers.get("content-type") || "";

				// Pages not enabled or still building: the repository root falls back to
				// a README landing page. A missing sub-path stays an honest 404.
				const isRepoRootRequest =
					!cleanRest || cleanRest === "index.html" || cleanRest === "";
				if (upstreamResp.status === 404 && wantsHtml && isRepoRootRequest) {
					const meta = await loadRepoMeta(repoName);
					if (!meta) {
						return new Response(renderRepoNotFound(repoName), {
							status: 404,
							headers: { "Content-Type": "text/html; charset=utf-8" },
						});
					}
					const readme = await loadRepoReadme(repoName, meta.defaultBranch);
					return new Response(renderRepoLanding(meta, readme), {
						status: 200,
						headers: {
							"Content-Type": "text/html; charset=utf-8",
							"Cache-Control": "public, max-age=120, s-maxage=300",
						},
					});
				}

				if (upstreamResp.status === 404 && wantsHtml) {
					return new Response(renderPathNotFound(repoName, restPath), {
						status: 404,
						headers: { "Content-Type": "text/html; charset=utf-8" },
					});
				}

				if (upstreamResp.status === 404) {
					return new Response("Asset not found on upstream GitHub Pages", {
						status: 404,
						headers: TEXT_HEADERS,
					});
				}

				if (contentType.includes("text/html")) {
					const html = await upstreamResp.text();
					return new Response(injectBaseAndRewrite(html, repoName), {
						status: upstreamResp.status,
						headers: {
							"Content-Type": "text/html; charset=utf-8",
							"Access-Control-Allow-Origin": "*",
							"Cache-Control": "public, max-age=60, s-maxage=300",
						},
					});
				}

				// Static assets (CSS, JS, images, wasm, fonts): stream with a long edge cache.
				const assetHeaders = new Headers(upstreamResp.headers);
				assetHeaders.set("Access-Control-Allow-Origin", "*");
				assetHeaders.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
				return new Response(upstreamResp.body, {
					status: upstreamResp.status,
					headers: assetHeaders,
				});
			} catch (error) {
				if (wantsHtml) {
					const meta = await loadRepoMeta(repoName);
					if (meta) {
						const readme = await loadRepoReadme(repoName, meta.defaultBranch);
						return new Response(
							renderRepoLanding(meta, readme, { degraded: true }),
							{
								status: 200,
								headers: {
									"Content-Type": "text/html; charset=utf-8",
									"Cache-Control": "public, max-age=60, s-maxage=120",
								},
							},
						);
					}
				}
				return new Response(`EdgeOne Proxy Error: ${error.message}`, {
					status: 502,
					headers: TEXT_HEADERS,
				});
			}
		}
	}

	return next();
}

export const config = {
	matcher: [
		"/api/activity",
		"/api/activity/:path*",
		"/repo",
		"/repo/:path*",
		"/Bahnhof",
	],
};
