#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
favicon_proxy.py —— 零依赖 favicon 白手套代理（VPS 侧）

架构（用户钦定）：
    浏览器 ──→ Cloudflare（缓存 /favicon*）──→ VPS（本服务抓取 favicon）──→ 目标站

端点（两个路径都可用，供 CF 缓存规则与前端路由自由选择）：
    GET /favicon?url=<域名或完整URL>
    GET /api/favicon?url=<域名或完整URL>

仅使用 Python 3 标准库（http.server / urllib / ipaddress / ssl / http.client），
零第三方依赖，开箱即跑。

启动：
    python3 favicon_proxy.py              # 默认监听 0.0.0.0:8787
    PORT=9000 python3 favicon_proxy.py    # env PORT 覆盖端口

⚠️⚠️ 安全红线（SSRF 防护，禁止移除/绕过）⚠️⚠️
    本服务会代表用户去抓取任意域名，必须对目标做 SSRF 检查：
      · _validate_url        —— URL 形状检查（scheme / 端口 / userinfo / hostname）
      · _resolve_and_check   —— DNS 解析后逐 IP 检查（内网/环回/链路本地/保留/组播/CGNAT 全拒）
      · _ip_is_unsafe        —— 具体 IP 段判定
      · _SafeRedirectHandler —— 重定向（302/301…）目标同样二次校验，防 DNS rebinding 式绕过
"""

import hashlib
import http.client
import ipaddress
import json
import os
import re
import socket
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from glob import glob
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# ---------------------------------------------------------------- 常量与配置

HOST = os.environ.get("FAVICON_HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8787"))
CACHE_DIR = os.environ.get("FAVICON_CACHE_DIR", "/tmp/favicon-cache")

CONNECT_TIMEOUT = 5                     # 连接 + TLS 握手超时（秒）
READ_TIMEOUT = 8                        # 读取超时（秒）
FAVICON_MAX_BYTES = 8 * 1024 * 1024     # 单个图片响应上限 8MB
PAGE_MAX_BYTES = 2 * 1024 * 1024        # 主页 HTML 上限 2MB（link 标签都在前面）

USER_AGENT = "Mozilla/5.0 (compatible; FaviconProxy/1.0; +https://isui.ren)"
CACHE_CONTROL = "public, max-age=86400"  # CF 按此 + 缓存规则把结果缓存 1 天

# 扩展名 → Content-Type（缓存命中时按文件名反推类型）
_EXT_TO_CT = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "ico": "image/x-icon",
    "svg": "image/svg+xml",
    "webp": "image/webp",
    "avif": "image/avif",
    "bmp": "image/bmp",
    "bin": "application/octet-stream",
}
_CT_TO_EXT = {v: k for k, v in _EXT_TO_CT.items()}
_CT_TO_EXT["image/vnd.microsoft.icon"] = "ico"

_IMAGE_EXTS = frozenset(_EXT_TO_CT.keys())

# ---------------------------------------------------------------- 正则（link rel=icon）

_RE_LINK_TAG = re.compile(r"<link\b[^>]*>", re.IGNORECASE | re.DOTALL)
# rel 属性值含 "icon"（兼容 icon / shortcut icon / apple-touch-icon，引号大小写随意）
_RE_REL_ICON = re.compile(r'\brel\s*=\s*["\']?[^"\'>]*icon[^"\'>]*["\']?', re.IGNORECASE)
# href 属性（引号可有可无，值内不含空格/引号/尖括号）
_RE_HREF = re.compile(r'\bhref\s*=\s*["\']?([^"\'>\s]+)["\']?', re.IGNORECASE)


def _find_icon_href(html, base_url):
    """在主页 HTML 中找第一个 rel=icon 的 link 标签的 href，转绝对 URL。找不到返回 None。"""
    for tag in _RE_LINK_TAG.findall(html):
        if not _RE_REL_ICON.search(tag):
            continue
        m = _RE_HREF.search(tag)
        if m:
            href = m.group(1).strip()
            if href:
                return urllib.parse.urljoin(base_url, href)
    return None


# ---------------------------------------------------------------- 异常

class ProxyError(Exception):
    """带 HTTP 状态码的业务错误。"""

    def __init__(self, status, message):
        super().__init__(message)
        self.status = status
        self.message = message


class FetchError(Exception):
    """上游抓取失败（超时/连接失败/非图片/HTTP 错误等）。"""


# ---------------------------------------------------------------- ⚠️ SSRF 防护

def _ip_is_unsafe(ip):
    """判定 IP 是否不可作为回源目标（SSRF 黑名单）。

    组合 is_private / is_loopback / is_link_local / is_reserved / is_multicast /
    is_unspecified 逐项检查，另手动补 100.64.0.0/10（运营商级 NAT：旧版 ipaddress
    的 is_private 不覆盖它）。IPv6 的 is_private 在 Python 3.11 才加入，老版本
    退化为手动判断 ULA fc00::/7。命中任一 → 不安全。
    """
    if (ip.is_loopback or ip.is_link_local or ip.is_multicast
            or ip.is_reserved or ip.is_unspecified):
        return True
    is_private = getattr(ip, "is_private", None)
    if is_private is None:  # Python < 3.11 的 IPv6Address 没有 is_private
        is_private = ip.version == 6 and (ip.packed[0] & 0xFE) == 0xFC  # fc00::/7 ULA
    if is_private:
        return True
    if ip.version == 4 and ip in ipaddress.ip_network("100.64.0.0/10"):
        return True  # CGNAT 共享地址段，旧版 ipaddress 视其为 global，必须手动排除
    return False


def _resolve_and_check(host):
    """解析 host 的全部 A/AAAA 记录并逐一做 SSRF 检查。

    ⚠️ 保守策略：任一解析结果 IP 不安全 → 整体拒绝（防止多地址混用绕过校验）。
    """
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        raise ProxyError(400, "dns resolution failed") from None
    ips = []
    for family, _st, _pr, _cn, sockaddr in infos:
        raw = sockaddr[0]
        if "%" in raw:                      # IPv6 scope zone，剥掉
            raw = raw.split("%", 1)[0]
        try:
            ip = ipaddress.ip_address(raw)
        except ValueError:
            continue
        if _ip_is_unsafe(ip):
            raise ProxyError(403, f"target resolves to non-public address {ip} (SSRF blocked)")
        ips.append(ip)
    if not ips:
        raise ProxyError(400, "no usable address for host")
    return ips


def _validate_url(raw):
    """校验并规范化目标 URL。

    ⚠️ SSRF 防护核心入口：scheme 仅 http/https；拒绝 userinfo（user:pass@）；
    端口仅 80/443；hostname 必填；随后 DNS 解析逐 IP 检查。违规抛 ProxyError。
    """
    url = (raw or "").strip()
    if not url:
        raise ProxyError(400, "missing url parameter")
    if "://" not in url:                    # 裸域名 → 补 https://
        url = "https://" + url
    try:
        p = urllib.parse.urlsplit(url)
    except ValueError:
        raise ProxyError(400, "invalid URL") from None

    scheme = p.scheme.lower()
    if scheme not in ("http", "https"):
        raise ProxyError(400, "scheme must be http or https")
    if p.username is not None or p.password is not None:
        raise ProxyError(400, "url must not contain userinfo (user:pass@)")
    try:
        port = p.port
    except ValueError:
        raise ProxyError(400, "invalid port") from None
    if port is not None and port not in (80, 443):
        raise ProxyError(400, "port must be 80 or 443")
    if port is None:
        port = 443 if scheme == "https" else 80

    host = p.hostname
    if not host:
        raise ProxyError(400, "hostname is required")
    try:
        host = host.encode("idna").decode("ascii")  # IDN → punycode
    except (UnicodeError, ValueError):
        raise ProxyError(400, "invalid hostname") from None
    if not re.fullmatch(r"[A-Za-z0-9.\-:]+", host):  # 域名或 IPv6 字面量
        raise ProxyError(400, "invalid hostname")

    ips = _resolve_and_check(host)          # ⚠️ SSRF：逐 IP 校验
    return scheme, host, port, ips


class _SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    """重定向前的 SSRF 二次校验。

    目标站可能返回 302 到内网地址（经典 SSRF 绕过）。urllib 默认会跟随重定向，
    这里在每次重定向前对 newurl 重新做完整校验，违规则拒绝跟随。
    """

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        newurl = urllib.parse.urljoin(req.full_url, newurl)
        try:
            _validate_url(newurl)
        except ProxyError as e:
            raise urllib.error.URLError(
                f"redirect target blocked: {newurl} ({e.message})"
            ) from None
        return super().redirect_request(req, fp, code, msg, headers, newurl)


# ---------------------------------------------------------------- 超时控制（连接 5s + 读 8s）

class _TimedHTTPConnection(http.client.HTTPConnection):
    def connect(self):
        super().connect()               # 连接阶段受 self.timeout(=5s) 约束
        self.sock.settimeout(READ_TIMEOUT)  # 读阶段改用 8s


class _TimedHTTPSConnection(http.client.HTTPSConnection):
    def connect(self):
        super().connect()               # 连接 + TLS 握手 5s
        self.sock.settimeout(READ_TIMEOUT)  # 读阶段 8s


class _TimedHTTPHandler(urllib.request.HTTPHandler):
    def http_open(self, req):
        return self.do_open(_TimedHTTPConnection, req, timeout=CONNECT_TIMEOUT)


class _TimedHTTPSHandler(urllib.request.HTTPSHandler):
    def __init__(self):
        super().__init__(context=ssl.create_default_context())

    def https_open(self, req):
        return self.do_open(_TimedHTTPSConnection, req,
                            timeout=CONNECT_TIMEOUT, context=self._context)


_OPENER = urllib.request.build_opener(
    _TimedHTTPHandler, _TimedHTTPSHandler, _SafeRedirectHandler
)


# ---------------------------------------------------------------- 抓取

def _fetch(url, max_bytes):
    """抓取 url，返回 (data, content_type, final_url)。任何失败抛 FetchError。"""
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "image/avif,image/webp,image/*,*/*;q=0.5",
            "Accept-Language": "*",
            # 要求未压缩响应：urllib 不自动解压 gzip，favicon 字节必须原样返回
            "Accept-Encoding": "identity",
        },
    )
    try:
        resp = _OPENER.open(req)
    except urllib.error.HTTPError as e:
        raise FetchError(f"http {e.code}") from None
    except (urllib.error.URLError, OSError, ssl.SSLError, ValueError) as e:
        raise FetchError(str(e) or e.__class__.__name__) from None
    try:
        data = resp.read(max_bytes + 1)
    except (OSError, ssl.SSLError) as e:
        raise FetchError("read timeout/interrupted") from None
    if len(data) > max_bytes:
        raise FetchError(f"response exceeds {max_bytes} bytes limit")
    return data, resp.headers.get("Content-Type", ""), resp.geturl()


def _looks_like_image(content_type, final_url):
    """响应必须是图片：Content-Type 为 image/*，或最终 URL 扩展名是常见图片后缀。"""
    base = (content_type or "").split(";", 1)[0].strip().lower()
    if base.startswith("image/"):
        return True
    ext = os.path.splitext(urllib.parse.urlparse(final_url).path)[1].lower().lstrip(".")
    return ext in _IMAGE_EXTS


def _ext_of(content_type, final_url):
    """从 Content-Type 或最终 URL 扩展名推断缓存文件扩展名。"""
    base = (content_type or "").split(";", 1)[0].strip().lower()
    if base in _CT_TO_EXT:
        return _CT_TO_EXT[base]
    ext = os.path.splitext(urllib.parse.urlparse(final_url).path)[1].lower().lstrip(".")
    if ext in _EXT_TO_CT:
        return ext
    return "bin"


def _fetch_favicon(scheme, host):
    """浏览器式抓取顺序：favicon.ico → 主页 link rel=icon。

    协议：优先按用户给的 scheme（裸域名默认 https）；scheme 为 https 时，若该步骤
    失败再补试一次 http（有的旧站只提供 http）。
    """
    base = f"{scheme}://{host}"

    # a. /favicon.ico
    candidates = [f"{base}/favicon.ico"]
    if scheme == "https":
        candidates.append(f"http://{host}/favicon.ico")
    for url in candidates:
        try:
            data, ct, final = _fetch(url, FAVICON_MAX_BYTES)
        except FetchError:
            continue
        if not _looks_like_image(ct, final):
            continue
        return data, ct, final

    # b. 主页 <link rel="icon" href=...>
    pages = [f"{base}/"]
    if scheme == "https":
        pages.append(f"http://{host}/")
    for page in pages:
        try:
            html, _ct, _final = _fetch(page, PAGE_MAX_BYTES)
        except FetchError:
            continue
        if isinstance(html, bytes):           # 主页是字节流，先解码成 str
            html = html.decode("utf-8", errors="replace")
        icon_url = _find_icon_href(html, page)
        if not icon_url:
            continue
        try:
            data, ct, final = _fetch(icon_url, FAVICON_MAX_BYTES)
        except FetchError:
            continue
        if not _looks_like_image(ct, final):
            continue
        return data, ct, final

    raise FetchError("no favicon found")


# ---------------------------------------------------------------- 本地磁盘缓存

try:
    import fcntl
except ImportError:                      # Windows 等无 fcntl 平台：跳过加锁
    fcntl = None

_LOCK_PATH = os.path.join(CACHE_DIR, ".lock")


def _ensure_cache_dir():
    os.makedirs(CACHE_DIR, exist_ok=True)


def _atomic_write(path, data):
    """临时文件 + 原子 rename，避免并发读到半写文件。"""
    tmp = f"{path}.tmp.{os.getpid()}.{int(time.time() * 1000) % 1000000}"
    with open(tmp, "wb") as f:
        f.write(data)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


def _write_cache(key, data, content_type, final_url):
    """写缓存（文件锁串行化；favicon 场景下即使丢锁/竞争也不致命，失败静默忽略）。"""
    try:
        _ensure_cache_dir()
        path = os.path.join(CACHE_DIR, f"{key}.{_ext_of(content_type, final_url)}")
        if fcntl:
            with open(_LOCK_PATH, "a+") as lf:
                fcntl.flock(lf.fileno(), fcntl.LOCK_EX)
                try:
                    _atomic_write(path, data)
                finally:
                    fcntl.flock(lf.fileno(), fcntl.LOCK_UN)
        else:
            _atomic_write(path, data)
    except OSError:
        pass                               # 缓存写失败不致命


def _read_cache(key):
    """命中返回 (data, content_type)；未命中返回 None。文件名为 <md5>.<ext>。"""
    try:
        hits = glob(os.path.join(CACHE_DIR, key + ".*"))
    except OSError:
        return None
    for path in hits:
        if path.endswith(".tmp"):
            continue
        ext = path.rsplit(".", 1)[1]
        if ext not in _EXT_TO_CT:
            continue
        try:
            with open(path, "rb") as f:
                data = f.read()
        except OSError:
            continue
        if data:
            return data, _EXT_TO_CT[ext]
    return None


# ---------------------------------------------------------------- HTTP 服务

class Handler(BaseHTTPRequestHandler):
    server_version = "FaviconProxy/1.0"
    protocol_version = "HTTP/1.1"        # keep-alive，减少 CF 回源握手

    # ---- 入口

    def do_GET(self):
        self._start = time.monotonic()
        try:
            self._route()
        except (ConnectionError, BrokenPipeError):
            pass
        except Exception:
            try:
                self._send_json(500, {"error": "internal error"})
            except Exception:
                pass
            self._access_log(500, 0, "internal error")

    def _route(self):
        parts = urllib.parse.urlsplit(self.path)
        path = parts.path.rstrip("/") or "/"
        if path not in ("/favicon", "/api/favicon"):
            self._send_json(404, {"error": "not found"})
            self._access_log(404, 0, f"path={path}")
            return

        raw_url = (urllib.parse.parse_qs(parts.query).get("url") or [""])[0].strip()
        try:
            scheme, host, _port, _ips = _validate_url(raw_url)   # ⚠️ SSRF
        except ProxyError as e:
            self._send_json(e.status, {"error": e.message})
            self._access_log(e.status, 0, f"url={raw_url[:120]!r} reason={e.message}")
            return

        key = hashlib.md5(host.encode("ascii")).hexdigest()

        cached = _read_cache(key)
        if cached:
            data, content_type = cached
            self._send_image(data, content_type, cache="HIT")
            self._access_log(200, len(data), f"host={host} cache=HIT")
            return

        try:
            data, content_type, final_url = _fetch_favicon(scheme, host)
        except FetchError as e:
            self._send_json(404, {"error": "favicon not found", "host": host})
            self._access_log(404, 0, f"host={host} reason={e}")
            return

        _write_cache(key, data, content_type, final_url)
        self._send_image(data, content_type, cache="MISS")
        self._access_log(200, len(data), f"host={host} cache=MISS")

    # ---- 响应

    def _send_image(self, data, content_type, cache):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", CACHE_CONTROL)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("X-Cache", cache)
        self.end_headers()
        self.wfile.write(data)

    def _send_json(self, status, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    # ---- 日志（access log 一行；CF 回源时优先用 X-Forwarded-For 记录真实客户端）

    def _access_log(self, status, nbytes, extra=""):
        ms = (time.monotonic() - self._start) * 1000
        ip = self.client_address[0] if self.client_address else "-"
        xff = self.headers.get("X-Forwarded-For", "")
        if xff:
            ip = xff.split(",")[0].strip()
        path = self.path if len(self.path) <= 300 else self.path[:300] + "..."
        print(f'[{time.strftime("%Y-%m-%d %H:%M:%S")}] {ip} '
              f'"{self.command} {path}" {status} {nbytes}B {ms:.0f}ms {extra}',
              flush=True)

    def log_message(self, fmt, *args):
        """关掉 BaseHTTPRequestHandler 默认的 stderr 日志，统一走 access log。"""


def main():
    _ensure_cache_dir()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"[favicon-proxy] listening on http://{HOST}:{PORT} (cache: {CACHE_DIR})",
          flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
