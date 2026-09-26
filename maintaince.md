# isui.ren-heart 维护记录

> **角色**：EdgeOne Pages 静态源仓库（`deploy` 分支）。
> **自动产物**：`MangoMesa/` 由 `ArchivalEra/Shirone-personalized` 的 Deploy workflow 覆盖式推送；`Blog/` 是旧槽位跳转页。请勿手工修改这两个目录。
> **手工维护**：`middleware.js`（EdgeOne Makers 边缘中间件；它动态 import 的 `rewrite-for-prefix.mjs` 由主题仓部署时生成，勿手改）、`edge-functions/`、`repo/`（本地托管的静态站点）、`Bahnhof/`、`heart/`、`edgeone.json`（重定向与构建命令）。

## 边缘中间件路由

| 路由 | 行为 |
| :--- | :--- |
| `/api/activity`、`/api/activity/report` | 反代到 `api.mango-mesa.ccwu.cc` 的上游 Worker。 |
| `/repo`、`/repo/` | 302 到 `/MangoMesa/projects/`（`edgeone.json` 声明式，两条并列——精确匹配不含尾斜杠）。门户已退役：仓库清单改由 `@shirone-plugins/repo-inventory` 在构建期产出，项目页直接消费。 |
| `/repo/<repo>/` | 反代 `archivalera.github.io/<repo>/`，注入 `<base>` 并重写根相对资源；Pages 未就绪或未开启时回退为仓库 README 落地页。 |
| `/repo/S26-1_202609/` | 直接由本仓库 `repo/S26-1_202609/` 提供，优先于 GitHub Pages。 |
| `/repo/S26-1Shitass/` | 301 到 `/repo/S26-1_202609/`。 |
| `/Bahnhof` | 301 到 `/Bahnhof/`。 |

## 全站 404

站点级 404 页是根目录的 `404.html`（8860B，由 `isui.ren-Bahnhof` 的 workflow 写入，勿手工改）。

要让 EdgeOne Makers 真的把它当 404 页返回，`edgeone.json` 里的 `buildCommand` **必须非空**：

```json
{ "buildCommand": "echo noop", "redirects": [ ... ] }
```

原因（2026-09-25 实测）：Makers 只在**有构建阶段**的部署里登记 `404.html`。编译命令留空时它不登记，未命中任何静态文件的请求会回落成 **200 + 根 `index.html`**（根 index.html 是个跳转壳，所以表现为 200 的 HTML），资源类缺失路径因此被伪装成成功响应——调试部署问题时极易被误导。给一个不产出任何文件的 `echo noop`，就能把部署切进构建路径；输出目录仍是仓库根，站点内容不变。

验证（期望 404 + 标题 `404 — IM BAHNHOF`）：

```sh
curl -s -o /dev/null -w '%{http_code}\n' https://isui.ren/nonexistent-abc.xyz
```

三条已钉死的死路，别再试：`redirects` 的 `statusCode: 404` 被静默忽略（同位置的 301 正常生效）；`rewrites` 生效但只产出 200，且顶不掉默认兜底；Build Output API 的 `.edgeone/` 路由表能产出 404 状态码，但正文会被平台自带的错误页顶掉（标题 `Tencent Edgeone`），所以未采用。

## 变更记录

| 日期 | 类型 | 影响文件 | 变更要点 | 维护人 |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-26 | `chore` | `repo/S26-1Shitass/` | **删掉不可达的旧静态树**（67 个文件 / 13MB）：它已被 middleware 的名字级 301 永久隔离，发布出来却永远取不到；名字级 301 保留，老链接照旧。构建期探测器从此不再报孤儿目录 | ArchivalEra |
| 2026-09-26 | `refactor` | `middleware.js`, `rewrite-for-prefix.mjs` | **前缀重写合一**：删掉本地那份 `injectBaseAndRewrite`，改为动态 import 主题部署时从 `repo-pages` 插件产物拷来的 `rewrite-for-prefix.mjs`（实测该运行时支持同目录 import），两份实现从此只剩一份、漂移不可能；顺带修掉三个缺陷——仓名未转义（`isui.ren-heart` 的 `.` 成通配符）、上游已有 `<base>` 时叠加第二个、`<head>` 匹配过窄 | ArchivalEra |
| 2026-09-26 | `refactor` | `middleware.js`, `edgeone.json` | **退役 `/repo` 门户**：删除 `renderPortal` / `renderRepoCard` / `loadRepoList` 与门户分支（−2998 字节），`/repo` 改由 `edgeone.json` 302 到项目页，`/repo/<repo>/` 的镜像与 README 落地页原样保留（`repoBadge` 与 `FALLBACK_REPOS` 仍被落地页使用，故保留）。仓库清单的事实来源从此是构建期的 `repo-inventory`，边缘不再维护手抄清单 | ArchivalEra |
| 2026-09-26 | `feat` | `edgeone.json` | **项目页清单短 TTL**：为 `/MangoMesa/sites.json`（构建期仓库镜像清单的发布件）加 `Cache-Control: public, max-age=0, s-maxage=60, must-revalidate`，让页面的手动刷新最多陈旧 60 秒；`headers` 段与既有 `redirects` 并存 | ArchivalEra |
| 2026-09-25 | `fix` | `edgeone.json` | 全站 404：`buildCommand` 置为非空（`echo noop`），让 Makers 登记根目录 `404.html`；缺失路径从「200 + 根 index.html」改为「404 + 404.html」 | ArchivalEra |
| 2026-09-20 | `fix` | `middleware.js` | 门户与 README 落地页在 GitHub API 不可达时改用内置仓库清单兜底，避免降级成 404 | ArchivalEra |
| 2026-09-20 | `feat` | `middleware.js` | `/repo/` 从 302 跳转升级为 GitHub API 驱动的全仓库门户；无 Pages 的公开仓库回退渲染 README 落地页；新增路径级 404、仓库名校验与 API 降级清单 | ArchivalEra |
| 2026-09-20 | `docs` | `middleware.js` | 门户文案明确「公开原创仓库（不含 fork）」 | ArchivalEra |
