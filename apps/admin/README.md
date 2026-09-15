# Admin — TanStack Start (Solid) dashboard on Cloudflare Workers

TanStack Start admin dashboard showcasing the repo's state-management stack:

- **TanStack Router (Solid)** — file-based routes (`src/routes/`), typed
  search via `validateSearch`, SSR loaders with `ensureQueryData` prefetch.
- **TanStack Solid Query** — server-state cache with a per-request server
  client and a browser singleton
  (`src/integrations/tanstack-query/root-provider.tsx`), hydrated via
  `@tanstack/solid-router-ssr-query`.
- **Router search params** — shareable URL filter state (`?status=`, `?q=`)
  through `validateSearch` + `Route.useSearch()`/`useNavigate`, with
  `stripSearchParams` keeping default values out of the URL.
- **Solid stores** — client-only preferences + table selection
  (`src/stores/preferences.ts`); server code never imports them.

## Develop

```bash
bun install
bun --filter @repo/admin dev         # http://localhost:3003
```

## Validate

```bash
bun --filter @repo/admin type-check
bun --filter @repo/admin lint
bun test apps/admin
```

## Deploy

```bash
bun run build:cloudflare -- admin
bunx wrangler deploy --config apps/admin/wrangler.jsonc
```

The Worker entry is `@tanstack/solid-start/server-entry` (Cloudflare Vite
plugin output). API data goes through `src/routes/api.orders.ts` and
`src/server/orders.ts` (server functions run on the Worker, never in the
browser bundle).
