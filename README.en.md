# isui.ren/heart

English | [中文](README.md)

The entry page of isui.ren (`/heart`): the front door of a tayori fan
site — a three-ball queue animation, typewriter, and card wall.
Pure-CSR static site (zero server overhead), deployed on EdgeOne
Makers; the animation core is Rust compiled to wasm, because
performance-sensitive places get no compromises.

## Highlights

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
site-root/  static files deployed to the site root (hop page, 404 page, logos)
docs/       architecture docs, ADRs, deploy notes, research archive
CONTEXT.md  domain glossary (Chinese)
```

The app lives under `isui.ren/heart/` (vite `base: "/heart/"`); the site
root carries only the hop page and the 404 page — dead paths are handled
by EdgeOne's `404.html` convention. The `Bahnhof/` subdirectory belongs
to the [Bahnhof](https://github.com/ArchivalEra/isui.ren-Bahnhof)
repository's pipeline.

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
