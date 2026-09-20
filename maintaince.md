# isui.ren-heart 维护记录

> **角色**：EdgeOne Pages 静态源仓库（`deploy` 分支）。
> **自动产物**：`MangoMesa/` 由 `ArchivalEra/Shirone-personalized` 的 Deploy workflow 覆盖式推送；`Blog/` 是旧槽位跳转页。请勿手工修改这两个目录。
> **手工维护**：`middleware.js`（EdgeOne Makers 边缘中间件）、`edge-functions/`、`repo/`（本地托管的静态站点）、`Bahnhof/`、`heart/`。

## 边缘中间件路由

| 路由 | 行为 |
| :--- | :--- |
| `/api/activity`、`/api/activity/report` | 反代到 `api.mango-mesa.ccwu.cc` 的上游 Worker。 |
| `/repo/` | 动态门户：GitHub API 拉取 `ArchivalEra` 公开原创仓库（不含 fork），展示 Pages 镜像 / 本地加速 / README 页状态；API 不可达时回退到内置清单。 |
| `/repo/<repo>/` | 反代 `archivalera.github.io/<repo>/`，注入 `<base>` 并重写根相对资源；Pages 未就绪或未开启时回退为仓库 README 落地页。 |
| `/repo/S26-1_202609/` | 直接由本仓库 `repo/S26-1_202609/` 提供，优先于 GitHub Pages。 |
| `/repo/S26-1Shitass/` | 301 到 `/repo/S26-1_202609/`。 |
| `/Bahnhof` | 301 到 `/Bahnhof/`。 |

## 变更记录

| 日期 | 类型 | 影响文件 | 变更要点 | 维护人 |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-20 | `feat` | `middleware.js` | `/repo/` 从 302 跳转升级为 GitHub API 驱动的全仓库门户；无 Pages 的公开仓库回退渲染 README 落地页；新增路径级 404、仓库名校验与 API 降级清单 | ArchivalEra |
| 2026-09-20 | `docs` | `middleware.js` | 门户文案明确「公开原创仓库（不含 fork）」 | ArchivalEra |
