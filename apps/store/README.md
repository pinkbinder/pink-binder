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

## Local only

The storefront is **local-only for now**: the Medusa backend
([`pinkbinder/medusa`](https://github.com/pinkbinder/medusa)) has no hosted
environment, so `store` is excluded from both the production and preview
Cloudflare deploy matrices. Anything it did deploy would be a storefront with
no data source.

Run it locally against a local Medusa backend:

```bash
# in pinkbinder/medusa — start Postgres + the backend, then seed
docker compose up -d && bun run backend:seed

# in this repo
docker compose up -d --wait   # if you prefer the local Postgres here
bun run dev:store
```

`apps/store/.env.local` supplies `MEDUSA_BACKEND_URL` and
`MEDUSA_PUBLISHABLE_KEY` (placeholders live in `.env.example`).

To bring the store online later: host the backend, set the `MEDUSA_*` secrets
on the `store` Worker, then re-add `store` to the deploy matrices in
`.github/workflows/cloudflare-{production,preview}.yml`.

The Worker entry is `dist/server/entry.mjs` (Cloudflare adapter output);
`astro.wrangler.jsonc` drives adapter builds, `wrangler.jsonc` drives deploys.
