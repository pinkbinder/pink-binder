# Store — TanStack Start storefront on Cloudflare Workers

TanStack Start storefront showcasing the repo's state-management stack:

- **TanStack Router** — file-based routes (`src/routes/`), typed search via
  `validateSearch`, SSR loaders with `ensureQueryData` prefetch.
- **TanStack Query** — server-state cache with a per-request server client and
  a browser singleton (`src/integrations/tanstack-query/root-provider.tsx`),
  hydrated via `@tanstack/react-router-ssr-query`.
- **nuqs** — shareable URL filter state (`?q=`, `?category=`) through the
  first-party `nuqs/adapters/tanstack-router` adapter.
- **Zustand** — client-only cart store with `persist` + scoped selectors
  (`src/stores/cart.ts`); server code never imports it.

## Develop

```bash
bun install
bun --filter @repo/store dev        # http://localhost:3001
```

## Validate

```bash
bun --filter @repo/store type-check
bun --filter @repo/store lint
bun test apps/store
```

## Deploy

```bash
bun run build:cloudflare -- store
bunx wrangler deploy --config apps/store/wrangler.jsonc
```

The Worker entry is `@tanstack/react-start/server-entry` (Cloudflare Vite
plugin output). Static assets are served from the build output; API data goes
through `src/routes/api.catalog.ts` and `src/server/catalog.ts` (server
functions run on the Worker, never in the browser bundle).
