# EdgeOne 工单：UpstreamFollowRedirect 在冷回源时不生效（回源 GitHub Release 资产必 404）

> 提交地址：https://console.tencentcloud.com/workorder（或 EdgeOne 控制台右侧「工单」）
> 产品：边缘安全加速平台 EO / EdgeOne　·　站点：`isui.ren`（`zone-3taqnjqfr1zo`）　·　加速域名：`static.isui.ren`

---

## 一、问题摘要

在规则引擎中使用 **回源跟随重定向（`UpstreamFollowRedirect`）** 回源 GitHub Release 资产时，
**只要该 URL 不在边缘缓存中（`eo-cache-status: MISS`），回源 100% 失败并返回 404**；
而**同一时刻从公网直连 GitHub 是正常的 200**。

**已缓存过的 URL（`HIT`）返回 200** —— 说明缓存层没问题，问题在**回源这一跳没有跟随 302**。

---

## 二、复现步骤

### 环境

| 项 | 值 |
|---|---|
| 站点 ZoneId | `zone-3taqnjqfr1zo` |
| 站点名 | `isui.ren` |
| 加速域名 | `static.isui.ren`（Origin：`github.com`，协议 https，443） |
| 规则名 | `release-byte-proxy`（优先级 1） |
| 命中条件 | `${http.request.host} in ['static.isui.ren'] and ${http.request.uri.path} in ['/*/*/releases/download/*/*']` |

### 规则动作（4 个，顺序如列）

| # | Action | 参数 |
|---|---|---|
| 1 | `Cache` | `CustomTime.Switch=on`, `IgnoreCacheControl=on`, `CacheTime=31536000` |
| 2 | `StatusCodeCache` | `404/500/502/503 → CacheTime=0` |
| 3 | `ModifyOrigin` | `OriginType=IPDomain`, `Origin=github.com`, `OriginProtocol=https`, `HTTPSOriginPort=443` |
| 4 | `UpstreamFollowRedirect` | `Switch=on`, `MaxTimes=3` |

### 复现命令

```bash
# 1) 先确认该 URL 已缓存（HIT），返回正常
curl -s -D- -o /dev/null \
  "https://static.isui.ren/ArchivalEra/LLVM-wasm/releases/download/v0.1.6/toolchain__driver__toolchain.mjs.identity.000"
#   ⇒ HTTP/2 200, eo-cache-status: HIT

# 2) 清除该 URL 的边缘缓存
tccli teo CreatePurgeTask --ZoneId zone-3taqnjqfr1zo \
  --Type purge_url \
  --Targets '["https://static.isui.ren/ArchivalEra/LLVM-wasm/releases/download/v0.1.6/toolchain__driver__toolchain.mjs.identity.000"]'

# 3) 立刻再次请求 —— 必然 404
curl -s -D- -o - \
  "https://static.isui.ren/ArchivalEra/LLVM-wasm/releases/download/v0.1.6/toolchain__driver__toolchain.mjs.identity.000"
```

### 步骤 3 的实际响应头（2026-11-04 抓取）

```http
HTTP/2 404
server: github.com
x-github-request-id: EC91:102516:1635385:20FFF0E:6AEB1746
x-github-edge-region: southeastasia
content-length: 9
eo-log-uuid: 534564808813564293
eo-cache-status: MISS

Not Found
```

**关键点**：
- `server: github.com` —— 这是 **GitHub 自己的响应**被原样返回，说明 EO 回源拿到了 github.com 的东西就直接返回了；
- `eo-cache-status: MISS` —— 确认走了回源；
- body 是 `Not Found`（9 字节），**不是** GitHub 的 HTML 404 页，也不是 EO 自己的兜底页。

### 对照：同一时刻 GitHub 直连正常

```bash
$ curl -sL -o /dev/null -w '%{http_code} %{size_download}\n' \
    "https://github.com/ArchivalEra/LLVM-wasm/releases/download/v0.1.6/toolchain__driver__toolchain.mjs.identity.000"
200 9492          # ← 完全正常

$ curl -s -o /dev/null -w '%{http_code} → %{redirect_url}\n' \
    "https://github.com/ArchivalEra/LLVM-wasm/releases/download/v0.1.6/toolchain__driver__toolchain.mjs.identity.000"
302 → https://release-assets.githubusercontent.com/github-production-release-asset/1412982947/...
```

**GitHub 的首跳是 302（跳往 `release-assets.githubusercontent.com`），需要跟随一次才能拿到字节。**

---

## 三、现象规律（已做的对照实验）

| 实验 | 结果 |
|---|---|
| 已缓存的 URL（`HIT`） | **200**，正常返回字节 |
| purge 后同一 URL（`MISS`） | **404**，连续 5–10 次全部失败，非随机 |
| 同一 Release 的不同 codec（`zstd`/`gzip`/`identity`） | 已缓存的 200，purge 过的 404 —— 与文件名无关 |
| 规则优先级 | 已调到 **prio=1**（最前），排除被其他规则抢占 |
| 单 action 规则 | 同样复现 |
| 多个不同 Release（LLVM-wasm / Octave-Extra-Content） | 同样复现 |

**结论：只要冷回源，`UpstreamFollowRedirect` 就没有跟随那个 302。**

---

## 四、我的判断（请协助确认）

`UpstreamFollowRedirect` 在**冷回源**路径上未生效，导致：
1. EO 向 `github.com` 请求；
2. GitHub 返回 `302` 到 `release-assets.githubusercontent.com`；
3. EO **没有跟随**，而是把这个 302（或其后续错误）当作最终结果返回 / 或直接给出了一个 9 字节 `Not Found`；
4. 该 404 被返回给客户端。

已缓存的老对象是**过去某次成功回源**留下的，所以能返回 200 —— 这也解释了为什么这个故障表现为「时好时坏」：**取决于该 URL 是否在缓存里**。

---

## 五、需要贵方协助的

1. **确认 `UpstreamFollowRedirect` 在当前套餐 / 海外区域（overseas）是否完整可用**；
   我们用的是 **EdgeOne 免费版**（资源规格 `sv_edgeone_free_plan`）。若该功能有套餐限制，请明确说明。
2. **用 `eo-log-uuid: 534564808813564293` 和 `EC91:102516:1635385:20FFF0E:6AEB1746` 查询该次回源日志**，
   确认 EO 向 `github.com` 发出请求后收到的响应码、以及是否尝试过跟随跳转。
3. 若确认是平台侧问题，请修复；若存在已知限制，请告知**可用的替代配置方式**（例如是否需要改为
   `Origin` 直接指向 `release-assets.githubusercontent.com`，或需要升级套餐）。

---

## 六、补充信息

- 该站点同时作为**静态站点托管**（`static.isui.ren` 也提供 HTML/JSON/Markdown 内容），
  这部分通过 `ModifyOrigin` + `HostHeader` + `UpstreamURLRewrite` 回源 `raw.githubusercontent.com`，
  **工作正常**（不涉及重定向跟随）。所以 `ModifyOrigin` / `HostHeader` / `UpstreamURLRewrite` 三个动作本身没有疑问。
- 出问题的**只有 `UpstreamFollowRedirect` 这一个动作**。
- 时间：问题自 2026-11-04 起被稳定复现（更早可能已存在，只是被缓存掩盖）。

---

## 七、期望

希望得到明确答复：
- **是平台 bug（将修复）** → 我们等待，暂时用其他方案兜底；
- **是套餐/区域限制** → 请说明哪一档支持，我们评估是否升级；
- **是配置方式不对** → 请指出正确配置，我们按指引修改。

谢谢。

---

## 八、【补充验证 2026-11-04，按贵方回复建议做的对照实验】

贵方回复建议「源站直接配 release-assets 或移除路径改写规则」。我按此方向做了**控制变量实验**，
结论与贵方的判断**部分不同**，请再确认：

### 8.1 同一 zone、同一条规则、只改加速域名

我在**同一个 zone**（`zone-3taqnjqfr1zo`）下，用**完全相同的规则定义**（`Cache` + `ModifyOrigin(github.com)` +
`UpstreamFollowRedirect(on, 3)`，**无任何** `UpstreamURLRewrite`），分别挂在两个加速域名上：

| 加速域名 | 该域名的默认 `OriginDetail.HostHeader` | 冷取结果 |
|---|---|---|
| `pure-dns.isui.ren` | `pure-dns.isui.ren` | **200 / MISS → 跟到了 `release-assets`** ✅ |
| `static.isui.ren` | `static.isui.ren` | **404 / MISS / `server: github.com`** ❌ |

**两条规则没有任何路径改写动作**，所以「路径被改写」这一解释不成立。

### 8.2 唯一差异：加速域名的默认 `HostHeader`

```
static.isui.ren  OriginDetail.HostHeader = 'static.isui.ren'
pure-dns.isui.ren OriginDetail.HostHeader = 'pure-dns.isui.ren'
```

`ModifyOrigin` 只换 origin 地址，**不换回源 Host 头** —— 所以回源 `github.com` 时带的是
`Host: static.isui.ren`。

我用 curl 直接验证了这一点：

```bash
curl -H 'Host: static.isui.ren' https://github.com/.../manifest.json -o /dev/null -w '%{http_code}'
#   ⇒ 301（错误跳转，最终 404）

curl -H 'Host: github.com'      https://github.com/.../manifest.json -o /dev/null -w '%{http_code}'
#   ⇒ 302（正确的 release 下载跳转）
```

**GitHub 对正确的 `Host: github.com` 返回 302；对错误的 Host 返回 301 到别处。**

### 8.3 我为修复做的尝试（以及为什么没成功）

我在 `release-byte-proxy` 规则里加了 `HostHeader` 动作（`Action=custom, ServerName=github.com`）：

```json
{"Name":"HostHeader","HostHeaderParameters":{"Action":"custom","ServerName":"github.com"}}
```

**但该参数无法保存**：

```
CreateL7AccRules 返回成功（RequestId 正常）
DescribeL7AccRules 查询结果：[Cache: 有参数]  [StatusCodeCache: 空]  [ModifyOrigin: 空]  [HostHeader: 空]  [UpstreamFollowRedirect: 空]
```

**只有排在第一个的 `Cache` 动作参数被保存，其余动作的参数全部丢失。**
试过 `CreateL7AccRules` 直接传、`--cli-input-json` 文件传、`ModifyL7AccRule` 修改，全部一样。

⇒ **这可能是贵方 API 的一个 bug**（`RuleEngineAction` 里除 `CacheParameters` 外的
`*Parameters` 字段在写入时被丢弃），请协助确认。

### 8.4 请贵方明确的两点

1. **控制台里给 `release-byte-proxy` 加 `HostHeader` 动作（ServerName = `github.com`）是否有效？**
   —— 若控制台可以而 API 不行，那就是 API bug；
2. 若 `HostHeader` 也无法覆盖默认值，请告知在 `ModifyOrigin` 换 origin 时**如何让回源 Host 跟随 origin**。

### 8.5 复现命令（最小化）

```bash
ZONE=zone-3taqnjqfr1zo
FILE=ArchivalEra/LLVM-wasm/releases/download/v0.1.6/toolchain__driver__toolchain.mjs.zstd.000

# 两个加速域名上各打一次（同一 asset，都保证是冷缓存）
curl -s -D- -o /dev/null "https://pure-dns.isui.ren/$FILE" | head -3   # ⇒ 200 / Windows-Azure-Blob
curl -s -D- -o /dev/null "https://static.isui.ren/$FILE"   | head -3   # ⇒ 404 / github.com
```

（若某一侧已缓存，先 purge：`tccli teo CreatePurgeTask --ZoneId $ZONE --Type purge_url --Targets '["https://<host>/<FILE>"]'`）

---

**小结**：`UpstreamFollowRedirect` 本身正常（在 `pure-dns` 上冷取 200）。
问题在 `static.isui.ren` 这条域名的 **回源 Host 头**不对，导致 GitHub 不返回正确的 302。
而修复所需的 `HostHeader` 动作参数**无法通过 API 保存**。这两点请贵方协助定位。

---

## 九、【结案 2026-11-04】根因不是 Host 头，是规则合并泄漏 —— 工单可撤回

> **本节结论优先于以上所有分析。§八 的"Host 头"判断是错的，勿据此提交工单。**

**实际根因**：EdgeOne 的多条规则命中时是**合并**语义，不是独占。
高优先级规则只覆盖它**自己声明了**的动作，没声明的动作会从低优先级规则**继续继承**。

`static.isui.ren` 上同时有两条规则会命中取货请求：

| 规则 | 声明的动作 |
|---|---|
| `release-byte-proxy`（高） | `Cache`、`StatusCodeCache`、`ModifyOrigin(github.com)`、`HostHeader(github.com)`、`UpstreamFollowRedirect` |
| `site-from-deploy-eo`（低） | `ModifyOrigin(raw.githubusercontent.com)`、`UpstreamURLRewrite`：`^/(.*)$` → `/ArchivalEra/Static-Contract/deploy-eo/$1` |

合并后 `UpstreamURLRewrite` 从低优先级规则继承下来，回源路径变成
`github.com/ArchivalEra/Static-Contract/deploy-eo/<o>/<r>/releases/...` → 9 字节 `Not Found`。

**`HostHeader` 根本不是问题**：`server: github.com` 已经证明回源 Host 是对的。
`pure-dns` 之所以 200，只是因为那条域名上**没有**会泄漏 `UpstreamURLRewrite` 的规则。

**修复**：在 `release-byte-proxy` 里加一条**恒等重写**占住动作声明位：

```json
{ "Name": "UpstreamURLRewrite",
  "UpstreamURLRewriteParameters": { "Type": "Path", "Action": "regexReplace",
                                    "Regex": "^/(.*)$", "Value": "/$1" } }
```

已验证：删掉即 404，加回即 200；冷回源 `200 / MISS / server: Windows-Azure-Blob`；
manifest → 分片 → zstd 解压 → sha256 与 `entry.sha256` 一致。

完整可工作配置与三个 API 坑见 `docs/edgeone-rules-verified-config.md`。

**给工单的处置**：这**不是平台 bug**，免费版 `UpstreamFollowRedirect` 完整可用，
`HostHeader` / `ModifyOrigin` / `UpstreamURLRewrite` 也全部正常。
**不需要提交工单。** 唯一值得报的只剩 API 写入不稳定（`CreateL7AccRules` 批量顺序反转、
`ModifyL7AccRule` 丢参、`ModifyL7AccRulePriority` 无效、`DescribeL7AccRules` 回显失真），
且这些**不影响控制台使用**。

