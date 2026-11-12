# isui.ren/heart

[English](README.en.md) | [中文](README.md)

The origin: a week before being diagnosed with otitis media with
effusion, I had found isui's songs — and the doctor told me my ears are
naturally oversensitive, with negative pressure in one ear lasting over
four years. For the next few years I should keep music to a minimum;
there is no treatment.
Heartbroken, I built this site to hide a little notebook behind it,
jotting down the songs I want to hear again in a few years.
I have never run a proper database (apart from collecting notebooks and
discs). This is my attempt at what teacher Li Ruiming does — pulling
15-year-old material out on a whim.

The entry page of isui.ren (`/heart`): the front door of a tayori fan
site — a three-ball queue animation, typewriter, and card wall.
Pure-CSR static site (zero server overhead), deployed on EdgeOne
Makers; the animation core is Rust compiled to wasm, because
performance-sensitive places get no compromises.

## Highlights

- **`/static` contract-site channel**: the `Static-Contract` specification
  site (the third of three parallel channels: GitHub Pages, Cloudflare at
  `static.mango-mesa.ccwu.cc/` (root), and `isui.ren/static` here). **Each
  channel is deployed independently** — this one is a `static/` tree on the
  deploy branch served directly by EdgeOne Makers. **Moved to a dedicated acceleration host `static.isui.ren` on 2026-11-04**
  (the apex `/static` path was deleted so the two copies cannot drift apart).
  EdgeOne rules split it by path: site paths → `raw.githubusercontent.com`
  branch `deploy-eo` (path rewrite + Host header + Content-Type fix), release
  paths → `github.com` with `UpstreamFollowRedirect` chasing release-assets.
  Bytes really pass through the edge and are cached (`eo-cache-status` / `age`).
  The `/static → /static/` redirect in `edgeone.json` was removed along with the path.
  The root redirect is now a 301 in `edgeone.json` (it used to be the JS in
  `index.html`), so `index.html` can go and EdgeOne's **global** 404-to-index
  fallback goes with it.
The trailing-slash 301 is declared in
  `site-root/edgeone.json` — the platform mechanism, the same place that
  serves `/blog → /Blog`. EdgeOne's static layer does not add the slash
  itself (measured: 200, not 301), and the
  page uses relative links with no `<base>`, so without the slash the
  browser resolves `contract/x.md` to `/contract/x.md`, hits the 611B
  fallback page and — crucially — **gets a 200**, which reads as "link
  opens nothing" rather than 404. GitHub Pages adds the slash itself, so
  that channel never had the problem. The bytes are taken from **that repo's `deploy-eo` branch** (branches split per mirror on 2026-11-04: deploy-eo's base points at static.isui.ren, deploy-cf at Cloudflare) (their
  single origin, strictly derived by `sync-catalogue.py`); neither a local
  build (which yields only the empty source-fallback catalogue) nor a copy of
  `site/dist` (which does not exist there — it is gitignored) would be right.
  The copy follows **their `files.json` manifest** (`scripts/stage-static-tree.py`)
  rather than a hand-written file list — a hand list once missed `LICENSE`, and
  EdgeOne answers missing paths with **200 + a fallback page**, so status-only
  checks pass while the file is actually dead. Online auditing lives in
  `scripts/audit-static-channels.py` (6 self-tests; its per-channel bases
  follow each channel's real mount point — Cloudflare moved to the root at
  `static.mango-mesa.ccwu.cc/`): per-file **content
  fingerprint** checks that catch both the fallback-page disguise and any drift
  from the source artifact — agreement between channels is not evidence.
  **Release bytes are fetched** through a cross-origin **302 with wildcards**
  declared in `edgeone.json` (measured: `302 Found` +
  `Location: https://github.com/...`); this site still hosts zero bytes.
- **Window stage**: the logo and the three balls share one coordinate
  system (a borderless 1280×720 window) that scales uniformly with
  `scale()` — composition stays locked at any screen size.
- **Three-ball engine** (Rust/wasm): one-chain-per-ball, arc-length
  shared chains, cloud center (Frenet offset + EMA), speed governor,
  pre-rendered homing runs, randomized departure order, per-ball
  personality.
- **Debugger** (bottom-left): drag the window / L·M to scale / drag the
  three markers / copy parameters — a human-eye calibration loop that
  writes values straight back.
- **Lightweight typewriter** (hand-rolled rAF) and **card wall**
  (driven by config.json) — few dependencies by design.
- **Plain white-and-grey visuals**; the only black on the page is the
  logo.

## Layout

```
web-rust/   three-ball animation core (Rust -> wasm32)
  ├─ sim/       planning/execution: chains, cloud center, governor,
  │             homing, personalities (bulk of 61 tests)
  ├─ config/    parameters (anchors/curve templates/rhythm),
  │             25 curve templates with validation tests
  ├─ animation/ engine.rs (wasm rendering, debug overlay, coordinates)
  └─ lib.rs     wasm exports: start_balls / toggle_trail_style / debug API
web-ui/     Preact 10 + Vite 8 + TS (the less performance-critical parts)
  └─ build.sh   cargo -> wasm-bindgen -> wasm-opt -> vite, one shot
site-root/  static files deployed to the site root (edgeone.json redirects,
            404 page, logos, middleware)
docs/       architecture docs, ADRs, deploy notes, research archive
CONTEXT.md  domain glossary (Chinese)
```

The app lives under `isui.ren/heart/` (vite `base: "/heart/"`). The site
root carries the 404 page and the `edgeone.json` redirect table — there is
no fallback `index.html` any more, so unknown paths return a **real 404**
instead of being swallowed as 200, and the `/` hop is a 301 from
`edgeone.json`. The `deploy` branch is a **plane shared by several slot repositories**:
heart owns only the root (`heart/` and the site-root files), and every other
directory belongs to its own repo's pipeline. Rebuilding the branch with
`--force` is retired — the old implementation relied on a hand-written
`PRESERVE_SLOTS` list to rescue sibling slots, and a missing entry meant
permanent loss (it wiped `Bahnhof/` on 2026-08-22 and `repo/` on 2026-10-08).
It is now an incremental push with `git pull --rebase` before pushing, and the
branch switch is preceded by `git clean -ffdx` — the build leaves untracked
artifacts (the wasm-bindgen tarball among them), and `git checkout deploy`
refuses to overwrite them otherwise.

`/Mijo` is pulled by this workflow from
[ArchivalEra/Mijo](https://github.com/ArchivalEra/Mijo). This is not about
permissions — the dispatch token can write here — but about **single-writer
ownership**: only heart writes the deploy branch, so several repos never race
on the same branch.

## Build / test / preview

```bash
# build (needs Rust toolchain + wasm32 target + Node)
cd web-ui && ./build.sh        # output: dist/, pure static

# tests (61: geometry / cloud center / governor / lifecycle stability /
# anchored logo)
cd web-rust && cargo test

# local preview
python3 serve.py 8080          # http://127.0.0.1:8080/#/heart
```

## Deployment

Push to `main` -> Actions builds wasm + dist -> pushes the `deploy` branch
-> EdgeOne Makers pulls and deploys it. A separate accelerated domain,
`static.isui.ren`, is split by the EdgeOne rule engine on path (site files
go to the `deploy-eo` branch of `raw`; release paths go to `github.com`
and follow the 302 to fetch bytes).

The rule engine has sharp edges. **Read `docs/edgeone-rules-verified-config.md`
before touching this zone** — the core point: multiple rules **merge**
rather than being mutually exclusive, so a higher-priority rule must
declare every action it wants to change.

Smoke test (**note: `manifest.json` lives under the release path, not the
site root** — `/manifest.json` returning 404 is correct, not a fault):

```bash
curl -s -o /dev/null -w '%{http_code} %{size_download}\n' \
  https://static.isui.ren/ArchivalEra/LLVM-wasm/releases/download/v0.1.6/manifest.json
#   => 200 28602
```

## Debugger

Bottom-left **debug** button:

| mode | action | copied parameter |
|------|--------|------------------|
| window | drag to move · L zoom in / M zoom out | `window: translate/scale` |
| balls | drag the three grey markers into place | `ANCHORS` (pastes into params.rs) |

## Architecture in one line

**Window = single coordinate system**: the logo (DOM) and the balls
(canvas) use the same normalized coordinates inside the window; outside
it there is exactly one thing — `scale()`.
