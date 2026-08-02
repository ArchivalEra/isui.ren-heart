# 部署：根域分线路跳转（isui.ren → cn/global 的 /heart）

目标：访问 `isui.ren` 根域时：
- 国内用户 → 301 `https://cn.isui.ren/heart`
- 海外用户 → 301 `https://global.isui.ren/heart`

## 链路总览

```
用户 → isui.ren（dnspod 分线路解析）
  ├─ 国内线路 → CNAME → EdgeOne 接入点（CNAME 接入）→ 301 → cn.isui.ren/heart
  └─ 海外线路 → CNAME → CF for SaaS 端点 → 301 → global.isui.ren/heart
```

## 前置条件

- [ ] dnspod 账号（isui.ren NS 已在 dnspod）
- [ ] EdgeOne 国际版账号（edgeone.ai，Free Plan）
- [ ] Cloudflare 账号 + 至少一个 zone（如 flo.ccwu.cc，已托管）
- [ ] 子域 `cn.isui.ren` / `global.isui.ren` 后续接入 EdgeOne/CF（本文档只管根域跳转）

## 步骤

### 1. EdgeOne 侧（cn 线路）

1. EdgeOne 控制台 → 添加站点 `isui.ren` → 选 **CNAME 接入**（免费档支持，见官方 FAQ）
2. 拿到接入地址（形如 `xxx.edgeone.app`）与校验值
3. 配置重定向规则（规则引擎，Free 档 20 条规则内）：
   - 匹配：`Host == isui.ren` 且 `路径 == /`
   - 动作：301 → `https://cn.isui.ren/heart`
4. （备用方案）若规则引擎不支持重定向，用 Edge Function：
   ```js
   // edgeone-redirect.js — 备用：EdgeOne Edge Function 根域跳转
   export default {
     async fetch(request, env, ctx) {
       const url = new URL(request.url);
       if (url.hostname === 'isui.ren') {
         return Response.redirect('https://cn.isui.ren/heart', 301);
       }
       return new Response('ok');
     }
   }
   ```

### 2. Cloudflare 侧（global 线路）

1. 在已有 zone（如 `flo.ccwu.cc`）启用 **Cloudflare for SaaS**（Free 档含 100 个 custom hostname）
2. 添加 custom hostname：`isui.ren` → 指向 fallback origin（或 Worker）
3. 配置 **Redirect Rule**（或同 zone Worker）：
   - 匹配：`hostname == isui.ren` 且 `path == /`
   - 动作：301 → `https://global.isui.ren/heart`
4. （备用）Worker 代码：
   ```js
   // cf-redirect.js — 备用：CF Worker 根域跳转
   export default {
     async fetch(request) {
       const url = new URL(request.url);
       if (url.hostname === 'isui.ren' && url.pathname === '/') {
         return Response.redirect('https://global.isui.ren/heart', 301);
       }
       return new Response('ok');
     }
   }
   ```

### 3. dnspod 分线路解析

在 dnspod 为 `isui.ren` 添加 CNAME 记录，**启用分线路**：

| 线路 | 记录类型 | 值 | 优先级 |
|------|---------|-----|--------|
| 默认（海外） | CNAME | `isui.ren.cdn.cloudflare.net`（CF for SaaS 端点） | 低 |
| 国内（电信/联通/移动） | CNAME | EdgeOne 接入地址 | 高 |

分线路规则：国内运营商线路匹配到 EdgeOne；默认线路（含海外）走 CF。

### 4. 验证

```bash
# 海外视角（或挂海外代理）
curl -sI https://isui.ren | grep -i location   # 期望 global.isui.ren/heart
# 国内视角（或解析强制国内线路）
curl -sI --resolve isui.ren:443:<edgeone-ip> https://isui.ren | grep -i location  # 期望 cn.isui.ren/heart
```

## 注意事项

- EdgeOne CNAME 接入的校验（TXT/CNAME 记录）需在 dnspod 添加
- CF for SaaS 的 custom hostname 需完成证书签发（自动，需 DNS 校验记录通过）
- 301 缓存：浏览器会缓存 301，改跳转目标后需注意（或用 302 起步，稳定后换 301）
- 子域 `cn.isui.ren` / `global.isui.ren` 的 /heart 内容尚未部署，跳转目标 404 属预期
