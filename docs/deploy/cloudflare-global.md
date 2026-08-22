# global.isui.ren 上 Cloudflare Pages（手把手）

> 目标：`global.isui.ren` 用 Cloudflare Pages 托管——接 GitHub 的 **deploy 分支**
> （deploy 分支 = GitHub Actions 构建好的纯静态成品——CF 不用构建，直接部署）
> 前提：仓库 `ArchivalEra/isui.ren-heart` 的 deploy 分支已就绪（push main 自动更新）

---

## 第 1 步：Cloudflare 账号

1. 打开 https://dash.cloudflare.com → 注册/登录（免费计划够用——Pages 免费）
2. （若没实名过）右上角头像 → 检查账号状态——正常即可

## 第 2 步：连接 GitHub + 创建 Pages 项目

1. 左侧菜单 **Workers & Pages** → **Create** → 选 **Pages** 卡片 → **Connect to Git**
2. **授权 GitHub**：Cloudflare 跳转到 GitHub 授权页——选 **只授权 isui.ren-heart**
   （Install 时选 "Only select repositories" → 勾 `isui.ren-heart`）
3. 回到 CF，仓库列表选 **isui.ren-heart** → **Begin setup**

### 关键配置（别填错）

| 字段 | 填什么 | 为什么 |
|---|---|---|
| **Production branch** | **`deploy`** | WARNING: 关键！成品在 deploy 分支。别选 main（CF 构建环境没有 Rust——build.sh 跑不了） |
| Framework preset | None（不选） | 我们是纯静态 |
| **Build command** | **留空** | deploy 分支已经是 dist 成品——不需要构建 |
| **Build output directory** | **`/`** | dist 内容就在仓库根 |

4. **Save and Deploy** → CF 开始部署（没有构建命令——秒级完成）
5. 部署成功后 CF 给一个预览域名：`<项目名>.pages.dev`（先点开验证能出页面）

## 第 3 步：绑定 global.isui.ren

1. Pages 项目 → **Custom domains** 选项卡 → **Set up a custom domain**
2. 输入 `global.isui.ren` → **Continue**
3. CF 会显示要加的 DNS 记录：
   ```
   类型：CNAME
   名称：global
   目标：<项目名>.pages.dev
   ```
4. **去腾讯中国 dnspod 加这条记录**（域名 NS 在 dnspod——DNS 在那边加）：
   - dnspod 控制台 → 你的域名 → 记录管理 → 添加记录：
     - 主机记录：`global`（即 global.isui.ren）
     - 记录类型：CNAME
     - 记录值：`<项目名>.pages.dev`
     - 其他默认
5. 回 CF 点 **Activate**（或等它自动检测）——CF 会自动签 HTTPS 证书
   （Pages 自定义域名证书自动签发——不需要 NS 迁到 CF——几分钟生效）

## 第 4 步：验证

- [ ] `https://global.isui.ren/heart` → 三球动画 + 翻页 + 卡片墙
- [ ] `https://global.isui.ren/admin` → 404 页（管理页不上线——正常）
- [ ] 证书生效（地址栏小锁）

## 第 5 步：日常更新（以后永远不用手动碰 CF）

```
你 push main
  → GitHub Actions 构建（约 4-5 分钟）
  → 推 deploy 分支
  → Cloudflare Pages 检测到 deploy 分支新 commit → 自动构建部署（秒级）
  → global.isui.ren 更新
```

- **不用手动上传、不用进 CF 面板**——全自动
- 构建配额：免费 500 次/月（每次 push main 用一次——日常开发足够）

## 常见坑

1. **选了 main 分支** → 构建失败（无 Rust）——回项目设置 → **Builds** → 把
   Production branch 改成 `deploy`
2. **输出目录填错** → 部署后 404——Build output directory 填 `/`
3. **域名不生效** → dnspod 的 CNAME 没加对 / 没等 DNS 生效（几分钟~几小时）
4. **证书久不签发** → CF 自定义域名页看状态——一般自动，卡住就 Delete 重加
5. **改了 main 但 global 没更新** → 等 Actions 完成（4-5 分钟）→ deploy 分支
   更新 → CF 自动跟随（2-3 分钟）——总共约 8 分钟

## 之后（可选——根域境外分流）

dnspod 分线路：`@.isui.ren` 境外 → CNAME → global.isui.ren（或 pages.dev）
→ global 站加 `isui.ren` 自定义域 → CF 规则/`_redirects` 配 302 泛覆写
（详见 isui-ren-launch.md 第 4 节——等 cn 站也好了再一起配）
