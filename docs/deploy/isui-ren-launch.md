# isui.ren 第一阶段上线部署指南

> 顺序（用户钦定）：① Oracle 对象存储（配置同步盘）→ ② cn 站（EdgeOne）
> → ③ global 站（Cloudflare Pages）→ ④ 根域 @.isui.ren 泛分流（geo 分 cn/global + 302 /heart）
> ⚠️ **只动 @.isui.ren 根域记录——其他子域名（cn./global. 等）保持现状**（之后另有他用）

## 目标拓扑

```
访问 isui.ren（根域 @）
  ├─ DNS 分线路（境内）→ EdgeOne（腾讯云国际）→ cn.isui.ren/heart
  └─ DNS 分线路（境外）→ Cloudflare → global.isui.ren/heart
                        （根域 302 /heart——同源跳转——地址栏不变）

Oracle 对象存储（配置同步盘——公共读——以后大文件源站）
  └─ config.json（default/cn/global 三段——管理页 /admin#heart 导出后上传）

其他子域名（cn./global./admin 等）——当前阶段不动，之后干别的
```

---

## 0. 前置确认

- [ ] `web-ui/` 构建产物就绪：`cd web-ui && source ~/.nvm/nvm.sh && ./build.sh` → 输出 `dist/`
- [ ] 产物大小预期：`dist/` 约 284KB（wasm 176KB + js 52KB + css 18KB——gzip <90KB）
- [ ] 本地预览验证：`python3 serve.py 8080` → `http://127.0.0.1:8080/`（heart 页）、`/admin#heart`（管理页）
- [ ] 记录你的 **DNS 面板**（dnspod / 腾讯云国际 / 注册商自带——分线路能力不同，见第 4 步）

---

## 1. Oracle 对象存储（配置同步盘）

> 用途：config 分发中心（公共读）——以后大文件源站也用它。当前阶段先把桶建好 + 放 config。

### 1.1 创建桶
1. OCI 控制台 → Storage → Object Storage & Archive Storage → Buckets → Create Bucket
2. 命名：`isui-config`（地域选离你近的：`ap-tokyo-1` 或 `ap-singapore-1`）
3. 勾选 **Public Bucket**（公共读——配置要能被浏览器 fetch）
   - 若 OCI 版本不支持建桶时直接公开：建私有桶 → 桶详情 → Edit Visibility → Public

### 1.2 上传 config
1. 上传 `web-ui/public/config.json`（对象名 `config.json`）
2. 公开 URL 格式：
   ```
   https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/isui-config/o/config.json
   ```
   （bucket 详情页有「Object URL」复制按钮）
3. 验证：浏览器打开该 URL 应显示三段 JSON（default/cn/global）

### 1.3 前端接入（可选项——第一阶段建议先同站 config）
- 现状：前端 `fetch('./config.json')`（同站——每站独立）
- 以后切换集中配置：改 `web-ui/src/site-config.ts` 的 fetch 地址为上述对象存储 URL
  （改一处 → cn/global 全站共用同一份 config——热更新）
- 第一阶段建议：**先同站**（部署简单、无跨域问题）——对象存储桶建好备用

### 1.4 写侧（以后）
- 手动：OCI 控制台覆盖上传 / OCI CLI：`oci os object put -bn isui-config --file config.json`
- 自动（VPS 解禁后）：favicon-proxy 同款小服务 + 预签名 URL 自动写（本期不做）

---

## 2. 一键部署（GitHub Actions → deploy 分支 → 双平台自动拉取）

> 已提交 `.github/workflows/deploy.yml`：**推 main → Actions 构建 wasm+dist
> → 推 `deploy` 分支（根目录 = dist 内容）→ EdgeOne Makers + CF Pages
> 都盯 deploy 分支自动部署**。你只管推 main。
>
> 为什么 Actions 构建：wasm 需要 Rust/cargo——Makers 与 CF Pages 的构建
> 环境大概率没有 Rust（已查 Makers 文档：Git 集成需「构建命令」——没保证
> Rust）——Actions（ubuntu 自带 cargo）构建后，deploy 分支是纯静态，
> 两平台构建命令留空即可。

### 2.1 EdgeOne Makers（cn 站）
1. EdgeOne 控制台 → Makers 页 → **Create Project → Import Git Repository**
2. 连接 GitHub → **Authorize EO Makers** → 授权仓库（ArchivalEra/isui.ren）
3. 项目设置：
   - 仓库：`ArchivalEra/isui.ren`——**分支：`deploy`**（若控制台只支持 main，
     则接 main + 构建命令 `cd web-ui && ./build.sh`——但需确认 Makers 环境有 Rust；
     推荐 deploy 分支零构建）
   - **构建命令：留空**（deploy 分支已是成品——或填 `echo noop`）
   - 加速区域：全球可用区域（不含中国大陆）——同 cn 站现状
4. 绑定 `cn.isui.ren`（Domain Management → Custom Domain——CNAME 指向 Makers 分配地址）
5. DNS：`cn.isui.ren CNAME → <Makers 分配地址>`

### 2.2 Cloudflare Pages（global 站）
1. CF 控制台 → Workers & Pages → Create → Pages → **Connect to Git**
2. 选仓库 `ArchivalEra/isui.ren`——**分支：`deploy`**
   - 构建命令：**留空**（deploy 分支已是成品）
   - 输出目录：`/`（根）
3. 绑定 `global.isui.ren`（Custom domains——DNS 自动/手动加 CNAME → pages.dev）

### 2.3 SPA fallback（关键）
`/`、`/heart`、`/admin` 都要回 `index.html`：
- CF Pages：默认 SPA fallback ✓
- EdgeOne Makers：**务必验证** `/heart` 和 `/admin#heart` 能打开（不是 404）；
  若 404 → 规则引擎 → URL 重写（无匹配静态文件 → `/index.html`）

### 2.4 验证
- `https://cn.isui.ren/heart` → 三球动画 + 文件夹翻页
- `https://cn.isui.ren/admin#heart` → 管理页三栏
- 页面规则生效：config 里 `/heart enabled:true`（默认已配）——其他路径应 404 页

---

## 3. 手动部署（备选——不用 Git 集成时）

### 3.1 本地构建
```bash
cd web-ui && ./build.sh   # 产物 dist/
```

### 3.2 EdgeOne Makers Direct Upload
Makers → Create Project → **Upload directly** → 拖入 `dist/` → 绑定 `cn.isui.ren`
> ⚠️ 文档明确：**选了上传方式的项目不能切 Git 集成**——要 Git 自动部署
> 必须新建「Import Git Repository」项目

### 3.3 CF Pages Direct Upload
Workers & Pages → Create → **Upload assets** → 拖入 `dist/` → 绑定 `global.isui.ren`
> ⚠️ CF Pages 构建环境无 Rust——别用 Git 自动构建（除非接 deploy 分支——见第 2 节）
> 每次更新重新上传（强缓存见附录）

---

## 4. 根域 @.isui.ren 泛分流（geo 分 cn/global + 302 /heart）

> ⚠️ **只动 @ 记录——其他子域名一概不碰**

### 4.1 DNS 分线路解析（在你有分线路能力的 DNS 面板做）
```
@.isui.ren  境内（大陆）  → CNAME/A → EdgeOne 分配地址（cn 站）
@.isui.ren  境外（全球）  → CNAME → global.isui.ren（CF Pages）
```
面板差异：
- **dnspod 免费版**：支持「境内/境外」分线（默认线路就有）——够用
- **腾讯云国际 DNS**：看是否提供线路分组（没有就用 dnspod 或注册商）
- 没有分线路能力：退而求其次——`@` 直接 CNAME 到其中一个站（先全局走 cn 或 global）

### 4.2 根域 302 → /heart（同源——地址栏不变）
> ⚠️ 用户钦定：「重要的是我们要做到 302」——**但别用「回源 302」**（会暴露目标 URL、
> 地址栏变成百度那次事故）。要用 **CDN 重定向规则**（同源跳转 / → /heart）。

- **EdgeOne**：规则引擎 → 重定向规则 → `@.isui.ren` 请求路径 `/` → 302 `/heart`
- **CF**：Redirect Rules（或 Pages 的 `_redirects`：`/ /heart 302`）

### 4.3 验证
- 境内访问 `http://isui.ren` → 302 → `cn.isui.ren/heart`（地址栏变为 cn 域名/heart）
- 境外访问 → 302 → `global.isui.ren/heart`
- 子域名不受影响：`cn.isui.ren`、`global.isui.ren`、其他 → 原样

---

## 5. 总验证清单

| 检查项 | 期望 |
|---|---|
| `cn.isui.ren/heart` | 三球动画 + 翻页 + 卡片墙 |
| `global.isui.ren/heart` | 同上 |
| `cn.isui.ren/admin#heart` / `global...` | 三栏管理页 |
| `isui.ren`（境内） | 302 → cn/heart |
| `isui.ren`（境外） | 302 → global/heart |
| 其他子域名 | 原样不动 |
| 管理页导出 config → 对象存储/仓库上传 | 刷新全站生效 |

---

## 附录：常见坑

1. **强缓存**（wasm/js 文件名带 hash 但 index.html 可能被缓存）：
   - 更新后用户要 Ctrl+Shift+R——部署时尽量让 index.html 不缓存（EdgeOne/CF 规则：html 不缓存，assets 长缓存）
2. **SPA fallback 漏配**：`/heart`、`/admin` 404 = fallback 没生效（CF Pages 自动、EdgeOne 要查规则）
3. **302 别用回源**：回源 302 会把浏览器地址栏带跑（百度事故）——用 CDN 重定向规则
4. **对象存储 CORS**：以后前端直读对象存储 config 时，若遇 CORS 错——桶设置加 CORS 规则
   （`*` origin + GET——Oracle 对象存储支持 CORS 配置）
5. **favicon 代理**（scripts/favicon-proxy/）：VPS 解禁后再部署（本期卡片图标用灰阶占位兜底）
