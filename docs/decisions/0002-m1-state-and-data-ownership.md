# ADR 0002: M1 state and data ownership

- Status: accepted
- Date: 2026-09-08
- Scope: M1 issues #214, #215, #216, #217, and #218
- Executable contract: [`../baselines/m1-state-data.json`](../baselines/m1-state-data.json)
- Supersedes: the blog grid row in ADR 0001

## Decision

Pink Binder adopts TanStack Query and nuqs only for the blog's interactive,
remote-backed catalog paths. It does not adopt Zustand in M1. The evaluated
client state is component-scoped and has no shared write lifecycle, persistence
requirement, or cross-route consumer; introducing a store would add a second
owner rather than remove one.

The ownership rule is singular: the URL owns shareable filter state, TanStack
Query owns client request/cache state, the server owns source filtering and the
SSR seed, and React component state owns transient presentation state. A value
must not be mirrored between those owners.

## Ownership decision table

| State class        | Owner                                                                           | Persistence and hydration                                                                                                        | Adopted path                                                                                         | Explicit non-candidates                                                                                     |
| ------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Local presentation | React component state                                                           | Component lifetime only; never serialized                                                                                        | Dialog visibility, accordion expansion, carousel position, gallery visible count, focus announcement | Do not mirror in URL, Query, or a global store                                                              |
| Shared client/UI   | Zustand only after a named cross-component write requirement exists             | A per-request vanilla store for SSR; opt-in versioned storage only when the product requires persistence; reset factory in tests | None in M1                                                                                           | Landing share dialog, responsive navigation, theme, mini binder, blog controls, static admin/store fixtures |
| Server state       | Server components and route handlers; TanStack Query after a client consumes it | Serialize one initial page through component props; prefetch/dehydrate only when multiple queries justify its bundle cost        | Blog grid pages and on-demand card gallery manifests                                                 | Landing random featured post, marketplace server action, R2 index reader, static admin/store fixtures       |
| Client cache       | TanStack Query                                                                  | Browser memory only; no persisted cache                                                                                          | Blog grid: 5-minute stale/30-minute GC; gallery manifests: 24-hour stale/30-minute GC                | Edge/CDN/R2 caches remain owned by their existing server layers                                             |
| Filters            | nuqs URL state                                                                  | Server parser and client adapter share the same typed parsers                                                                    | Blog tag, direct, type, generation, list, illustrator, expansion, Pokémon, theme filters             | No duplicate React or Zustand filter object                                                                 |
| Pagination         | TanStack Query page params                                                      | Initial page becomes Query `initialData`; later offsets are ephemeral                                                            | Blog infinite grid and gallery reveal count                                                          | Not placed in the URL because an intersection-driven viewport offset is not a stable page destination       |
| Sorting            | Existing server/content order                                                   | No client persistence                                                                                                            | Newest-first blog/card source order remains unchanged                                                | No current user-selectable sort to migrate                                                                  |
| Shareable URL      | nuqs with validated canonical values                                            | `history: push`, shallow updates, no scroll reset; server loader handles refresh/SSR                                             | Blog catalog filters, including legacy `collection` read compatibility                               | Store, gallery, and admin have no current search/filter workflow                                            |

## Four-app lifecycle policy

| App     | SSR and hydration                                                                                                                                                                                            | Invalidation, retry, and cancellation                                                                                                                                                                                                                                  | Loading and error behavior                                                                                                                                                                   | Migration and rollback                                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blog    | The server parses and validates filters, filters source posts, and serializes the exact canonical first page. The client seeds that Query key with `initialData` and does not issue a duplicate first fetch. | Query defaults retry reads twice and mutations zero times. Blog fetches receive the Query abort signal. Grid entries are stale after 5 minutes; gallery manifests after 24 hours. Explicit invalidation or a stale reconnect refetches. Window focus does not refetch. | Existing streamed skeleton, empty catalog, inline recoverable grid error, retained cards on gallery failure, and load-more states remain. Stale data remains visible during background work. | Provider is confined to `apps/blog`; query and URL helpers are confined to `@repo/ui`. Roll back together by reverting ADR 0002's feature commit, restoring the former BlogGrid request effect and gallery loader. Server routes and edge caches are unchanged. |
| Landing | Server rendering and the existing visibility-triggered server action remain; no client hydration cache is added.                                                                                             | Marketplace timeout/revalidation/null-on-failure remain in `@repo/marketplaces`; the random featured post remains no-store.                                                                                                                                            | Existing loading, empty, and provider-failure UI remains.                                                                                                                                    | No M1 runtime migration. Re-evaluate only after repeat navigation data demonstrates a client cache benefit.                                                                                                                                                     |
| Store   | Static server fixture; no hydration state.                                                                                                                                                                   | No request, invalidation, retry, mutation, or cache lifecycle exists.                                                                                                                                                                                                  | Existing static catalog shell remains.                                                                                                                                                       | No M1 runtime migration. Add URL/query/store ownership only with the future cart/catalog backend.                                                                                                                                                               |
| Admin   | Static server fixture; no hydration or auth state.                                                                                                                                                           | No request, invalidation, retry, mutation, or cache lifecycle exists.                                                                                                                                                                                                  | Existing static dashboard shell remains.                                                                                                                                                     | No M1 runtime migration. Authentication and remote data require their own product model and tests first.                                                                                                                                                        |

## TanStack Query contract

The blog owns one browser `QueryClient`; server renders create request-local
clients. The single blog grid query is hydrated through `initialData`, which
serializes less client code than a dehydration boundary while retaining the
same no-refetch contract. A prefetch/dehydrate boundary was measured and
rejected because it raised initial JavaScript 12.96%, above the 10% M0 gate;
the selected path is 9.64% above control. Query keys are factories, not inline
arrays at call sites:

- `['blog-grid', canonicalQueryString]` owns filtered grid pages. The canonical
  string has stable field order and excludes rejected facets.
- `['card-gallery', kind, slug]` owns a validated manifest. Expansion manifests
  retain the route's existing kind exception.

The grid's superseded requests are cancelled through the provided abort signal.
The gallery request is disabled until “Show more” is selected. Failed requests
retain already-rendered content and can be retried. Offline requests follow
TanStack Query's default online network mode; stale active queries retry on
reconnect. This client cache does not replace `/api/posts-grid` CDN caching,
`/api/card-gallery` edge/R2 caching, the R2 index cache, React request memoization,
or marketplace provider revalidation.

No current client mutation exists in content, gallery, marketplace, store,
authentication, or admin flows, so M1 adds no mutation wrapper or speculative
invalidation. The provider's mutation retry default is zero for a future,
explicit mutation design.

## nuqs contract

The server and client import the same parsers. Values are trimmed and bounded to
120 characters. Enumerated facets must exist in the server-provided catalog;
invalid values resolve to the unfiltered canonical state. Legacy `collection`
and direct/tag aliases are read and promoted, while new writes use `themes` and
the canonical typed fields. Updates push a browser-history entry, are shallow,
preserve scroll, and remain deep-linkable across refresh, back, and forward.

nuqs is the only filter owner. BlogGrid derives controls, links, query keys, and
requests directly from URL state; it keeps no mirrored filter state or router
effect. Pagination remains in Query because automatically loaded offsets do not
identify a durable shareable view.

## Zustand evaluation and future pattern

M1 found no justified Zustand migration. A future adoption requires all of:

1. at least two independent consumers with a shared write lifecycle;
2. evidence that lifting or composition is less stable than a store;
3. a vanilla store factory created per SSR request, narrow selectors, immutable
   actions, and an exported reset/test seam;
4. no URL, Query, server, or component owner for the same value; and
5. separately justified, versioned persistence with migration and hydration
   behavior tested.

Theme, navigation, cart, catalog, admin, and content behavior are unchanged in
M1. Store/admin labels are fixtures, not evidence of a state domain.

## Removed duplication and measured request behavior

BlogGrid's manual `AbortController`, loading/error fields, accumulated posts,
pagination fields, router serialization effect, and fetch effect are removed.
The card gallery's manual manifest ref, availability/loading/error fields, and
fetch wrapper are removed. The server filter function and the two existing API
routes remain authoritative.

Deterministic regression tests establish the request delta:

| Scenario                    |                                                                              Before |                                                         After | Gate                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------: | ------------------------------------------------------------: | -------------------------------------------------------------------- |
| Blog SSR hydration          | One server source read plus a client request/effect risk when URL state initializes | Zero client request for the serialized canonical initial page | Test asserts no `fetch` on matching filtered hydration               |
| Repeat fresh blog query key |                                            Manual loader had no shared client cache |                  One request within the 5-minute stale window | Test fetches the same key twice and observes one query function call |
| Explicit blog invalidation  |                                                                 Ad hoc effect rerun |                                Exactly one subsequent request | Test invalidates then observes a second query function call          |
| Gallery remount and expand  |                                            One manifest request per component mount |        One request per source within the 24-hour stale window | Test remounts with the same client and observes one fetch total      |

The exact-start `79c538849` control and M1 candidate used the same route fixture,
Chrome/Lighthouse versions, local production server, and three cold runs per
profile. Mobile LCP improved from 2,260 ms to 2,109 ms; desktop LCP improved
from 587 ms to 527 ms. CLS stayed zero and performance/accessibility scores,
CSS bytes, and content stayed unchanged. Initial JavaScript increased from
213,688 to 234,295 bytes (+9.64%), total transfer increased 4.05% mobile and
2.14% desktop, and initial requests increased by two while remaining inside the
45/55 request budgets. The two chunks implement the measured client cache and
typed history behavior; repeated filters and history navigation eliminate
requests as shown above. `/api/posts-grid?limit=9` retained the M0 payload
(10,726 bytes), one-request behavior, and cache contract. All values remain
inside the ADR 0001 promotion gates.

## Verification matrix

- Unit/interaction tests cover canonical parsing, legacy aliases, invalid
  values, history options, SSR initial-data hydration without refetch, cancellation signal,
  deduplication, explicit invalidation, gallery cache reuse, loading, and error.
- Headless browser verification covers desktop and 390px mobile filter updates,
  refresh persistence, browser back/forward restoration, invalid-query fallback,
  and load more.
- Full repository tests and all four Next/OpenNext builds protect landing,
  marketplace, store, admin, content generation, route handlers, and edge cache
  contracts.
- A reconnect uses the query client's default refetch-on-reconnect policy; stale
  data remains rendered while a background refetch is pending. No offline
  persistence claim is made.

## Consequences

M1 adds two narrowly scoped runtime dependencies to the blog and shared UI
packages. It removes duplicated client request machinery without changing API
schemas or server cache ownership. The most important constraint is also a
negative decision: Zustand, additional Query providers, and additional URL
owners remain absent until a real state lifecycle justifies them.
