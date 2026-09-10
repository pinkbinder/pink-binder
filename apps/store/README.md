# Store — Astro storefront on Cloudflare Workers, backed by Medusa

Astro storefront built on the astro-medusa-starter stack:

- **Medusa SDK singleton** (`src/lib/sdk.ts`) — direct Store API calls from
  env vars `MEDUSA_BACKEND_URL` / `MEDUSA_PUBLISHABLE_KEY`;
  no query-cache library.
- **Server-fetched catalog** (`src/lib/catalog.ts`) — product listing is
  fetched in page frontmatter on the Worker; islands receive data as props.
- **Nanostores cart** (`src/stores/cart.ts`) — client-only cart persisted to
  localStorage, hydrated once on island mount.
- **Astro middleware** (`src/middleware.ts`) — shared security headers plus
  cookie-driven Medusa region resolution (defaults to USD).

Products carry display context as tags (`category:…`, `badge:…`,
`marketplace:…`) because the Medusa Store API does not expose product
metadata. See the [`medusa`](https://github.com/pinkbinder/medusa) backend repo for the seed script and setup.

## Develop

```bash
bun install
bun --filter @repo/store dev        # http://localhost:3001
```

Requires a running Medusa backend from the `medusa` repo on `:9000` — copy
`.env.example` to `.env.local` and fill in the publishable key.

Note: `astro dev` currently trips over a Vite dep-optimizer reload in the
Cloudflare adapter (`program reload` → missing chunk). Until that is fixed
upstream, validate with `bun run build` + `bunx wrangler dev --config
wrangler.jsonc --port 3001`.

## Validate

```bash
bun --filter @repo/store type-check   # astro check
bun --filter @repo/store lint
bun test apps/store
```

## Deploy

```bash
bun run build:cloudflare -- store
bunx wrangler deploy --config apps/store/wrangler.jsonc
```

The Worker entry is `dist/server/entry.mjs` (Cloudflare adapter output);
`astro.wrangler.jsonc` drives adapter builds, `wrangler.jsonc` drives deploys.
The backend has no production hosting yet — the deploy target expects
Medusa env vars to point at a real backend before launch.
