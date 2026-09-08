# ADR 0001: M0 baseline and decision gates

- Status: accepted baseline
- Date: 2026-09-08
- Scope: M0 issues #210, #211, #212, and #213
- Canonical route fixtures: [`../baselines/m0-routes.json`](../baselines/m0-routes.json)
- Canonical measured report: `../baselines/m0-2026-09-08.json` (generated, never hand-edited)

## Context

Pink Binder is a four-app Next.js 16 Turborepo deployed as four OpenNext
Cloudflare Workers. The next milestones evaluate state libraries, framework and
bundler alternatives, and shared UI/performance work. Those changes must be
comparable against a stable control: the route fixture, browser profile, cache
state, build command, runtime versions, and deployment target are all part of
the measurement, not incidental details.

This record is the single M0 inventory and gate. App READMEs remain setup
documents; they must not become competing architecture inventories.

## Inventory and ownership boundaries

| Surface         | Critical routes and mode                                                                                                                                                                                                                                                                                                                                                         | Data and state owner                                                                                                                                                                                                                                                                                                | Shared boundary                                                                                                 | Deployment target                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `apps/landing`  | `/` is a server page containing a client link-in-bio shell. The marketplace panel loads after visibility through a server action; the featured blog block is dynamic and no-store. `robots.txt`, `sitemap.xml`, and eBay account-deletion API are also exposed.                                                                                                                  | `page-client.tsx` owns transient share-dialog/copy state. `actions.ts` owns the server-action boundary. `@repo/marketplaces` owns eBay retrieval; `@repo/data` owns the featured post.                                                                                                                              | `@repo/config`, `@repo/data`, `@repo/marketplaces`, `@repo/ui`; local logo/QR assets.                           | `landing` Worker, R2 incremental cache, Images binding.                                                |
| `apps/blog`     | `/` streams a server grid section; `/posts/[...slug]` is ISR (`revalidate = 86400`) with dynamic fallback; `/api/posts-grid` is server-filtered and CDN cacheable; `/api/card-gallery` reads R2 plus edge cache. RSS, sitemap, robots, and discovery routes are server routes.                                                                                                   | `BlogGrid` owns local filter, pagination, request cancellation, and URL synchronization. `blog-grid-data.ts` owns filtering/derived facets. `blog-index-r2.ts` owns the isolate-local R2 index cache; `cached-posts.ts` owns the request memoized post read. `@repo/data` owns disk fallback and generated content. | `@repo/config`, `@repo/data`, `@repo/marketplaces`, `@repo/ui`; blog public media and R2 `BLOG_GALLERY_BUCKET`. | `blog` Worker, regional + R2 incremental cache, R2 gallery bucket, Images binding, observability logs. |
| `apps/store`    | `/` is a static six-product catalog fixture. The navigation/cart controls do not implement routes, cart state, checkout, or an external catalog yet.                                                                                                                                                                                                                             | Module constants in `page.tsx`; there is no client, server, URL, cache, or marketplace state.                                                                                                                                                                                                                       | `@repo/ui`, `@repo/config`; no app-local assets.                                                                | `store` Worker, R2 incremental cache, Images binding.                                                  |
| `apps/admin`    | `/` is a static dashboard fixture. Sidebar targets are placeholders: no corresponding route, auth, user data, order data, or mutation flow exists.                                                                                                                                                                                                                               | Module constants in `page.tsx`; there is no implemented auth/data state.                                                                                                                                                                                                                                            | `@repo/ui`, `@repo/config`; no app-local assets.                                                                | `admin` Worker, R2 incremental cache, Images binding.                                                  |
| Shared packages | `@repo/ui` is the reusable component and client-island layer; `@repo/data` is server-only generated content with a separately exported client-safe surface; `@repo/marketplaces` owns fetch, timeout, cache, provider, price, image, and eBay boundaries; `@repo/config` owns public URLs, marketplace display and headers; `@repo/typescript-config` owns TypeScript baselines. | Do not duplicate transport, caching, generated-data parsing, image fallback, or public URL logic inside apps.                                                                                                                                                                                                       | Package boundaries are explicit through workspace dependencies and Next `transpilePackages`.                    | Built by Turborepo; apps bundle their declared workspace dependencies.                                 |

All apps use `nodejs_compat` and `global_fetch_strictly_public`; each has a
dedicated `NEXT_INC_CACHE_R2_BUCKET`. Blog is intentionally different: it uses
R2 content at request time, long-lived regional cache, a minified Worker, and
external edge middleware. `apps/blog/next.config.mjs` carries the tracing
include contract for generated data and authored content. Any framework or
bundler experiment must preserve these contracts before it can be promoted.

## State, fetching, and duplication map

| Domain                   | Current owner and lifecycle                                                                                                              | Contract and invalidation                                                                           | M1 decision gate                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Landing share UI         | `apps/landing/app/page-client.tsx`, component lifetime only.                                                                             | Opens/closes in-memory; clipboard result resets for a new target. No cross-route persistence.       | Retain local React state unless a real cross-route requirement appears.                                                 |
| Landing marketplace      | `getLandingMarketplaceData` behind `loadLandingMarketplace` server action, mounted by `LazyWhenVisible`.                                 | Read after the panel is near viewport; provider failure returns the existing safe empty/error path. | Do not introduce a client cache until repeated visible-panel navigations show a measured user benefit.                  |
| Landing featured post    | `getLandingBlogFeatured`, server no-store.                                                                                               | Random result per request; no cache is intentionally retained.                                      | Preserve no-store/random semantics or make a product decision before caching.                                           |
| Blog grid and filters    | Server owns source filtering; `BlogGrid` owns local UI state and synchronizes accepted filter fields to URL.                             | Abort superseded API fetches. `/api/posts-grid` has `s-maxage=86400` and stale-while-revalidate.    | URL remains the shareable source of truth. A query library may not duplicate filter ownership.                          |
| Blog R2 index/post reads | `blog-index-r2.ts` owns 5-minute isolate-local index memoization and in-flight de-duplication; React `cache` memoizes per-request posts. | R2 is the Worker path; committed disk data is build/local fallback.                                 | Preserve schema version validation, bounded cache lifetime, and fallback behavior before changing cache libraries.      |
| Blog galleries           | `/api/card-gallery` owns validation, R2 access, ETag, HEAD/GET behavior, and `caches.default` writes.                                    | Edge cache is GET-only; failed cache operations cannot convert a valid response into 500.           | Preserve method, ETag, Cache-Control and 400/404 behavior.                                                              |
| Marketplace APIs         | `@repo/marketplaces` owns requests, 10-second timeout, `next.revalidate`, provider transforms, pricing and image fallbacks.              | Default revalidation is 24 hours; errors return `null` rather than leak provider failures.          | Never create app-local fetch wrappers for the same provider.                                                            |
| Admin/store fixture data | Module constants, no transport.                                                                                                          | No update or authentication lifecycle exists.                                                       | Replace fixtures only with a named backend/data model; do not add a state library to simulate missing product behavior. |

The only current duplication risk is accidental reimplementation of the
marketplace/R2/data boundaries in an app. There are no Zustand, TanStack Query,
or nuqs stores today; M1 starts from that intentional absence rather than
assuming a migration is needed.

## Measurement protocol

The route harness uses pinned Lighthouse and headless Chrome. It records fixture,
browser profile, cache policy, raw samples, medians, variance, and tool versions.

```sh
bun run benchmark:routes -- --base landing=https://pinkbinder.shop --runs 3
```

Each comparison uses matching routes, profiles, cache states, and run counts.

The report includes LCP, lab INP when Lighthouse observes an interaction, CLS,
TTFB, TBT, interactive time, Speed Index, transfer bytes, request count,
category scores, fixture, cache state, profile, source revision, Node, Chrome,
Lighthouse version, and raw samples. A missing lab INP is `null`, not zero.

### 2026-09-08 local control snapshot

The committed report uses revision `0ce89b7c4`, Node 24.18.0, Lighthouse
13.4.1, and headless Chrome 152.0.7977.76. Every manifest entry has three cold
samples. The main exceptions are landing mobile LCP at 2.79 s, blog-index mobile
LCP at 2.26 s with 742 KB transfer, blog-index desktop transfer at 1.31 MB, and
document accessibility scores from 0.94 to 0.98. Each is an explicit M4 input,
not a waiver. The `blog-posts-grid` API returned HTTP 200 in all three samples,
with `s-maxage=86400` and a 10.7 KB response.

The clean root build completed in 26.778 s and produced .next directories of
13,532 KiB (landing), 460,600 KiB (blog), 9,096 KiB (store), and 9,100 KiB
(admin). OpenNext artifact builds passed for all four apps: landing 13.3 s,
admin 8.89 s, store 8.55 s, and blog 58.54 s. The blog build traced 2,398
indexed routes (27.19 MiB) and its gallery API trace was 6.65 MiB; the required
generated-handler patch applied to three instrumentation registrations and four
cache-handler methods.

Build and runtime timing records wall-clock seconds, exit status, artifact bytes,
cache status, machine/runtime versions, and three runs: the first clean, then
two incremental runs. The command set is each app's native build, each app's
Cloudflare build, the root test command, dev startup, and a deliberate edit
plus reversal inside the app for the HMR fixture. A local result is never used
as a Cloudflare runtime result.

## Initial budgets and promotion rules

These are gates, not claims that the current implementation already passes.
P0 means the route must meet the budget; P1 needs a recorded exception before
promotion. Compare median against median and investigate variance greater than
20% of the median before accepting a change.

| Metric                 |                                                                                           P0 mobile |  P0 desktop |     P1/API | Gate                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------: | ----------: | ---------: | -------------------------------------------------------------------------------------- |
| LCP                    |                                                                                         <= 2,500 ms | <= 2,000 ms |        n/a | Reject a regression >10% or >250 ms unless the decision record names the user benefit. |
| Lab INP                |                                                                                           <= 200 ms |   <= 200 ms |        n/a | A missing interaction result is not a pass; add the interaction fixture first.         |
| CLS                    |                                                                                             <= 0.10 |     <= 0.10 |        n/a | Reject any regression >0.02.                                                           |
| TTFB                   |                                                                                           <= 800 ms |   <= 600 ms |  <= 500 ms | Review origin, R2, cache and Worker cold-start evidence before approval.               |
| Transfer               |                                                                                          <= 600 KiB |  <= 750 KiB | <= 150 KiB | Reject >10% growth without a documented payload benefit.                               |
| JavaScript             |                                                                                          <= 275 KiB |  <= 325 KiB |  <= 50 KiB | Reject >10% growth unless code splitting removes equivalent initial work.              |
| CSS                    |                                                                                          <= 100 KiB |  <= 125 KiB |  <= 25 KiB | Reject >10% growth.                                                                    |
| Requests               |                                                                                               <= 45 |       <= 55 |      <= 12 | Review third-party, image and duplicate-fetch additions.                               |
| Accessibility          |                   score 1.00 and no keyboard, name, focus, contrast, semantic, or motion regression |        same |        n/a | Manual keyboard/mobile validation is required for changed UI.                          |
| Visual regression      |                        No unintended desktop (1440px), tablet (768px), or mobile (390px) difference |        same |        n/a | Use identical fixtures, font state, and image cache state.                             |
| Next/OpenNext artifact | Build succeeds; no missing trace data, generated-worker patch mismatch, or Worker-size limit breach |        same |       same | Reject tracing, workerd, cache-handler, or size regressions.                           |
| Build/test             |                              Median clean build/test growth <=10%; incremental and HMR growth <=15% |        same |       same | Repeat when variance is >20%.                                                          |

Framework, bundler, state library, query/cache layer, or loading strategy is
**retained** when it meets the relevant budget and its alternative has no
material user, maintenance, reliability, or deployment benefit. It is
**rejected** when it breaks a compatibility contract, misses a P0 budget, adds
duplicate ownership, or lacks repeatable before/after evidence. It may be
**promoted** only after an isolated route proof keeps contracts intact, passes
the full route/artifact gate, includes rollback instructions, and is accepted
in a dated decision record.

## Compatibility and rollback gates

| Change area            | Must remain compatible                                                                                                                                                    | Rollback point                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Auth/admin             | Existing unauthenticated fixture behavior must not be described as auth. Future auth needs route protection, session expiry, loading/error, and test fixtures first.      | Feature flag or route-level adapter; keep the fixture path until protected-route coverage is approved.                   |
| Blog content/R2        | Schema version, R2 keys, disk-build fallback, ISR/dynamic fallback, RSS/sitemap, discovery docs, image URL behavior, ETag and cache headers remain stable.                | Retain the old reader/serializer and object namespace until dual-read/dual-write proves both paths.                      |
| Marketplace            | Provider timeout, revalidation, null-on-failure behavior, price/image fallback order, external-link safety, eBay deletion callback and secret boundary remain stable.     | Keep the existing provider adapter selectable and disable a new adapter/feature flag without changing public links.      |
| Images/assets          | Remote image patterns, R2/public paths, alt text, dimensions, loading priority, fallbacks, and visual output remain stable.                                               | Keep the existing asset key and fallback list until image-byte and visual checks pass at all breakpoints.                |
| State/query            | URL filters remain shareable; server filtering remains authoritative; no client cache may make stale marketplace/blog data look current.                                  | Gate a new provider behind a route-level flag and preserve the original fetch/URL path for one release.                  |
| Next/framework/bundler | App Router routes, metadata, server/client boundaries, `transpilePackages`, trace includes, OpenNext config, Worker bindings, headers and Cloudflare flags remain stable. | Keep the original app entry/build command and deploy target; promote one app at a time with an immediate revert runbook. |

## Known baseline limitations and follow-up ownership

- On 2026-09-08 `https://pinkbinder.blog/` returned HTTP 503 during public
  preflight. That is a production health blocker, not a zero-performance sample.
  The local production build is the control until the deployed blog responds to
  the same manifest; deployment/edge owners must record the Worker/Cloudflare
  cause and rerun it after recovery.
- Admin and store have fixture-only routes. Their measurements characterize shell
  cost, not authenticated/admin or commerce behavior. M1/M2 need stable
  non-production fixtures before claiming product-path budgets.
- Lighthouse navigation does not manufacture meaningful interactions. Landing
  share, blog filter/search/load-more, and future cart/auth flows need scripted
  interaction fixtures before INP is a promotion metric.
- The local landing measurement intentionally had no eBay credentials. Its
  visibility-triggered marketplace call logged the existing missing-credential
  message and retained the loading/empty safe state; no secret or production
  marketplace response was used as a benchmark fixture.
- Public assets total about 906 KB in landing and 1.59 MB in blog directories.
  Deployment transfer is determined by the requested asset set, so directory
  size is not a transfer pass/fail value.

## Consequences

M0 is complete when this record, manifest, and an auditable generated report
exist; the four issues close after the reviewed branch lands on `main`.
Later work updates the report and this ADR before claiming improvement,
migration readiness, or release completion.
