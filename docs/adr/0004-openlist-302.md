# ADR-0004: 大文件 302 直链通道（OpenList + 中国移动云盘）

- 日期：2026-08-02
- 状态：已接受

## 背景

大文件分发受 CDN 免费档 fair use 限制（EdgeOne/CF 禁视频/大文件），需独立通道。候选：SharePoint A1（中国市场自助注册关闭，待定）、Oracle 对象存储、MEGA/pCloud、Telegram（国内被墙，仅海外/自用）。

## 决策

- **主通道**：小盒子（hi3798mv300，电信家宽）运行 **OpenList**（OpenListTeam/OpenList，23.8k stars，Alist 继任 fork），挂载**中国移动云盘（139yun）**（支持个人/家庭/群组/分享）。
- **直链机制**：OpenList 原生 302 模式（"only performs HTTP 302 redirects"）。CDN/Edge Function `/download/*` 调盒子 OpenList API 取直链 → 302 给用户 → 浏览器直连移动云盘（国内带宽，速度快）。
- **盒子边界**：只跑 OpenList 生成直链 + 管理国内网盘，**全程国内服务、无境外接触、无内容代理**（合规，非 PCDN——大文件流量走移动云盘，不经盒子）。经 CF Tunnel + Access 保护，仅内部 API 可调用，不公开暴露。
- **fallback 链**：移动云盘（主）→ Oracle 对象存储（10TB 出站）→ MEGA/pCloud。
- **SharePoint/A1 已死**：Microsoft 365 Education A1 中国市场自助注册关闭（2026-08-02 实测），从链路移除。
- **Telegram/TeleDrive**：仅海外线路 fallback 与自用备份（国内被墙）。

## 为什么（trade-off）

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 移动云盘 + OpenList（盒子） | 国内带宽快、免费额度大、盒子合规 | 依赖家宽盒子在线、移动账号额度需确认 | 主通道 |
| SharePoint A1 | 1TB、微软线路 | 中国市场自助注册关闭 | 待定（得则用） |
| Oracle 对象存储 | 20GB + 10TB 出站、S3 API | 凤凰城对国内速度一般 | fallback |
| Telegram | 无限免费 | 国内被墙 | 仅海外/自用 |

## 后果

- 盒子需安装 OpenList + cloudflared（CF Tunnel），移动云盘账号登录态由 OpenList 维护（登录 token 有有效期，需定期刷新）
- `/download/*` 的 Edge Function 需缓存直链（直链有效期通常较短，缓存策略按有效期）
- 移动云盘免费额度与速度需实测（和彩云移动用户额度较大）
