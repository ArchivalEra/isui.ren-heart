# favicon-proxy —— 零依赖 favicon 白手套代理

给 VPS 当**白手套**用的 favicon 抓取服务：浏览器不直接访问目标站，而是走
`浏览器 → Cloudflare → VPS → 目标站` 链路，由 Cloudflare 把结果缓存起来。

**零第三方依赖**——只用 Python 3 标准库（`http.server` / `urllib` / `ipaddress` / `ssl` 等），
开箱即跑，无 `pip install`。

## 架构

```
浏览器 ──→ Cloudflare（api 子域，橙云代理 + 缓存 /favicon*）──→ VPS:8787（本服务）──→ 目标站
                 ↑ CF 缓存命中即回，VPS 零负载                    └─ 本地磁盘缓存（/tmp/favicon-cache）
```

- Cloudflare 负责国内/海外接入与**边缘缓存**（Cache Everything + Edge Cache TTL 1 天）；
- VPS 只做白手套：解析 URL → SSRF 检查 → 抓取 favicon → 写本地缓存；
- 浏览器 `<img src="/api/favicon?url=...">` 拿到的图片被 CF 缓存，重复请求不落源站。

## 文件

| 文件 | 说明 |
|------|------|
| `favicon_proxy.py` | 服务本体（单文件，标准库 only） |
| `README.md` | 本文件（部署说明） |

## 快速开始（本地验证）

```bash
cd scripts/favicon-proxy
python3 favicon_proxy.py            # 默认 0.0.0.0:8787
# 另一终端：
curl -s 'http://127.0.0.1:8787/favicon?url=github.com' -o favicon.ico -w '%{http_code} %{content_type}\n'
curl -s 'http://127.0.0.1:8787/api/favicon?url=https://tayori-official.com/' -o /dev/null -w '%{http_code}\n'
```

第二次请求同一域名会命中本地缓存（日志带 `cache=HIT`）。

## 部署到 VPS（systemd）

```bash
# 1. 上传（示例路径 /opt/favicon-proxy，权限建议独立系统用户）
sudo mkdir -p /opt/favicon-proxy
sudo cp favicon_proxy.py /opt/favicon-proxy/
sudo useradd -r -s /usr/sbin/nologin favicon || true
sudo chown -R favicon:favicon /opt/favicon-proxy

# 2. 安装 systemd 单元
sudo tee /etc/systemd/system/favicon-proxy.service > /dev/null <<'EOF'
[Unit]
Description=Favicon proxy (zero-dependency Python service)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=favicon
Group=favicon
WorkingDirectory=/opt/favicon-proxy
ExecStart=/usr/bin/python3 /opt/favicon-proxy/favicon_proxy.py
Restart=on-failure
RestartSec=3
# 端口与环境变量（默认 8787，可用 PORT 覆盖）
Environment=PORT=8787
# 可选：缓存目录默认 /tmp/favicon-cache（PrivateTmp 下重启即清空，favicon 场景可接受）
# Environment=FAVICON_CACHE_DIR=/var/cache/favicon-proxy
#   —— 若改用 /var/cache，先执行：sudo install -d -o favicon -g favicon /var/cache/favicon-proxy
# 可选：监听地址默认 0.0.0.0（被防火墙兜住，仅允许 CF 回源）
# Environment=FAVICON_HOST=0.0.0.0
# 加固
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now favicon-proxy
sudo systemctl status favicon-proxy

# 3. 本机自测
curl -s 'http://127.0.0.1:8787/favicon?url=example.com' -o /dev/null -w '%{http_code}\n'
# 4.（建议）防火墙只放行 8787 给 Cloudflare 回源 IP 段
# https://www.cloudflare.com/ips/
```

## Cloudflare 配置

1. **DNS**：`api` 子域 → A 记录指向 VPS 公网 IP，**打开橙色云（代理）**；
2. **SSL/TLS 模式**：`Flexible`（CF → 源站走明文 8787）即可；若 VPS 上有证书可用 `Full`；
3. **缓存规则**（免费版 Cache Rules，或等效 Page Rule）：
   - 匹配表达式：`(http.host eq "api.isui.ren" and starts_with(http.request.uri.path, "/favicon"))`
   - **Cache eligibility**：`Eligible for cache`（即 Cache Everything）
   - **Edge TTL**：`Custom` → `1 day`
   - 查询字符串**保留**（默认）：`?url=` 不同域名各成缓存键，互不污染；
   - （可选）再加一条 Origin Cache Control 规则，或让本服务的
     `Cache-Control: public, max-age=86400` 与 Edge TTL 一致即可。

## 前端调用

本服务同时响应 `/favicon` 与 `/api/favicon`，与现有 `web-ui` 一致用后者：

```js
// 域名或完整 URL 都行（encodeURIComponent 必须，url 里不能带裸 & / #）
const faviconUrl = `/api/favicon?url=${encodeURIComponent(host)}`;

// 直接当图片用
<img src={faviconUrl} alt="" />

// 或 fetch 预取
fetch(`/api/favicon?url=${encodeURIComponent(host)}`)
  .then(r => r.ok ? r.blob() : null);
```

## 端点与行为

`GET /favicon?url=<域名|完整URL>`（或 `/api/favicon`）

- **url 参数**：支持裸域名（默认按 `https` 抓）、`http://`/`https://` 完整 URL；
- **抓取顺序（浏览器式）**：
  1. `https://<host>/favicon.ico`（用户显式给了 `http://` 则按 http；https 失败会补试一次 http）；
  2. 失败 → 抓主页 `<link rel="icon"/"shortcut icon" href=...>`（正则兼容大小写/引号/空格）→ 拼绝对 URL 抓取；
  3. 全部失败 → `404` + JSON `{"error":"favicon not found","host":"..."}`；
- **成功响应**：图片字节，`Content-Type` 取 `image/*` 透传（否则按扩展名猜），
  `Cache-Control: public, max-age=86400`，附 `X-Cache: HIT|MISS` 调试头；
- **超时**：连接（含 TLS 握手）5s + 读取 8s；重定向跟随，但每个重定向目标都重新过 SSRF 检查；
- **访问日志**：stdout 一行（systemd journal 可查），含时间/客户端 IP/路径/状态码/字节/耗时/`host=`/`cache=`。

### 响应头速查

| 场景 | 状态码 | Content-Type | Cache-Control |
|------|--------|--------------|---------------|
| 抓到 favicon（含缓存命中） | 200 | `image/*` | `public, max-age=86400` |
| 目标无 favicon / 抓取全部失败 | 404 | `application/json` | `no-store` |
| 参数缺失 / scheme 非 http(s) / 端口非 80/443 / 带 user:pass | 400 | `application/json` | `no-store` |
| SSRF 拦截（内网/环回/链路本地/保留段/组播/CGNAT） | 403 | `application/json` | `no-store` |

## 本地缓存

- 目录：`/tmp/favicon-cache`（`FAVICON_CACHE_DIR` 可覆盖），文件名 `<md5(hostname)>.<ext>`；
- 命中直接返回（带缓存头），写缓存用**文件锁**（`fcntl.flock`）串行 + 临时文件原子 rename；
- favicon 场景下即使竞争/锁丢失也不致命——写失败静默忽略；
- 清理：`rm -rf /tmp/favicon-cache`（系统重启自动清空，无需运维）。

## 安全：SSRF 防护（本服务核心红线）

`favicon_proxy.py` 对**每一个**目标（含重定向后的每一个 URL）强制检查：

1. **URL 形状**：仅 `http`/`https`；URL 不得含用户名/密码；端口仅 `80/443`；
2. **DNS 解析逐 IP 检查**：解析出的全部 A/AAAA 记录逐一用 `ipaddress` 判断，
   命中 `is_private` / `is_loopback` / `is_link_local` / `is_reserved` / `is_multicast` /
   `is_unspecified` 任一即拒绝（403）；另手动补查 `100.64.0.0/10`（CGNAT）与 IPv6 ULA `fc00::/7`
   （老版本 `ipaddress` 的 `is_private` 不覆盖这两段）；
3. **多地址保守策略**：任一解析结果不安全 → 整体拒绝，防止多 A 记录混用绕过；
4. **重定向二次校验**：目标站 302 到内网地址（经典 SSRF 绕过）时，`_SafeRedirectHandler`
   在跟随前对 newurl 重跑全套校验，违规直接丢弃。

可自测：

```bash
curl -s 'http://127.0.0.1:8787/favicon?url=http://127.0.0.1/'            # 403
curl -s 'http://127.0.0.1:8787/favicon?url=http://169.254.169.254/'      # 403（云元数据）
curl -s 'http://127.0.0.1:8787/favicon?url=http://10.0.0.1/'             # 403
curl -s 'http://127.0.0.1:8787/favicon?url=http://example.com:8080/'     # 400
curl -s 'http://127.0.0.1:8787/favicon?url=ftp://example.com/'           # 400
```

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `PORT` | `8787` | 监听端口 |
| `FAVICON_HOST` | `0.0.0.0` | 监听地址 |
| `FAVICON_CACHE_DIR` | `/tmp/favicon-cache` | 本地磁盘缓存目录 |
