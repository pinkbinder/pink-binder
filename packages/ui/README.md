# @repo/ui

Shared, reusable UI for all Pink Binder apps. **Apps should not define components here** — they import from this package.

## Principles

- **Props-driven**: no hardcoded app URLs or brand copy; use `@repo/config` for defaults when needed.
- **Composable**: small primitives (`LandingSection`, `PostCard`) composed into feature components (`BlogGrid`, `MarketplaceListingsCarousel`).
- **Co-located modules**: skeletons, lazy wrappers, and section UI for one surface live in the same file when not reused elsewhere (see `.cursor/rules/monorepo-packages.mdc`).
- **Exported**: add public components to `src/index.ts` (and `src/server.ts` for server-only helpers).

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
