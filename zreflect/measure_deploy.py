"""Fact collector for isui.ren-heart (edge deployment repo).

⚠️ special shape: main branch = sources, deploy branch = build output.
Einfacht follows main only (deploy is rebuilt as an orphan, so any hooks there vanish).

measured: the deploy-chain shape - coupling points that must agree on both sides:
  · middleware reverse-proxy route count (each is a public promise)
  · site-root static files (each is served by EdgeOne directly)
  · Rust wasm crate source size
  · build script / site-root shape agreement
"""

import os
import re
import sys as _sys

_sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from facts import fact  # noqa: E402
from gate import module_meta  # noqa: E402

ROOT = os.getcwd()


def _lines(rel):
    """line count. unreadable -> -1."""
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

    # middleware line count (core single file: all proxy/cache contracts)
    facts["middleware_lines"] = fact(
        _lines("site-root/middleware.js"),
        "wc -l < site-root/middleware.js",
        "site-root/middleware.js",
        "middleware.js line count (reverse proxy / cache / COOP-COEP contracts live here)",
    )

    # reverse-proxy route count: url.pathname branches in middleware
    n_routes = -1
    try:
        with open(os.path.join(ROOT, "site-root/middleware.js"), encoding="utf-8") as fh:
            src = fh.read()
        # Count LINES, not occurrences: one line can hold two === branches, so
        # counting occurrences diverges from the grep -c replay command and the
        # replay gate catches it. Lines match "route branch" intuition.
        n_routes = len([ln for ln in src.splitlines()
                        if re.search(r'url\.pathname\s*===?\s*"', ln)])
    except OSError:
        pass
    facts["middleware_routes"] = fact(
        n_routes,
        ("grep -cE 'url\\.pathname[[:space:]]*===?[[:space:]]*\"' site-root/middleware.js"),
        "site-root/middleware.js",
        "pathname-exact route branches (each is one public endpoint)",
    )

    # site-root top-level files (served by EdgeOne directly)
    facts["site_root_files"] = fact(
        _count_dir("site-root"),
        "find site-root -maxdepth 1 -type f ! -name '.*' | wc -l",
        "site-root/",
        "site-root top-level files (index/404/logo/edgeone.json, served by EdgeOne)",
    )

    # edge-functions count
    ef = os.path.join(ROOT, "site-root", "edge-functions")
    n_ef = -1
    if os.path.isdir(ef):
        n_ef = sum(1 for root, dirs, files in os.walk(ef) for f in files if f.endswith(".js"))
    facts["edge_functions"] = fact(
        n_ef,
        "find site-root/edge-functions -name '*.js' 2>/dev/null | wc -l",
        "site-root/edge-functions/",
        "edge function files (function endpoints separate from middleware)",
    )

    # Rust wasm source count
    n_rs = 0
    ok = True
    try:
        for _root, dirs, files in os.walk(os.path.join(ROOT, "web-rust")):
            dirs[:] = [d for d in dirs if d not in ("target", ".git")]
            n_rs += sum(1 for f in files if f.endswith(".rs"))
    except OSError:
        ok = False
    facts["rust_sources"] = fact(
        n_rs if ok else -1,
        "find web-rust -name '*.rs' -not -path '*/target/*' | wc -l",
        "web-rust/",
        "Rust source files (wasm animation engine)",
    )

    return facts


MODULE = module_meta(
    "this repo data layer",
    "deploy chain shape: middleware lines/routes/site-root files/edge functions/Rust sources",
    selftest=False,
)
