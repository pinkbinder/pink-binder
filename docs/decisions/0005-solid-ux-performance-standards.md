# ADR 0005: Solid UX performance standards

- Status: accepted
- Date: 2026-09-15
- Scope: all Solid surfaces (admin, blog/store islands, `@repo/ui`)
- Standard: [`../UX_PERFORMANCE_STANDARDS.md`](../UX_PERFORMANCE_STANDARDS.md)
- Follows: ADR 0002 (state ownership), the React → Solid + Kobalte migration (#122)

## Decision

The monorepo adopts a single, binding UX performance standard for Solid
development, recorded in `docs/UX_PERFORMANCE_STANDARDS.md`. The standard
covers Solid correctness (reactive props proxy, effects/cleanup discipline,
rendering primitives), navigation performance (intent preloading, per-route
code splitting, URL-owned state with debounced text input), targeted loading
priorities (server-render first, deferred island hydration, post-hydration
facet fetching, one eager LCP image), asset rules, and interaction budgets
(windows for large option lists, viewport-driven pagination).

This ADR records the audit that produced the standard and the first-round
remediation:

1. **`BlogGrid` read props through the reactive proxy** — the last React-style
   destructuring-with-defaults in a hydrated island. No output change; the
   component stays correct when facet/prop updates arrive after hydration.
2. **`SearchableSelect` windows its dropdown** to 100 mounted rows (default,
   overridable via `renderLimit`) with an overflow hint. The blog catalog tag
   selector previously mounted 2,000+ buttons per open; typing already
   re-ranked options, so the window preserves behavior at a fraction of the
   mount cost. Selection display still resolves against the full option list.
3. **Admin text filters debounce before touching the router** via the new
   `DebouncedInput` (orders, inventory, content studio). Previously every
   keystroke ran a router navigation → loader → `ensureQueryData` refetch.
4. **Store catalog search stops spamming history** — `q` writes
   `replaceState`, category chips keep `pushState` (extracted and unit-tested
   as `buildCatalogUrl`).
5. **Admin routes code-split** — `autoCodeSplitting: true` in `tsr.config.json`.
6. **Housekeeping** — `formatAmountCents` moved from the preferences store to
   `lib/format.ts`; stale "React Server Components" comment on
   `@repo/ui/server` corrected.

## Alternatives considered

- **Convert all server-rendered blog components off destructured props.** The
  ~40 blog content components destructure static server-provided values; they
  never re-render reactively (prebuilt render pipeline), so conversion is
  churn with byte-drift risk in the vendored `blog-pipeline` copy for zero
  runtime gain. The standard instead scopes the destructuring ban to
  components that can receive dynamic props, with the exception documented.
- **Virtualize the tag dropdown.** A windowed list library adds a dependency
  and complexity for a click-to-open surface; the ranked window plus
  type-to-narrow achieves the same interaction budget. Revisit if a surface
  must show >500 live rows.
- **Move admin filter state into signals** to skip the router entirely.
  Rejected: violates ADR 0002 — the URL owns shareable filter state; the fix
  is decoupling typing from commits, not decoupling state from the URL.

## Consequences

- New Solid code reviews against the standard's pre-merge checklist.
- `DebouncedInput` is the only sanctioned text-filter → router path in admin;
  a direct `onInput → navigate` should read as a bug.
- Future work continues from the standard's follow-up backlog (route-level
  data preloading expansion, list virtualization threshold, island bundle
  budgets), tracked in the public repo.

## Addendum (2026-09-15, round 2): backlog disposition

The follow-up list published with the audit is dispositioned as follows.
Items marked _done_ shipped on the same branch; the rest record why code
did not move, so the list never re-derives itself.

**Done**

| Item                                                                                           | Where                                                                         |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `createSelector` filter-chip active states                                                     | `packages/ui` blog grid — one active-filter snapshot memo, per-chip selectors |
| `startTransition` on filter commits                                                            | `packages/ui` blog grid (`pushFilterParams`, search commit)                   |
| SearchableSelect filter debounce (60 ms)                                                       | `packages/ui` searchable select                                               |
| Blog grid retained-page cap (`maxPages` 20)                                                    | `packages/ui` blog-grid-query                                                 |
| Query-state caching by search string (equals semantics)                                        | `packages/ui` compat-navigation                                               |
| `content-visibility: auto` on grid cards                                                       | `packages/ui` blog grid                                                       |
| Hydrated-surface anti-pattern guard                                                            | `tests/solid-hygiene.test.ts` (CI-enforced §1)                                |
| Admin query cache persistence (sessionStorage, `maxAge` = gcTime)                              | `apps/admin` root-provider via router `Wrap`                                  |
| Shared query policy module                                                                     | `@repo/config/query-defaults` (admin, blog providers, grid query)             |
| View transitions for store navigation (`ClientRouter`)                                         | `apps/store` layout                                                           |
| Cart island deferred to `client:idle`                                                          | `apps/store` cart page                                                        |
| Speculation-rules prefetch of grid links (moderate)                                            | blog index                                                                    |
| High-priority LCP image preload (first grid card)                                              | blog index + layout                                                           |
| Web Vitals → Zaraz `web_vitals` events, lazily loaded                                          | blog analytics client                                                         |
| Subpath exports for the interactive kit                                                        | `@repo/ui` package exports                                                    |
| Bundle budgets as a `performance` script (gzip ceilings; entry, vendor, CSS, per-route, total) | `scripts/check-bundle-budgets.mjs`                                            |

**Closed without code (evaluated)**

- `batch()` audit: Solid already batches synchronous event-handler writes;
  the remaining async sequences are intentionally ordered. No change.
- `<Index>` for tables: rows key by stable object references today (store
  `produce` mutates in place), so `<For>` already preserves row DOM.
- `defaultPreloadDelay`: the router's 50 ms default was already active.
- Virtualization: the `maxPages` cap bounds the grid at ~171 mounted cards,
  under the 500-row virtualization threshold; revisit per §5.
- Font preloading: `font-title`/`font-body` are system font stacks — zero
  webfont bytes to optimize.
- `benchmark:routes`: harness exists; belongs to the weekly audit lane with
  live servers, not to per-PR checks.

**Blocked (external dependency, revisit when unblocked)**

- Converting the ~40 server-rendered blog components off destructured props:
  incremental as files are touched, with the blog-pipeline vendored copy
  mirrored per the artifact-drift rule; the hygiene guard pins the boundary.
- `srcset`/`sizes` and AVIF: R2 image variants carry no width metadata
  in-repo and the transcode lives in blog-pipeline (paused). Requires
  pipeline-side metadata first.
- Route loaders for inventory/content/ads: blocked until the real
  marketplace integrations replace the demo stores; the orders route is the
  template.
- Web Vitals for admin: no analytics sink exists in admin; adopting Zaraz
  there is a product decision, not a perf task.

## Addendum — second audit round

A follow-up pass applied the same standards to hot paths the first round
missed. Adopted additionally:

| Decision                                                                     | Location                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Prebuilt facet lookup index (`buildBlogFacetIndex`) replaces per-commit      | `@repo/data` post-filters; consumed by `blog-grid`,          |
| catalog scans (~665 ms → sub-ms per filter change)                           | `blog-query-state`, blog SSR                                 |
| Isolate-level derived grid dataset (`posts`, `facets`, `facetIndex`) cached  | `apps/blog/src/lib/blog-grid-data.ts` (`getBlogGridDataset`) |
| in a `WeakMap` keyed on the R2 index object                                  |                                                              |
| Per-card href query suffix built once per filter change, not per card        | `packages/ui` blog grid (`filterQuerySuffix`)                |
| `Intl.NumberFormat` hoisted to module scope in admin formatting              | `apps/admin/src/lib/format.ts`                               |
| Redundant `value`-mirror effect removed from `BudgetCell`                    | `apps/admin` ads route                                       |
| Cart persists only when `lines` change; dead `isOpen`/drawer toggle removed, | `apps/store` cart store + `StoreHeader`                      |
| count button links to `/cart`                                                |                                                              |
| Medusa region list memoized in-isolate (5-min TTL + in-flight dedupe)        | `apps/store/src/lib/catalog.ts`                              |
| `server-only` stub/alias/test mock removed (no remaining importers)          | blog astro config, `test/preload.ts`                         |
| `sideEffects` declared for tree-shaking (`@repo/ui` CSS-only; data/config/   | package manifests                                            |
| marketplaces `false`)                                                        |                                                              |
| Admin search-param parser factories deduplicated                             | `apps/admin/src/lib/{order,console}-search.ts`               |
| Facet-index equivalence tests (indexed helpers ≡ linear helpers)             | `packages/data/test/post-routing-and-filters.test.ts`        |
| Facet-index microbenchmark                                                   | `scripts/benchmark-facet-index.mjs`                          |

## Addendum — third pass (server derivation + dead API surface)

A further pass closed out the remaining audit items:

| Decision                                                                    | Location                                                    |
| --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Filtered post sets cached per (R2 index object, canonical query) in a       | `filterBlogGridPostsCached` in blog-grid-data; index page + |
| bounded LRU — facet pages bypass the edge cache, so repeated filter URLs    | posts-grid API                                              |
| no longer re-run every matcher (or `extractIllustratorFilters`) per request |                                                             |
| Facet API body serialized once per index generation (`facetsJson`), not     | `getBlogGridDataset`; `/api/posts-grid?facets=1`            |
| `JSON.stringify` of ~230 KB per request                                     |                                                             |
| Free-text search corpus precomputed per post (WeakMap, `\u001f`-joined      | `postSearchCorpus` in blog-grid-data                        |
| lowercase fields) — replaces a fresh 9-field allocation + lowercase per     |                                                             |
| post per query                                                              |                                                             |
| Facet payload warmed at idle via `<link rel="prefetch" as="fetch">` so the  | `Layout.prefetchJson`; blog index                           |
| `client:interaction` island's first fetch is an HTTP-cache hit              |                                                             |
| Dead `sizes` prop removed from `RemoteImageWithFallback` and threaded       | remote-image-with-fallback, michi-scene-art-image + callers |
| wrappers (`MichiSceneArtImage`) — it was never rendered (no `srcSet`)       |                                                             |
| Store catalog memoized per region (60 s TTL + in-flight dedupe) — collapses | `apps/store/src/lib/catalog.ts`                             |
| navigation bursts into one Medusa round-trip while keeping prices fresh     |                                                             |
| `Intl.*` construction outside module scope banned by a hygiene test         | `tests/solid-hygiene.test.ts`; hoisted `TcgCardPriceLabel`  |

Deliberately deferred again: edge-caching facet HTML (unbounded query
cardinality — the LRU removes the origin cost instead), wholesale
destructure-prop cleanup in static blog components (pipeline-mirrored files),
admin route loaders for demo stores (real integrations required), facet
payload slimming (every field is consumed; prefetch + gzip already amortize).
