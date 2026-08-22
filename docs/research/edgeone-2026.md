# EdgeOne 调查笔记（2026-08）

来源：edgeone.ai 官方文档（/document/55640 计费总览、/document/70405 Free Plan 指南、/document/57404 跨境加速计费、/pricing 定价页）

## 结论速览

| 问题 | 答案 |
|------|------|
| 国内版 vs 国际版 | 国内版 = 腾讯云中国站（cloud.tencent.com），大陆节点；国际版 = edgeone.ai / console.tencentcloud.com |
| 国际版 Free Plan | $0/月，无信用卡；Unmetered 加速流量+请求、Unmetered Edge Functions、免费 SSL、20 条规则引擎、200 子域、1 条限流规则；limited beta，需活动/兑换码解锁（最多 5 个） |
| **Free Plan 视频限制** | WARNING: 官方明确：免费计划仅加速标准网站内容（HTML/JS/CSS），**不支持视频分发和大文件分发**；违规可被停服（/document/70405 第 2 条） |
| 大陆优化 | "Chinese Mainland Network Optimization / Cross-MLC-border acceleration"：接入点在香港（AP1），**仅 Enterprise 计划**，$0.57/GB 增值计费 —— 免费档不含 |
| 国内版备案 | 中国法规要求境内 CDN 域名强制 ICP 备案；国内版必然审查内容（X/YouTube 为封锁内容，不可能加速） |
| 免费版 SLA | 不保证 SLA |

## 对 isui.ren 场景的含义

- EdgeOne 国际版 Free Plan 可承载：isui.ren 主页（静态页）、tayori 官网反代（若为静态小文件）
- **不可承载：X / YouTube 反代**（视频分发限制 + fair use，YouTube 反代必触发）
- 国内版：排除（备案 + 内容审查）
- 视频类目标只能靠：凤凰城 VPS（2Gbps/20T）直出或 CF+VPS 链路

## 不确定项

- Free Plan "China Access" 宣传语的实际大陆接入方式（免费档无大陆节点优化，应理解为大陆用户可经全球边缘访问，连通性优于 CF 免费版但非大陆节点）
- 国内版 EdgeOne 免费档是否存在（兑换码 FAQ 称中美站通用，但未验证国内站条款）
