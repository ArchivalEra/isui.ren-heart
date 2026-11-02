#!/usr/bin/env python3
"""三条静态通道的**在线死链审计**：按 files.json 逐条比对内容指纹。

## 为什么需要它（两次真实事故）

1. **EdgeOne 对缺失路径返回 200 + 站点兜底页**（611B）。只看状态码的检查会
   全部通过 —— `https://isui.ren/static/LICENSE` 就这样静默死了很久。
2. **手写文件名列表必漂**。我原来的同步列表漏了 `LICENSE`（对方 11-01
   加的 AGPL 合规文件），两条镜像通道都少一个文件。

⇒ 判据必须是「**每个通道的内容 == 源产物**」，而不是「通道可达」或
「通道之间一致」（全都停在旧产物时，一致性同样成立）。

## 判据（fail-closed，任一条不过就非零）

- **P1 可达**：每个通道的 `<base>files.json` 拿得到（连不上 ⇒ 失败，不是跳过）
- **P2 无兜底页伪装**：先请求一个绝不存在的路径取兜底指纹；任何产物的字节
  等于该指纹 ⇒ 判死链（这就是 200 骗过状态码检查的形态）
- **P3 清单完整**：files.json 列出的每一条在该通道都存在且非空
- **P4 字节同源**：每条的 sha256 == 源产物（raw deploy 分支）里同名的 sha256

P4 是这条脚本比对方 H6 更严的地方：H6 只判「不是兜底页」，这条判「与源逐字节相同」。
两套独立实现交叉验证 —— 判据一致才真的可信。

## 用法

    python3 scripts/audit-static-channels.py                    # 审全部通道
    python3 scripts/audit-static-channels.py --selftest         # 自证（不联网）
    python3 scripts/audit-static-channels.py --channel edgeone  # 只审一条

## 通道清单与对方 `site/channels.json` 对齐（顺序、名字一致）。
"""

import argparse
import hashlib
import json
import os
import sys
import tempfile
import urllib.error
import urllib.request

# 源：对方仓 deploy 分支（唯一产地）。三条通道也都是从它来的。
SOURCE_BASE = "https://raw.githubusercontent.com/ArchivalEra/Static-Contract/deploy/"

# 三条通道。名字与对方 `site/channels.json` 一致，便于两边对账。
CHANNELS = [
    ("github-pages", "https://archivalera.github.io/Static-Contract"),
    ("cloudflare", "https://static.mango-mesa.ccwu.cc"),
    ("edgeone", "https://isui.ren/static"),
]

# 探针用的不存在路径（取兜底页指纹）。每次唯一，绕开任何缓存。
PROBE_NAME = "zzz-audit-probe-nonexistent-{nonce}.md"


# 必须带 User-Agent：Cloudflare 对 urllib 的默认 UA 直接 403，GitHub Pages
# 也会拒绝某些默认请求头。这不是通道坏，是探针缺了「能测到存在」的前置条件
# —— 本集群纪律第一条：测不到 ≠ 不存在，先证明探针能测到存在。
USER_AGENT = "shirone-static-audit/1 (+https://isui.ren)"


def fetch(url, timeout=30):
    """返回 (status, body_bytes)。**4xx/5xx 也返回**（不当异常抛）。

    为什么要这样：本脚本的判据里「404」是**正常结果**的一种 ——
      · P2 的探针期望 404（不可达才是故障）；
      · P3 的「通道没有这个文件」就该看见 404。
    早期版本用 urlopen 直接抛 HTTPError，于是探针的 404 被误判成
    「通道整体不可用」，两条好好的通道全报红 —— 那是**探针缺陷伪装成产品缺陷**，
    正是本集群纪律第一条禁的那类错。
    真正的网络层故障（DNS/连接/超时）才抛 URLError。
    """
    req = urllib.request.Request(
        url,
        headers={
            "Accept-Encoding": "identity",  # 要原始字节，别让 CDN 压一层
            "User-Agent": USER_AGENT,
            "Accept": "*/*",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        # HTTP 层拿到了响应，只是状态码非 2xx —— 这是有效观测，不是故障
        return e.code, e.read() if hasattr(e, "read") else b""


def sha(b):
    return hashlib.sha256(b).hexdigest()


def audit_channel(name, base, nonce, source_doc=None):
    """审一条通道。返回 (problems, checked_count)。

    problems 是字符串列表；空 = 通过。
    任何「连不上」都算问题 —— 「它没问题」在没有证据时不是结论。
    """
    problems = []

    # P1：files.json 必须拿得到
    try:
        status, body = fetch(base + "/files.json")
    except (urllib.error.URLError, OSError) as e:
        return (["P1 files.json 不可达: %s" % e], 0)
    if status != 200:
        return (["P1 files.json HTTP %d" % status], 0)
    try:
        doc = json.loads(body)
        files = doc.get("files") or []
    except ValueError:
        return (["P1 files.json 不是合法 JSON"], 0)
    if not files:
        return (["P1 files.json 的 files 为空"], 0)

    # P2 基线：先取该通道的兜底页指纹
    probe = PROBE_NAME.format(nonce=nonce)
    try:
        pst, pbody = fetch("%s/%s" % (base, probe))
    except (urllib.error.URLError, OSError) as e:
        # 只有网络层故障才是「通道不可达」。404 是探针的正常结果。
        return (["P1 通道网络不可达（探针 %s: %s）" % (probe, e)], 0)
    # 200 ⇒ 这条通道会用「兜底页」响应不存在的路径，记下它的指纹；
    # 404 ⇒ 这条通道诚实地报 404，没有兜底页可伪装，fallback 留 None。
    fallback = sha(pbody) if (pst == 200 and pbody) else None

    checked = 0
    for rel in files:
        checked += 1
        try:
            st, body = fetch("%s/%s" % (base, rel))
        except (urllib.error.URLError, OSError) as e:
            problems.append("P1 %s 不可达: %s" % (rel, e))
            continue
        if st != 200:
            problems.append("P3 %s HTTP %d" % (rel, st))
            continue
        if not body:
            problems.append("P3 %s 空体" % rel)
            continue
        if fallback and sha(body) == fallback:
            # ★ 这是本脚本的核心判据：200 但命中的是兜底页
            problems.append("P2 %s 返回兜底页（200 伪装）" % rel)
            continue
        # P4：与源产物逐字节相同
        if source_doc is not None:
            want = source_doc.get(rel)
            if want is None:
                problems.append("P4 %s 在源产物里不存在（清单与源对不上）" % rel)
            elif sha(body) != want:
                problems.append(
                    "P4 %s 内容与源不符（通道 %s ≠ 源 %s）" % (rel, sha(body)[:12], want[:12])
                )

    return (problems, checked)


def build_source_doc(nonce):
    """取源产物（raw deploy 分支）的 {rel: sha256}，供 P4 用。拿不到 ⇒ 抛错。"""
    _, body = fetch(SOURCE_BASE + "files.json")
    files = json.loads(body).get("files") or []
    if not files:
        raise SystemExit("FATAL: 源 files.json 的 files 为空")
    doc = {}
    for rel in files:
        _, b = fetch(SOURCE_BASE + rel)
        doc[rel] = sha(b)
    return doc


def selftest():
    ok = fail = 0

    def check(name, cond, detail=""):
        nonlocal ok, fail
        if cond:
            print("PASS | %s" % name)
            ok += 1
        else:
            print("FAIL | %s %s" % (name, detail))
            fail += 1

    # 用猴子补丁替换 fetch，构造各种坏形态
    import builtins

    def with_stub(stub, fn):
        global fetch
        orig = fetch
        fetch = stub
        try:
            return fn()
        finally:
            fetch = orig

    def mk(channel_files, fallback_body, listed=None):
        """造一个假通道。channel_files = {rel: bytes}；listed = 清单里声明的
        文件名（默认等于 channel_files 的键，传别的值可造「清单有、实际缺」）。"""

        def stub(url, timeout=30):
            # 探针：返回兜底页
            if "zzz-audit-probe" in url:
                return (200, fallback_body)
            base, rel = url.rsplit("/", 1) if "/" in url else (url, "")
            if rel == "files.json":
                names = listed if listed is not None else sorted(channel_files)
                return (200, json.dumps({"files": names}).encode())
            if rel in channel_files:
                return (200, channel_files[rel])
            # 缺失 ⇒ 404（fetch 现在把 4xx 当有效观测返回，不抛异常）
            return (404, b"")

        return stub

    # ① 全好
    good = {"LICENSE": b"AGPL" * 100, "index.html": b"<html>x</html>"}
    src = {k: sha(v) for k, v in good.items()}
    fb = b"fallback-page"
    p, n = with_stub(mk(good, fb, src), lambda: audit_channel("t", "http://x", "1", src))
    check("正常：全部对齐 ⇒ 不报", p == [], p)

    # ② 兜底页伪装（本事故形状）
    bad = {"LICENSE": fb, "index.html": good["index.html"]}
    p, n = with_stub(mk(bad, fb, src), lambda: audit_channel("t", "http://x", "2", src))
    check("★ LICENSE 返回兜底页 ⇒ 必报", any("兜底页" in x for x in p), p)

    # ③ 缺文件：清单声明两个，通道只有 index.html
    missing = {"index.html": good["index.html"]}
    p, n = with_stub(
        mk(missing, fb, listed=["index.html", "LICENSE"]),
        lambda: audit_channel("t", "http://x", "3", src),
    )
    check("★ 清单里的文件通道没有 ⇒ 必报", any("P3" in x or "P1" in x for x in p), p)

    # ④ 内容与源不符（通道停在旧构建）
    stale = {"LICENSE": b"old-license", "index.html": good["index.html"]}
    p, n = with_stub(mk(stale, fb, src), lambda: audit_channel("t", "http://x", "4", src))
    check("★ 内容与源不符 ⇒ 必报（旧构建）", any("P4" in x for x in p), p)

    # ⑤ 通道不可达
    def dead(url, timeout=30):
        raise urllib.error.URLError("connection refused")

    p, n = with_stub(dead, lambda: audit_channel("t", "http://x", "5", src))
    check("★ 不可达 ⇒ 必报，不许当跳过", p != [], p)

    # ⑥ 空清单
    def empty_manifest(url, timeout=30):
        return (200, json.dumps({"files": []}).encode())

    p, n = with_stub(empty_manifest, lambda: audit_channel("t", "http://x", "6", src))
    check("空清单 ⇒ 必报", p != [], p)

    print("=== %d PASS / %d FAIL ===" % (ok, fail))
    return 0 if fail == 0 else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--channel", help="只审某一条（名字见 CHANNELS）")
    ap.add_argument("--no-source", action="store_true", help="跳过 P4（不取源产物）")
    args = ap.parse_args()

    if args.selftest:
        return selftest()

    nonce = str(int(__import__("time").time() * 1000) % 10**9)

    source_doc = None
    if not args.no_source:
        try:
            source_doc = build_source_doc(nonce)
            print("源产物：%d 条（raw deploy 分支）" % len(source_doc))
        except Exception as e:
            print("FATAL: 取不到源产物（P4 无从判定）：%s" % e, file=sys.stderr)
            return 1

    targets = CHANNELS
    if args.channel:
        targets = [c for c in CHANNELS if c[0] == args.channel]
        if not targets:
            print("未知通道 %r，可选：%s" % (args.channel, [c[0] for c in CHANNELS]), file=sys.stderr)
            return 2

    bad = 0
    for name, base in targets:
        problems, checked = audit_channel(name, base, nonce, source_doc)
        if problems:
            bad += 1
            print("%-14s checked=%d DEAD=%d" % (name, checked, len(problems)))
            for p in problems:
                print("   · %s" % p)
        else:
            print("%-14s checked=%d dead=0" % (name, checked))

    if bad:
        print("\n%d 条通道有问题。判据：每个通道必须各自等于源产物 —— "
              "通道之间「一致」不算证据（都停在旧产物时同样一致）。" % bad, file=sys.stderr)
        return 1
    print("\n全部 %d 条通道与源产物逐字节一致。" % len(targets))
    return 0


if __name__ == "__main__":
    sys.exit(main())
