# HISTORY — isui.ren-heart

Implementation decisions and the incidents that produced them. This is the
place for maintenance detail: **README is the product face** and describes what
the site is and how to run it, never how its pipelines are wired or which
mistake shaped them.

Read this before changing `deploy.yml`, `site-root/middleware.js`, or the
EdgeOne rule engine.

## The deploy branch has a single writer

`deploy` is a shared flat branch: several repositories each ship their own
subdirectory into it, and heart owns only the root.

The discipline — *every repository writes its own artefacts; heart writes
nothing but its own* — was earned twice:

- `--force` full-branch rebuilds were retired. The old implementation recreated
  the whole branch and relied on a hand-written `PRESERVE_SLOTS` list to rescue
  other repositories' directories. A missing entry meant permanent loss: it
  wiped `Bahnhof/` on 2026-08-22 and `repo/` on 2026-10-08.
- The replacement is an incremental push with `git pull --rebase` before
  pushing, and `git clean -ffdx` before the branch switch — the build leaves
  untracked artefacts (the wasm-bindgen tarball among them), and
  `git checkout deploy` refuses to overwrite them otherwise.

`/Mijo` is pulled by this workflow from
[ArchivalEra/Mijo](https://github.com/ArchivalEra/Mijo) rather than pushed by
Mijo. Not a permissions question — the dispatch token can write here — but
single-writer ownership: only heart writes the deploy branch, so repositories
never race. The fetched `site/` is staged in its own `/tmp/mijo-slot` and merged
in at the copy stage; anything placed under `/tmp/deploy-out` is wiped when that
directory is rebuilt.

## Path normalisation is load-bearing

`/Mijo` without a trailing slash used to answer 200 instead of redirecting, and
that silently emptied the page: `index.html` loads `app.js` and `catalogue.json`
through relative paths, so on `/Mijo` the browser resolves them against the
parent directory and both 404. The `<tbody>` starts empty and every row is built
by that script, so a missing `app.js` means zero rows on a 200 response — which
reads as "the site is broken" rather than "one resource is missing".

Uppercase spellings (`/MIJO`, `/MiJo`) 404'd outright: the static tree is
case-sensitive and only `/Mijo` exists.

The middleware therefore normalises every spelling that case-insensitively
equals `mijo`, with or without a trailing slash, to `/Mijo/`. Sub-paths pass
through, and the canonical path is not redirected, so there is no loop.

Two things made this harder than it looks, both worth remembering:

- **The matcher is not a regex.** It accepts literal paths and `:path*`
  wildcards. A character class like `[/Mm][Ii][Jj][Oo]` does not merely fail to
  match — it takes the entire config out, so the middleware silently stops
  running for every route. The symptom is that your redirects never appear and
  the static layer answers instead; a quick way to tell them apart is that
  `Response.redirect` emits an absolute URL while `edgeone.json` emits a
  relative one.
- **`edgeone.json` runs before the middleware**, so a stale static rule can
  pre-empt a correct handler. Its `/mijo` rule used to point at `/Mijo` — the
  exact URL that renders empty — which walked readers straight into the bug.

The platform limits behind both bullets (which rule actions the free plan
refuses, and what the `Condition` grammar accepts) are recorded as hard facts in
[`STATE.md`](STATE.md) under 已知边界 — read that before designing another
redirect, because they were measured with tccli and are not negotiable.

## static.isui.ren is a separate origin

An independent accelerated domain, served by the EdgeOne rule engine which
routes by path: site files come from `raw` on the `deploy-eo` branch, release
paths from `github.com` following the 302 to fetch the bytes.

The rule engine's pitfalls are deep. Read
`docs/edgeone-rules-verified-config.md` before touching this zone — the core
gotcha is that multiple rules **merge** rather than take exclusive effect, so a
higher-priority rule must declare explicitly every action it intends to change.
