# ADR-0005: 库级 fallback 链 + 分线读取（免费 fallback CDN 核心）

- 日期：2026-08-02
- 状态：已接受
- 类型：产品定位 + 架构核心

## 背景

多网盘（Oracle S3 / 移动云盘 / 阿里云盘 / 夸克 / 123云盘 / 文叔叔 / OneDrive / Google Drive / MEGA / pCloud / Telegram）免费资源可拼成跨厂商多活分发。isui.ren 的定位从「tayori 粉丝站」升级为「**坚不可摧、完全免费的 fallback CDN**」——纯寄生架构，粉丝站仅是第一个用例。

## 决策

### 库（Library）模型

- **库 = 资源分组单位**。一个库内所有文件遵循该库的 fallback 链；特例文件**开新库**而非改链（文件级链被否决——复杂度不值）。
- 每个库定义四条元数据：
  1. **同步链（sync chain）**：写入顺序，支持 fanout 并发（如 Google Drive 同时给多个国际盘排队分发，OneDrive 给国内盘排队分发）
  2. **cn 读取链**：国内线路的读取优先级（例：123yun → quark → aliyun → 文叔叔）
  3. **global 读取链**：海外线路读取优先级（例：onedrive → googledrive）
  4. **权限**：三态——`public-read`（所有人读）/ `admin-write`（管理员写）/ `device`（设备读写，盒子/爬虫用）。不做用户级 ACL（用 OpenList 安全机制兜底）

### 同步与路由

- 同步引擎：rclone / taosync 按同步链编排（链节点是**账号实例**：夸克源1=账号A、夸克源2=账号B 是不同节点）。
- 读取路由：Edge Function（EdgeOne/CF）按 cn/global 线路分流 → 按读取链顺序试源 → 失效时经 OpenList 重生直链 → 302；盘内文件不删，直链过期只重生。
- 改链：旧节点标记 `deprecated`（墓碑模式），同步引擎幂等收敛各盘副本，不做分布式删除。

### 示例

```
库「tayori-2026」
  同步链: teleDrive → google → onedrive → 123yun → quark（fanout）
  cn 读取: 123yun → quark → aliyun → 文叔叔
  global 读取: onedrive → google
  权限: public-read
```

## 为什么（trade-off）

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 库级链 + 文件特例开新库 | 元数据简单、系统逻辑恒定、复杂度装进数据 | 特例需新库（可接受） | 采用 |
| 文件级独立链 | 灵活 | 删除/改链/权限复杂度爆炸 | 否决 |
| 运行时动态路由 | 自适应 | 死循环风险、难调试 | 否决（路由=数据，非逻辑） |

## 后果

- 一期落地：链接库 schema（含 library_id）+ 卡片系统 + /heart /home
- 二期落地：同步管道（rclone/taosync 编排 + 资源索引 + 墓碑收敛）+ 读取路由（Edge Function 试源/重生/302）
- 内容合规前提不变（无政治/三害/版权内容）
- 国内网盘（阿里/夸克/123/文叔叔）无官方 API，用 OpenList 第三方接入，账号实名封号风险自担
