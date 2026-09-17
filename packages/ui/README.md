# @repo/ui

Shared, reusable UI for all Pink Binder apps. **Apps should not define components here** — they import from this package.

## Principles

- **Props-driven**: no hardcoded app URLs or brand copy; use `@repo/config` for defaults when needed.
- **Composable**: small primitives (`LandingSection`, `PostCard`) composed into feature components (`BlogGrid`, `MarketplaceListingsCarousel`).
- **Co-located modules**: skeletons, lazy wrappers, and section UI for one surface live in the same file when not reused elsewhere (see `.cursor/rules/monorepo-packages.mdc`).
- **Exported**: add public components to `src/index.ts` (and `src/server.ts` for server-only helpers).

## SolidJS conventions

This package is Solid-only — React/Preact/Next imports are lint-blocked, and
browser code may only read `@repo/data/client` (the server root and `src/`
internals are lint-blocked too).

- **Components run once.** Never destructure `props` — read through the
  reactive proxy (`props.x`) or wrap reads in `createMemo`, and apply defaults
  at the read site (`props.x ?? fallback`), not via destructuring.
- **Derive, don't sync.** Prefer `createMemo`/derived accessors over
  `createEffect` that copies one signal into another. Reserve `createEffect`
  for real side effects (DOM observers, listeners, timers, `localStorage`)
  and always pair them with `onCleanup` — or put the work in the event
  handler that caused it.
- **Zero-JS correctness.** Anything SSR'd into the static blog output must
  render meaningfully with no client runtime. Gate interactive affordances
  (buttons, live regions, persisted-state chrome) behind an `onMount` flag —
  see `mini-binder-spread.tsx` — instead of shipping dead controls.
- **Lists**: `<For>` for arrays (identity-tracked), `<Show>`/ternaries for
  conditionals; keep per-item subscriptions out of the item callback when a
  shared `createSelector` can serve them all.
- **Data**: signals + module-level caches (see `lib/blog-grid-query.ts`), not
  provider-coupled query clients — islands hydrate standalone.
- **Compat modules** (`compat-link`, `compat-image`, `compat-navigation`)
  exist only for API parity with consumers migrated from Next; prefer native
  `<a>`, `<img>`, `location`, and `window.zaraz` in new code.

## Layout

```
src/components/
  lazy/              # LazyWhenVisible
  landing/           # below-fold.tsx (marketplace + blog lazy sections)
  blog/              # blog-grid.tsx (+ BlogGridSkeleton), post chrome
  …                  # Primitives (button, card, carousel, …)
src/lib/             # cn, format-post-date
```

## Related packages

- `@repo/data` — posts, Pokémon, landing payload types
- `@repo/config` — URLs, brand, marketplace display config
- `@repo/marketplaces` — listing fetchers (called from app server actions)
