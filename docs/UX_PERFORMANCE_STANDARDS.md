# UX Performance Standards

These are the operating standards for building Pink Binder interfaces so the
apps feel instantaneous: navigation is prefetched before it is clicked, data
loads in priority order, and every millisecond of client work is spent on what
the user is actually doing. They apply to every Solid surface — the admin
console (TanStack Solid Start), the Astro islands in blog/store, and the
shared `@repo/ui` kit. Record deviations in an ADR, not in review threads.

Adopted by [ADR 0005](decisions/0005-solid-ux-performance-standards.md) after
the post-migration Solid audit (2026-09-15). State ownership rules live in
[ADR 0002](decisions/0002-m1-state-and-data-ownership.md); this doc defines how
each owner must _behave_, not who owns what.

## 1. Solid is not React

The migration removed React, not React habits. These rules are correctness
rules, not style preferences — violating them silently breaks reactivity.

### Props are a reactive proxy — never destructure them

```tsx
// ✗ React idiom — destructuring detaches the value from the reactive graph,
//   and default parameters only evaluate once at call time.
function BlogGrid({ posts, total, initialQuery = {} }: Props) { ... }

// ✓ Read through the proxy; apply defaults at the read site.
function BlogGrid(props: Props) {
  const initialQuery = () => props.initialQuery ?? {}
}
```

- Exception: leaf components that receive fully static values — server-rendered
  components in Astro pages and components invoked inside a `For`/`Show`
  callback — may destructure because nothing reactive can reach them. When in
  doubt, use the proxy; the cost is two characters.
- Strip or alias prop groups with `splitProps`/`mergeProps` (see
  `packages/ui/src/components/button.tsx`), never with rest destructuring of
  plain objects.

### Values are functions

Signals, memos, props, and store fields are accessed by call: `q()`, not `q`.
A component that reads a value once into a local `const` at setup time has
frozen it. Wrap derived data in `createMemo` (it is cached _and_ reactive),
not in a plain function that recomputes for every consumer.

### Effects are for the outside world

`createEffect` is for DOM imperatives and subscriptions Solid cannot see
(document classes, `IntersectionObserver`, analytics side effects). Data
transformation belongs in `createMemo`; event handlers belong in event
handlers. Every effect that subscribes to something external must register
`onCleanup` — timers, observers, listeners, aborts (see
`blog-reading-progress.tsx` for the pattern). An effect that re-applies what
a reactive binding already does (e.g. writing `input.value` where `value` is
bound to the same store) is redundant — delete it rather than guard it.

### Rendering primitives

- Lists render through `<For>` (keys by item reference), primitives through
  `<Index>`. A bare `.map()` is allowed only for static server-rendered
  content that can never update.
- Branching uses `<Show>`/`<Switch>` with the callback child pattern
  (`{(value) => ...}`) when narrowing. Ternaries in JSX are acceptable only
  for trivial string/class swaps.
- Never call a component as a function to "render" it — that executes outside
  the reactive owner graph. Always use JSX.

### Cleanup and batching

Every `addEventListener`, `setTimeout`, `requestAnimationFrame`, observer, or
`AbortSignal` gets an `onCleanup`. Multi-signal updates that trigger layout go
through `batch()` or a single `createStore` write (`produce` for deep updates,
see `stores/inventory.ts`). Cross-island shared state uses nanostores
(`@nanostores/solid`); never a module-level Solid signal in an Astro island.

## 2. Navigation must be instantaneous

The admin console is the reference implementation.

- **Routes preload on intent.** `defaultPreload: 'intent'` +
  `defaultPreloadStaleTime: 0` (hover/focus starts the loader before the
  click). Never opt a route out without a reason recorded in code.
- **Every route is its own chunk.** `autoCodeSplitting: true` in
  `tsr.config.json`; route-level `lazy`/dynamic import for below-the-fold
  islands. The entry chunk grows only with shared chrome.
- **URL owns shareable state** (ADR 0002). Filters round-trip through
  `validateSearch` + `stripSearchParams` so deep links, Back/Forward, and
  refresh are exact — never mirror route params into signals.
- **Text inputs never write history per keystroke.** Typing commits through
  the debounced input (`apps/admin/src/components/debounced-input.tsx`,
  300 ms idle, immediate on Enter/blur; external value changes always win).
  In islands without a router, text params use `history.replaceState` and
  discrete filter changes use `pushState` (see `buildCatalogUrl` in the store).
- **Loading is honest and shape-stable.** Every async route declares
  `pendingComponent` (or a `Suspense` fallback matching final layout);
  paged/filtered queries use `keepPreviousData` so the page never flashes
  empty while refetching.
- **Caches are deliberate.** Browser `QueryClient` is a singleton with
  `staleTime` 60 s (admin) / 5 min (blog) and `gcTime` 10–30 min;
  `refetchOnWindowFocus: false`; loaders go through
  `queryClient.ensureQueryData` so SSR-prefetched data never refetches on
  mount.

## 3. Load in priority order

1. **Server-render everything above the fold.** HTML arrives usable; islands
   hydrate _after_ paint.
2. **Defer island hydration to the moment it is needed** — `client:interaction`
   for controls below the fold (blog grid), `client:visible` for
   scroll-revealed content, `client:load` only for header-level chrome (store
   header/cart).
3. **Fetch heavy secondary data after hydration.** Facet catalogs (2k+
   entries) load from the CDN-cached API on demand instead of serializing
   ~230 KB into every page (`BlogGridIsland`).
4. **One eager image per view.** The first card (LCP candidate) gets
   `loading="eager" fetchpriority="high"`; everything else is `lazy` +
   `decoding="async"`. Never mark two images eager on one page.
5. **Skeletons match final layout** — same grid, same card aspect — so
   loading never shifts content (CLS ≈ 0 is the bar).

## 4. Assets

- Images declare `width`/`height` (or an `aspect-*` frame) — no layout
  contribution from loading.
- Blog-owned images use prebuilt R2 WebP variants (`pokemonR2ImageVariantUrl`
  / `...Candidates`); upstream CDNs are fallback-only.
- Icons come from `lucide-solid` named imports only (tree-shaken per icon);
  no icon-font or barrel-prefetch patterns.
- Render-blocking CSS is the framework's single stylesheet; no inline
  `<style>` blocks in islands.

## 5. Component budgets

- **Dropdowns window their options.** A popover mounts at most ~100 rows
  (`SearchableSelect` `renderLimit`) with a "keep typing" hint; selection
  display always reads the full option list. A 2k-node mount inside a
  click-to-open popover is a bug.
- **Long lists paginate by viewport.** Infinite scroll via
  `IntersectionObserver` with `rootMargin` pre-roll (blog grid loads ~480 px
  before the sentinel). Virtualize only when a single view must mount >500
  live rows.
- **Catalog lookups are indexed once per payload.** A helper that resolves by
  scanning a list (`find`/`includes`) and runs per interaction or per rendered
  item gets a `Map`/`Set` built in one pass — `buildBlogFacetIndex` is the
  reference (tag-catalog resolution dropped from ~665 ms of scans per filter
  commit to sub-millisecond reads). On the server, derive such indexes once
  per source object behind a `WeakMap` (`getBlogGridDataset`), not once per
  request.
- **Per-row work shares loop-invariant computation.** Strings/maps every row
  of a `<For>` needs are computed in one memo and concatenated per row (see
  `filterQuerySuffix` in `blog-grid`), never rebuilt inside each child.
- **Store writes persist on real change only.** localStorage subscriptions
  compare the persisted slice before writing — unrelated fields updating the
  same atom must not rewrite storage (see `apps/store` cart).
- **Hot paths don't construct formatters.** Hoist `Intl.*` instances to module
  scope, or use the arithmetic formatters in table cells
  (`lib/format.ts#formatAmountCents`).
- **No hydration-mismatch theater.** Server and client first render must match
  (localStorage-gated UI renders an empty shell until mount — see
  `CartPage`); mismatch means flicker.

## 6. Pre-merge checklist

- [ ] No destructured props in any component that receives dynamic/reactive
      props; no prop default parameters.
- [ ] Every subscription/timer/observer has `onCleanup`.
- [ ] New route: `pendingComponent`, `loader` via `ensureQueryData`,
      `stripSearchParams` defaults, code-split chunk confirmed in build output.
- [ ] Text search: debounced commit; URL writes use replace (text) / push
      (discrete filters).
- [ ] Lists: `<For>`; >100 mounted rows from one interaction needs a window.
- [ ] Images: explicit dimensions, one eager candidate per view, WebP variant.
- [ ] Large option lists and paged lists respect the interaction budgets
      (§5) — `tests/solid-hygiene.test.ts` enforces §1 mechanically.
- [ ] `bun run validate` + affected app builds green; admin bundle sizes
      within budget via `bun run performance`.
