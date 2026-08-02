# CONTEXT.md — isui.ren

## 领域术语表

| 术语 | 定义 |
|------|------|
| **tayori** | 一支乐队。本项目的服务对象：网站为它提供对外入口。 |
| **卡片 (Card)** | isui.ren 主页上的一个入口块，点击后引导用户抵达某个外部目的地。计划 4 张，当前实现 3 张。 |
| **目的地 (Destination)** | 卡片最终要抵达的外部地址。已确定：tayori 的 X 账号、tayori 的 YouTube 频道、tayori 的官方网站。 |
| **空位 (Slot)** | 预留的第 4 张卡片，暂不实现。 |
| **入口页 (/heart)** | isui.ren 的实际内容页。访问 isui.ren 根路径会重定向到 `isui.ren/heart`，三个卡片以卡片形式呈现在此页。 |
| **代理 (Proxy)** | 本项目核心目的：卡片经 Cloudflare 代理（flo.ccwu.cc）抵达目标，而非简单 302。 |
| **flo.ccwu.cc** | 托管在 Cloudflare 的域名（NS 已指向 CF，当前无 DNS 记录），承载代理链路。 |
| **粉丝站定位** | isui.ren 是 tayori 乐队的粉丝站，**内容只有文章和图片**（合规风险低）。站点目的：跟踪乐队动态、收集歌曲信息。 |
| **三年计划** | 站主因无菌型中耳炎需长期休养（发病前一周接触到 tayori 的歌声，视之为「第一次听音乐的感觉」）。休养期间（约 3 年）通过本站看动态、收歌名，痊愈后听歌。因此**本站流量无需视频/音频流**，以 HTML/JS/图片为主。 |
| **X/YouTube 卡片的用途** | 看动态与歌名（页面 + 图片元数据），**不是播放视频**。 |
| **边缘层 (Edge)** | 负责国内用户接入与反代执行。主：EdgeOne 国际版免费档（Pages + Edge Functions 全托管，暂缓备案）；fallback 链：CF（优选 IP + for SaaS）→ 凤凰城 VPS（2Gbps/20T，大存储）。东京 Azure 学生机已踢出（优惠期不确定）。 |
| **回源 (Origin)** | 凤凰城 VPS 兼作最终回源兜底 + 快照爬虫宿主。 |
| **内容快照 (Snapshot)** | X/YouTube 内容以**静态快照**方式提供（非实时反代）：VPS 定时/按需爬取 → 静态页 + 图片 → Oracle 对象存储。私域盒子同步快照供站主/朋友浏览。 |
| **刷新按钮 (Refresh)** | 私域页面上触发 VPS 重新爬取的入口（按需更新快照）。 |
| **私域盒子** | hi3798mv300（电信家宽）：**已退出架构**（2026-08-02 转向后）。站主自建代理看最新消息，无需快照/私域分发。 |
| **2026-08-02 转向** | 放弃全部跨境反代/快照/备案/国内优化架构。isui.ren 改为**个人博客**（CF 全家桶托管）。站主用自建代理（包裹代理协议）直连 X/YouTube 看最新消息，速度优于跨洋 HTTPS。 |
| **博客主页 (/heart)** | isui.ren/heart：个人博客入口，动态颜文字「关注isui谢谢喵」。 |
| **卡片页 (/home)** | 卡片样式聚合页，后续网站/链接一个个添加。 |
| **CF 全家桶** | 全部托管 Cloudflare：Pages（博客/卡片页）+ Workers（API）+ KV/R2（数据/图片）。不再使用 EdgeOne/Oracle/国内服务。 |
| **白手套原则** | 架构中的服务器（VPS 等）只承担**白手套**功能（中转/执行），不是核心资产；核心是边缘托管 + 托管数据服务。 |
| **分线路路由** | isui.ren 用 dnspod 分线路解析：国内线路 → cn.isui.ren（EdgeOne 国际版），海外线路 → global.isui.ren（Cloudflare）。手动访问子域亦可。 |
| **源站层 (Feeder)** | 国内盒子 + 国外 VPS 只做**源站/加料**：抓取/生成内容，向存储层写入热数据。盒子只上传不出站分发（无 PCDN 风险）。 |
| **存储层 (Storage)** | Oracle 对象存储（小文件/图片/JSON）+ **SharePoint/OneDrive（A1 免费 1TB，大文件分发）**。冷热分层：热数据入存储由 CDN 分发；桶将满时冷数据倒掉（生命周期管理）。 |
| **大文件通道** | SharePoint 分享直链承担大文件分发：CDN 层对 `/download/*` 返回 **302** 到 SharePoint 链接，浏览器直连微软下载，CDN 不碰大文件流量（规避 EdgeOne/CF 免费档 fair use）。CDN 只分发小文件（页面/图片/JSON）。 |
| **播放器组件** | React 实现的视频播放器 + 文档播放器（挂在卡片/页面，展示性质「虽然不用但必须有」）。选型走 React 生态现成库（react-player / video.js / docx-preview / pdfjs-dist 等）。 |
| **302 链路** | 大文件下载统一走 302 重定向：CDN 层 `/download/*` → 302 → SharePoint 分享直链（主）→ 最终 fallback 网盘（MEGA/pCloud 候选）。浏览器直连最终源，CDN 不碰大文件流量。 |
| **fallback 网盘** | 欧洲良心网盘作为大文件分发最终兜底（候选：MEGA 免费 20GB 端到端加密、德裔创始人；pCloud 免费 10GB、官方承诺不限速）。 |
| **OpenList 网关** | 小盒子（hi3798mv300）跑 **OpenList**（Alist 继任 fork，23.8k stars）管理**中国移动云盘（139yun）**：生成 302 直链供大文件分发。盒子只做直链生成（合规：全程国内服务），经 CF Tunnel 保护不公开。 |
| **302 链路 v2** | 大文件下载：CDN/API `/download/*` → 调盒子 OpenList 获取直链 → **302 中国移动云盘**（国内带宽主通道）→ fallback：Oracle 对象存储 / MEGA/pCloud。 |
| **A1 已死** | Microsoft 365 Education A1 / SharePoint **确认拿不到**（2026-08-02，中国市场自助注册关闭，学校邮箱验证失败）。SharePoint 从所有链路移除，不再考虑。 |
| **链接库 (Link Library)** | 卡片背后是动态管理的链接集合：tayori 乐队 3 名成员 × 各平台，至少 9 条链接，未来持续增加。 |
| **管理工具 (Admin Tool)** | 图形化界面，用于增删改链接库条目，与 /heart 渲染页和边缘层对接。形态待定（见 ADR-0002）。 |
| **凤凰城 VPS** | Oracle Cloud Phoenix 区域实例，**PAYG 账户**（不会因闲置被回收），2Gbps / 20T 出站，大存储。最终兜底层 + 管理 API 候选宿主。 |
| **链接库存储** | Oracle 对象存储（用户 PAYG 账户）：Standard/IA/Archive 各 10GB，5 万 API 请求/月，账户级 10TB/月出站免费。S3 兼容 API。 |
| **云寄生原则** | 架构哲学：一切数据与服务寄生在云厂商（EdgeOne / Oracle / CF / Azure），**本地零存储**（本地机器/盒子不存任何运行数据）。代码托管 GitHub。 |
