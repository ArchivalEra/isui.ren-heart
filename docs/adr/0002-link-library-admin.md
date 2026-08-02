# ADR-0002: 链接库与管理工具形态（全云端寄生）

- 日期：2026-08-02
- 状态：已接受

## 背景

isui.ren 的 /heart 页需要动态渲染链接卡片（tayori 3 名成员 × 各平台，≥9 条，持续增长）。站主需要图形化管理工具增删改链接并上传图片，且 URL/图片由站主自行录入。

## 决策

- **数据层**：Oracle 对象存储（S3 兼容）。链接库为 JSON 对象（标题/URL/图片/分组/排序/启用状态），图片为独立对象。PAYG 账户，Standard 10GB + 5 万请求/月 + 账户级 10TB/月出站免费。
- **API 层**：EdgeOne Edge Functions（免费档不限量请求）。手写 AWS SigV4 签名访问 Oracle S3；管理端 Bearer Token 鉴权（Token 存 Edge Function 环境变量/密钥管理）。
- **管理台**：静态页面（EdgeOne 托管），登录后增删改链接、上传图片。
- **公开渲染**：/heart 静态页 + 前端 JS 从公开端点拉链接库 JSON 渲染卡片；链接库 JSON 由 Edge Function 生成公开只读副本（或对象存储公开读 + 边缘缓存）。
- **原则**：全云端寄生——EdgeOne / Oracle / CF / Azure，本地零存储。代码托管 GitHub（isui.ren 仓库）。

## 为什么（trade-off）

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| EdgeOne Edge Functions 全托管 | 免费不限量、无服务器运维、EdgeOne 深度参与 | 需手写 SigV4、Edge Functions 为较新产品（API 面可能有限） | 采用 |
| VPS 小服务（Rust/Go） | 开发快、SDK 现成 | 跨境访问慢、违背「云端寄生」哲学 | 否决（管理操作低频时仍可作 fallback 宿主） |
| 浏览器直连 S3（预签名） | 简单 | 需要签名端点（还是后端）、密钥暴露风险 | 否决 |

## 后果

- 链接库 JSON 需设计好 schema（v1：id/title/url/image/group/sort/enabled），后续可扩展（描述、标签）
- EdgeOne Edge Functions 的运行时能力需在实现期验证（fetch、crypto 签名、环境变量）
- Oracle S3 端点需在 Edge Function 可达（Oracle Object Storage 有公网 S3 兼容端点，全球可达）
