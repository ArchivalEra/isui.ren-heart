# EdgeOne 规则引擎：取货通道的可工作配置与三个坑

> 记录日期：2026-11-04
> 适用：`static.isui.ren`（Static-Contract 契约站 + release 字节取货）
> ZoneId：`zone-3taqnjqfr1zo`（isui.ren，EdgeOne **免费版** overseas）
>
> **这份文档的价值**：配置本身不难，难的是三个反直觉的平台行为。
> 下次改 Anything in this zone 之前先读 §2，能省掉整轮排查。

---

## 1. 最终配置（可工作的那一版）

### 1.1 加速域名

| 域名 | Origin | HostHeader |
|---|---|---|
| `static.isui.ren` | `github.com` | `static.isui.ren` |
| `pure-dns.isui.ren` | `baidu.com` | `pure-dns.isui.ren` |
| `cdn-oracle.isui.ren` | `apple.dib.l.cd` | `cdn-oracle.isui.ren` |

### 1.2 规则（控制台里**越靠下优先级越高**）

| 控制台序号 | 规则名 | API 优先级 | 职责 |
|---:|---|---:|---|
| 01 | `oracle源分片回源` | 7 | `cdn-oracle` 的 Range / HTTP2 |
| 02 | `site-from-deploy-eo` | 6 | **站点文件兜底**：回源 `raw` 的 `deploy-eo` 分支 |
| 03 | `site-root-index` | 5 | `/` → `deploy-eo/index.html` |
| 04 | `site-content-type-md` | 4 | `.md` → `text/markdown` |
| 05 | `site-content-type-json` | 3 | `.json` → `application/json` |
| 06 | `site-content-type-html` | 2 | `.html` → `text/html` |
| **07** | **`release-byte-proxy`** | **1** | **release 字节取货（最高优先级）** |

### 1.3 `release-byte-proxy` 的 6 个动作（**顺序与内容都要一模一样**）

条件：
```
${http.request.host} in ['static.isui.ren'] and ${http.request.uri.path} in ['/*/*/releases/download/*/*']
```

| # | 动作 | 参数 |
|---|---|---|
| 1 | `Cache` | `CustomTime.Switch=on`, `IgnoreCacheControl=on`, `CacheTime=31536000` |
| 2 | `StatusCodeCache` | `404/500/502/503 → CacheTime=0` |
| 3 | `ModifyOrigin` | `OriginType=IPDomain`, `Origin=github.com`, `OriginProtocol=https`, `HTTPSOriginPort=443` |
| 4 | `HostHeader` | `Action=custom`, `ServerName=github.com` |
| 5 | **`UpstreamURLRewrite`** ⭐ | `Type=Path`, `Action=regexReplace`, `Regex=^/(.*)$`, `Value=/$1` |
| 6 | `UpstreamFollowRedirect` | `Switch=on`, `MaxTimes=3` |

**第 5 条是恒等重写**（路径原样保留），它不改变任何东西——它的唯一作用是
**压住 `site-from-deploy-eo` 那条前缀改写**。删掉它取货立刻 404。

完整 JSON（可直接粘进控制台）：

```json
{
  "FormatVersion": "1.0",
  "Rules": [
    {
      "RuleName": "release-byte-proxy",
      "Branches": [
        {
          "Condition": "${http.request.host} in ['static.isui.ren'] and ${http.request.uri.path} in ['/*/*/releases/download/*/*']",
          "Actions": [
            { "Name": "Cache",
              "CacheParameters": { "CustomTime": { "Switch": "on", "IgnoreCacheControl": "on", "CacheTime": 31536000 } } },
            { "Name": "StatusCodeCache",
              "StatusCodeCacheParameters": { "StatusCodeCacheParams": [
                { "StatusCode": 404, "CacheTime": 0 },
                { "StatusCode": 500, "CacheTime": 0 },
                { "StatusCode": 502, "CacheTime": 0 },
                { "StatusCode": 503, "CacheTime": 0 } ] } },
            { "Name": "ModifyOrigin",
              "ModifyOriginParameters": { "HTTPSOriginPort": 443, "OriginType": "IPDomain", "Origin": "github.com", "OriginProtocol": "https" } },
            { "Name": "HostHeader",
              "HostHeaderParameters": { "Action": "custom", "ServerName": "github.com" } },
            { "Name": "UpstreamURLRewrite",
              "UpstreamURLRewriteParameters": { "Type": "Path", "Action": "regexReplace", "Regex": "^/(.*)$", "Value": "/$1" } },
            { "Name": "UpstreamFollowRedirect",
              "UpstreamFollowRedirectParameters": { "MaxTimes": 3, "Switch": "on" } }
          ]
        }
      ],
      "Description": []
    }
  ]
}
```

---

## 2. 三个坑（这份文档的主要价值）

### 坑 1：EdgeOne 规则是"合并"，不是"独占"

**多条规则同时命中时，高优先级规则只覆盖它自己声明了的动作；没声明的动作会从低优先级规则继续继承。**

实际发生的事：

```
取货请求 /ArchivalEra/LLVM-wasm/releases/download/v0.1.6/xxx
  → 同时命中 07 (release-byte-proxy) 与 02 (site-from-deploy-eo)

  合并后：
    ModifyOrigin       ← 07 有 → 回源 github.com ✓
    HostHeader         ← 07 有 → Host: github.com ✓
    UpstreamURLRewrite ← 07 没有 → 02 的 /deploy-eo/$1 继续生效 ✗

  最终回源路径：
    github.com/ArchivalEra/Static-Contract/deploy-eo/ArchivalEra/LLVM-wasm/releases/...
    → github.com 上不存在 → 404（9 字节 "Not Found"）
```

**排查方法**：看失败响应的 `server` 头。
- `server: github.com` + 9B `Not Found` → 回源到了 github.com，但路径被改错
- `server: TencentEdgeOne` + 14B `404: Not Found` → 落到了站点规则（回源 raw）
- `server: Windows-Azure-Blob` → 正确（跟到了 release-assets）

**结论**：不能通过"删掉低优先级规则"来解决（02 是站点文件的唯一来源），
也不支持 `not in` 条件语法（实测报 `ConfigConditionSyntaxError`）。
唯一解是**在高优先级规则里显式覆盖那条动作**（即第 5 条恒等重写）。

### 坑 2：`DescribeL7AccRules` 的参数回显不可信

控制台里保存得好好的动作参数，API 读回来是 `null`：

```
控制台保存 → 行为验证生效（Content-Type 正确、取货 200）
DescribeL7AccRules → {"ModifyOriginParameters": null, "HostHeaderParameters": null, ...}
```

**判据一律看行为，不看 API 回显。** 差点因为"参数是空的"这个假象，
把本来正常的规则重建很多遍。

### 坑 3：`CreateL7AccRules` / `ModifyL7AccRule` 写入不稳定

- 同样的 payload，有时参数能存进去、有时不能（不稳定的，不是确定性规则）；
- `ModifyL7AccRule` 修改规则后会丢掉除第一个之外的动作参数；
- 批量创建时**数组靠后的规则优先级更高**（与直觉相反）；
- **`ModifyL7AccRulePriority` 完全无效**——新旧版 tccli（3.1.170.1 / 3.1.195.1）都试过，
  返回 `RequestId` 成功，但 60 秒后顺序纹丝不动。

**结论**：**规则改动一律走控制台粘贴 JSON，不要用 tccli 写。**
tccli 只用来读（`DescribeL7AccRules`）和 purge 缓存。

### 附：EdgeOne Makers 的缓存无法主动 purge

`CreatePurgeTask` 对 `isui.ren` 报 `DomainNotFound`（它不是加速域名，是 Pages 项目）。
改配置后要等自然过期，实测约 **120 秒**才看到变化：

```
[60s]  200|611      ← 还是旧内容
[120s] 404|8860     ← 新配置生效
```

---

## 3. 验证清单（改完必须全过）

```bash
# ① 取货：冷回源必须成功（先 purge 制造 MISS）
tccli teo CreatePurgeTask --ZoneId zone-3taqnjqfr1zo --Type purge_url \
  --Targets '["https://static.isui.ren/ArchivalEra/LLVM-wasm/releases/download/v0.1.6/toolchain__driver__toolchain.mjs.identity.000"]'
sleep 35
curl -s -D- -o /dev/null \
  "https://static.isui.ren/ArchivalEra/LLVM-wasm/releases/download/v0.1.6/toolchain__driver__toolchain.mjs.identity.000" | head -5
#   ⇒ 200 + server: Windows-Azure-Blob + eo-cache-status: MISS

# ② 站点文件（02 规则仍在工作）
for p in / /index.html /catalogue.json /files.json /LICENSE /contract/2026-10-30-release-contract-v4.md; do
  curl -s -o /dev/null -w "$p %{http_code} %{content_type}\n" "https://static.isui.ren$p"
done
#   ⇒ 全 200，Content-Type 正确（html/json/markdown/plain）

# ③ 404 不缓存
curl -s -D- -o /dev/null "https://static.isui.ren/ArchivalEra/LLVM-wasm/releases/download/v0.1.6/nope-xyz.zstd.000" | grep -i 'eo-cache-status'
#   ⇒ MISS（不是 HIT）

# ④ 主站零回归
for p in /heart/ /repo/Octave/ /Bahnhof/; do
  curl -s -o /dev/null -w "$p %{http_code}\n" "https://isui.ren$p"
done
#   ⇒ 全 200；isui.ren/nope-xyz ⇒ 真 404
```

### 2026-11-04 实测结果（本配置下）

```
取货   manifest.json                     200 / 28602B
       toolchain__LICENSE.zstd.000       200 / 11215B
       toolchain__clang.wasm.zstd.000    200 / 1333243B
       toolchain__sysroot-headers...002  200 / 5242880B
       冷取（purge 后）                  200 MISS + Windows-Azure-Blob ✓

端到端 manifest → 分片 11215B sha=c7e4de27…（一致）
                → zstd 解压 → 34523B sha=8486a10c…（= entry 声明）

站点   / / index.html / catalogue.json / files.json / LICENSE / contract/*.md  全 200
主站   / 301（→/heart/）、/heart/ /repo/Octave/ /Bahnhof/ 全 200
404    不存在的 asset → 404 + MISS（不缓存）；isui.ren/nope → 真 404
```

---

## 4. 一个曾经的误判（记录以免重犯）

排查早期我把失败归因为"EO 节点在跑旧配置"，因为成功与失败打到了不同的 `x-served-by`。
**这个判断是错的**——后来对照 `eo-log-uuid` 发现，成功与失败其实**同一个 PoP**
（`cache-iad-kcgs7200136-IAD`），是同节点交替。

`x-served-by` 只在拿到 Blob 字节时才透传，失败时根本没到那层 ——
**把"没有该头"误读成了"不同节点"**。

**正确判据**：`eo-cache-status`（HIT/200 与 MISS/404 100% 对应）。
