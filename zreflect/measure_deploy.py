"""isui.ren-heart（边缘部署仓）的事实采集层。

⚠️ 本仓的 special shape：**main 分支 = 源码，deploy 分支 = 构建产物**。
Einfacht 只跟 main 跑（deploy 每次被孤儿重建，挂任何钩子都会在下次构建时消失）。

本仓要量的是**部署链的形状**——那些「改了就必须两边对」的耦合点：
  · 中间件的反代路由数（每条都是一个对外承诺）
  · site-root 的静态根文件（每个都是 EdgeOne 直接吐的东西）
  · Rust wasm crate 的源码规模
  · 构建脚本与站点根的形态一致性
"""

import os
import re

import sys as _sys

_sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gate import module_meta                               # noqa: E402
from ledger import fact                                    # noqa: E402

ROOT = os.getcwd()


def _lines(rel):
    """文件行数。读不到 -> -1。"""
    try:
        with open(os.path.join(ROOT, rel), encoding="utf-8", errors="replace") as fh:
            return sum(1 for _ in fh)
    except OSError:
        return -1


def _count_dir(rel, suffix=None):
    try:
        names = os.listdir(os.path.join(ROOT, rel))
    except OSError:
        return -1
    if suffix:
        return sum(1 for n in names if n.endswith(suffix))
    return sum(1 for n in names
               if not n.startswith(".") and os.path.isfile(os.path.join(ROOT, rel, n)))


def measure():
    facts = {}

    # ── 中间件行数（本仓最核心的单文件：所有反代与缓存契约都在这）───────────
    facts["middleware_lines"] = fact(
        _lines("site-root/middleware.js"),
        "wc -l < site-root/middleware.js",
        "site-root/middleware.js",
        "边缘中间件行数（反代 / 缓存 / COOP-COEP 全部契约在这个文件里）",
    )

    # ── 反代路由数：数 middleware 里的 url.pathname 分支 ──────────────────────
    n_routes = -1
    try:
        with open(os.path.join(ROOT, "site-root/middleware.js"), encoding="utf-8") as fh:
            src = fh.read()
        # 数**行**不是数出现次数：第 387 行有两个 ===（`/repo` 与 `/repo/`），
        # 数出现次数会得 6 而 grep -c 数行得 5 —— measure 与 cmd 语义分叉，
        # 复跑闸门当场抓住。行数才符合「路由分支」的直觉。
        n_routes = len([ln for ln in src.splitlines()
                        if re.search(r'url\.pathname\s*===?\s*"', ln)])
    except OSError:
        pass
    facts["middleware_routes"] = fact(
        n_routes,
        ("grep -cE 'url\\.pathname[[:space:]]*===?[[:space:]]*\"' site-root/middleware.js"),
        "site-root/middleware.js",
        "按 pathname 精确匹配的路由分支数（每个都是对外承诺的一个端点）",
    )

    # ── site-root 静态文件数（EdgeOne 直接吐的根级资产）──────────────────────
    facts["site_root_files"] = fact(
        _count_dir("site-root"),
        "find site-root -maxdepth 1 -type f ! -name '.*' | wc -l",
        "site-root/",
        "站点根级文件数（index/404/logo/edgeone.json 等，EdgeOne 直出）",
    )

    # ── edge-functions 数 ──────────────────────────────────────────────────
    ef = os.path.join(ROOT, "site-root", "edge-functions")
    n_ef = -1
    if os.path.isdir(ef):
        n_ef = sum(1 for root, dirs, files in os.walk(ef) for f in files if f.endswith(".js"))
    facts["edge_functions"] = fact(
        n_ef,
        "find site-root/edge-functions -name '*.js' 2>/dev/null | wc -l",
        "site-root/edge-functions/",
        "边缘函数文件数（独立于 middleware 的函数端点）",
    )

    # ── Rust wasm 源码文件数 ────────────────────────────────────────────────
    n_rs = 0
    ok = True
    try:
        for root, dirs, files in os.walk(os.path.join(ROOT, "web-rust")):
            dirs[:] = [d for d in dirs if d not in ("target", ".git")]
            n_rs += sum(1 for f in files if f.endswith(".rs"))
    except OSError:
        ok = False
    facts["rust_sources"] = fact(
        n_rs if ok else -1,
        "find web-rust -name '*.rs' -not -path '*/target/*' | wc -l",
        "web-rust/",
        "Rust 源码文件数（wasm 动画引擎）",
    )

    return facts


MODULE = module_meta(
    "本仓数据层",
    "量边缘部署链形状：中间件行数/路由数/静态根文件/边缘函数/Rust 源码",
    selftest=False,
)
