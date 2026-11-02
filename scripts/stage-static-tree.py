#!/usr/bin/env python3
"""把 Static-Contract 的 deploy 分支产物按 **files.json** 搬进本仓部署树。

## 为什么是 files.json 而不是手写列表

原来这里是一行 `for item in index.html catalogue.json sources.json ...`
—— 手写列表**必漂**。2026-11-02 实测：对方加了 `LICENSE`（AGPL 合规所需），
我没同步，于是 `https://isui.ren/static/LICENSE` 落到了 611B 的站点兜底页。

**最阴的是它返回 200。** 只看状态码的检查会全部通过（对方 `009` 就是靠
「与兜底页比 sha256」才抓到的）。手写列表 + 200 兜底页 = 死链可以静默存在。

对方构建时把**精确产物清单**写进产物（`files.json`，带「必须与实际产物逐条
相等」的自证）。镜像方照抄它 —— 对方再加文件，这里自动跟上。

## 用法

    python3 scripts/stage-static-tree.py --src /tmp/sc --out /tmp/deploy-out/static

- `--src`：clone 下来的 Static-Contract deploy 分支（必须含 files.json）
- `--out`：本仓部署树里的 static/ 目录（会被清空重写）

## 失败语义（fail-closed）

- 没有 files.json ⇒ 拒（不猜产物清单）
- files.json 的 files 为空 ⇒ 拒（不许产出空树）
- 清单里列了但源里不存在 ⇒ 拒（两边产物对不上，不是「少一个文件」）

## 自证

    python3 scripts/stage-static-tree.py --selftest
"""

import argparse
import json
import os
import shutil
import sys
import tempfile


def stage(src, out):
    """按 src/files.json 复制到 out。返回复制条数；任何不一致抛 SystemExit。"""
    manifest = os.path.join(src, "files.json")
    if not os.path.isfile(manifest):
        raise SystemExit(
            "FATAL: %s 不存在 —— 没有 files.json 就无法确定产物清单，"
            "拒绝手写文件名列表（那正是 LICENSE 被漏掉的成因）" % manifest
        )

    with open(manifest, encoding="utf-8") as fh:
        doc = json.load(fh)
    files = doc.get("files") or []
    if not files:
        raise SystemExit("FATAL: files.json 的 files 为空 —— 拒绝产出空 static 树")

    if os.path.isdir(out):
        shutil.rmtree(out)
    os.makedirs(out, exist_ok=True)

    missing = []
    for rel in files:
        # 防御：清单理论上由对方生成，但不能信任任意路径（别让它写 ../ 出去）
        norm = os.path.normpath(rel)
        if norm.startswith("..") or os.path.isabs(norm):
            raise SystemExit("FATAL: files.json 含越界路径 %r" % rel)
        src_path = os.path.join(src, norm)
        if not os.path.isfile(src_path):
            missing.append(rel)
            continue
        dst_path = os.path.join(out, norm)
        os.makedirs(os.path.dirname(dst_path) or out, exist_ok=True)
        shutil.copy2(src_path, dst_path)

    if missing:
        raise SystemExit(
            "FATAL: files.json 列了但源里不存在：%s —— 两边产物对不上" % missing
        )

    # files.json 本身也发布（消费方/审计需要它做同一套判据）
    if os.path.isfile(manifest):
        shutil.copy2(manifest, os.path.join(out, "files.json"))

    return len(files)


def selftest():
    ok = 0
    fail = 0

    def check(name, fn):
        nonlocal ok, fail
        try:
            fn()
            print("PASS | %s" % name)
            ok += 1
        except AssertionError as e:
            print("FAIL | %s: %s" % (name, e))
            fail += 1
        except SystemExit as e:
            print("FAIL | %s: 意外 SystemExit %s" % (name, e))
            fail += 1

    def mk(spec):
        """造一个假 deploy 分支：spec = {files.json 的 files: [...], 实际存在的: [...]}"""
        d = tempfile.mkdtemp()
        listed, actual = spec
        for rel in actual:
            p = os.path.join(d, rel)
            os.makedirs(os.path.dirname(p) or d, exist_ok=True)
            with open(p, "w", encoding="utf-8") as fh:
                fh.write("x" * 10)
        with open(os.path.join(d, "files.json"), "w", encoding="utf-8") as fh:
            json.dump({"files": listed}, fh)
        return d

    def t_ok():
        src = mk((["LICENSE", "index.html", "a/b.md"], ["LICENSE", "index.html", "a/b.md"]))
        out = tempfile.mkdtemp()
        n = stage(src, out)
        assert n == 3, n
        assert os.path.isfile(os.path.join(out, "LICENSE")), "LICENSE 必须被复制（本缺陷的靶子）"
        assert os.path.isfile(os.path.join(out, "a/b.md")), "嵌套路径必须被复制"
        assert os.path.isfile(os.path.join(out, "files.json")), "files.json 也要发布"

    def t_no_manifest():
        d = tempfile.mkdtemp()
        try:
            stage(d, tempfile.mkdtemp())
        except SystemExit as e:
            assert "files.json" in str(e), e
            return
        raise AssertionError("缺 files.json 时必须拒")

    def t_empty():
        src = mk(([], []))
        try:
            stage(src, tempfile.mkdtemp())
        except SystemExit as e:
            assert "为空" in str(e), e
            return
        raise AssertionError("空清单时必须拒")

    def t_missing():
        src = mk((["LICENSE", "gone.md"], ["LICENSE"]))
        try:
            stage(src, tempfile.mkdtemp())
        except SystemExit as e:
            assert "gone.md" in str(e), e
            return
        raise AssertionError("清单有但实际缺时必须拒")

    def t_traversal():
        src = mk((["../escape.md"], []))
        try:
            stage(src, tempfile.mkdtemp())
        except SystemExit as e:
            assert "越界" in str(e), e
            return
        raise AssertionError("越界路径必须拒")

    check("正常：按清单复制（含 LICENSE 与嵌套路径）", t_ok)
    check("★ 缺 files.json ⇒ 拒（不许手写列表）", t_no_manifest)
    check("★ files 为空 ⇒ 拒（不许空树）", t_empty)
    check("★ 清单有、实际缺 ⇒ 拒（两边对不上）", t_missing)
    check("清单含越界路径 ⇒ 拒", t_traversal)

    print("=== %d PASS / %d FAIL ===" % (ok, fail))
    return 0 if fail == 0 else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", help="clone 下来的 Static-Contract deploy 分支")
    ap.add_argument("--out", help="本仓部署树里的 static/ 目录")
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()

    if args.selftest:
        return selftest()
    if not args.src or not args.out:
        ap.error("需要 --src 与 --out（或用 --selftest）")

    n = stage(args.src, args.out)
    print("staged %d files (per files.json) → %s" % (n, args.out))
    idx = os.path.join(args.out, "index.html")
    if os.path.isfile(idx):
        with open(idx, encoding="utf-8") as fh:
            for line in fh:
                if "STATIC-CONTRACT-BUILD" in line:
                    import re
                    m = re.search(r"STATIC-CONTRACT-BUILD \w+", line)
                    if m:
                        print("fingerprint: %s" % m.group(0))
                    break
    return 0


if __name__ == "__main__":
    sys.exit(main())
