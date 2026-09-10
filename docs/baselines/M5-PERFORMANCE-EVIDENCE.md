# M5 performance evidence — M0 → M5 comparison

- Generated: 2026-09-10 (issue #233)
- Protocol: identical to M0 — `scripts/benchmark-routes.mjs`, the canonical
  `docs/baselines/m0-routes.json` fixtures, 3 cold Lighthouse runs per
  route/profile (fresh storage each run), Lighthouse 13.4.1, mobile =
  simulated 150 ms RTT / 1.6 Mbps / 4× CPU, medians reported.
- M0 baseline: `m0-2026-09-08.json` (Next.js 16 + OpenNext, revision
  `0ce89b7c`). M5: `m5-2026-09-10.json` (Astro / TanStack Start on Vite at
  `4ce6b4006` + M4/M5 remediations), served from production builds on
  localhost. Localhost TTFB and absolute ms values carry the usual local-run
  variance; the deltas below are well outside that noise.

## Results (medians, M0 → M5)

| Route                   | Prof    | Perf score       | LCP                   | CLS   | TBT            | TTI                   | Bytes               |
| ----------------------- | ------- | ---------------- | --------------------- | ----- | -------------- | --------------------- | ------------------- |
| landing-home            | mobile  | 95 → **99**      | 2,933ms → **1,663ms** | 0 → 0 | 10ms → **0ms** | 3,088ms → **1,663ms** | 365KB → **149KB**   |
| landing-home            | desktop | 100 → 100        | 587ms → **431ms**     | 0 → 0 | 0 → 0          | 589ms → **433ms**     | 324KB → **188KB**   |
| blog-post (pitch-black) | mobile  | 98 → 98          | 2,346ms → **2,223ms** | 0 → 0 | 42ms → **0ms** | 2,346ms → 2,246ms     | 235KB → 377KB       |
| blog-post (pitch-black) | desktop | 100 → 100        | 508ms → 530ms         | 0 → 0 | 0 → 0          | 508ms → 530ms         | 235KB → 412KB       |
| blog-index              | mobile  | 96 → **79** ⚠    | 2,649ms → 3,800ms ⚠   | 0 → 0 | 88ms → 234ms ⚠ | 3,409ms → 7,845ms ⚠   | 724KB → 1,432KB ⚠   |
| blog-index              | desktop | 100 → 99         | 587ms → 812ms         | 0 → 0 | 0 → 36ms       | 587ms → 1,540ms ⚠     | 1,278KB → 1,978KB ⚠ |
| admin-dashboard         | desktop | 100 → 98         | 525ms → 870ms         | 0 → 0 | 0 → 0          | 525ms → 870ms         | 260KB → 644KB       |
| store-catalog           | both    | 100/98 → **n/a** | —                     | —     | —              | —                     | —                   |

CLS is 0.000 everywhere on both sides; layout stability is unchanged.
INP is not observable in lab runs (field metric); TBT is the lab proxy.

## Attribution

- **Landing (−59% mobile bytes, −43% LCP):** Astro migration (#257) removed
  the Next.js client runtime; the marketplace section fetches lazily via the
  edge-cached API (#271-era edge cache, M4 shared helper).
- **Blog post pages (TBT 42→0ms mobile):** article HTML is prebuilt offline
  and served from R2 (`v1/render/*`, #281) — zero generation logic at the
  edge, no client framework hydration on content. Byte growth reflects the
  richer prebuilt article (inline artwork markup) and is bounded by
  `s-maxage=86400` CDN caching plus the Worker edge cache (#284).
- **Blog index regression (⚠ 96→79 mobile):** the grid island now ships the
  full filter UI (nuqs + TanStack Query) and a larger seeded index (2,398
  published posts vs the M0-era corpus), roughly doubling transfer and TBT on
  the filtered home. This is the one accepted regression; tracked as a
  bounded follow-up (initial-posts payload trimming / island slimming) with
  the numbers above as its before-state.
- **Admin (bytes 260→644KB, perf 100→98):** TanStack Start's typed router and
  React 19 runtime replace the Next admin runtime. Accepted: internal,
  authenticated console where routing/type-safety wins outweigh a +384KB
  desktop payload; no public visitors.
- **Store:** no M5 numbers — the storefront 500s without a reachable Medusa
  backend and publishable key (server-only env, Cloudflare dashboard).
  Environment-gated exception; re-run this suite against a deployed or
  locally running Medusa instance as the first store perf task after launch.

## Budgets

| App        | Budget                                                      | Status                                                             |
| ---------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| landing    | Perf ≥ 95 mobile/100 desktop, LCP < 2.5s mobile, CLS < 0.05 | **met** (99/100, 1.66s, 0)                                         |
| blog post  | Perf ≥ 95, CLS < 0.05, TBT < 100ms                          | **met** (98/100, 0, 0ms)                                           |
| blog index | Perf ≥ 95 mobile                                            | **exception** — 79; follow-up filed (bundle + payload), desktop 99 |
| admin      | Functional + CLS 0; no public-traffic budget                | **met with accepted payload delta**                                |
| store      | Unmeasurable until Medusa is deployed                       | **exception (environment-gated)**                                  |

Remaining bottleneck, bounded follow-up: blog index island payload (owner:
blog; priority: medium; trigger: next blog feature pass or if mobile perf
drops further in field data).
