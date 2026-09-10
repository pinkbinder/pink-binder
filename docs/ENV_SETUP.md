# Environment Variables

Secrets live in **Cloudflare Workers** (per app, via `wrangler secret`). Local dev uses `.env.local` per app.

## Quick start

```bash
# Secrets are stored in Cloudflare Workers per app (Pink Binder account e9b73b1b6c312b889732f29b884a5166)
# Pull via wrangler or copy from dashboard:
#   CLOUDFLARE_ACCOUNT_ID=e9b73b1b6c312b889732f29b884a5166 bunx wrangler secret list --name landing
# For local dev, ensure apps/landing/.env.local and apps/blog/.env.local exist (ask team or copy from dashboard)
```

From the repo root, start dev as usual:

```bash
bun dev            # all apps (turbo)
bun dev:landing    # landing only
bun dev:blog       # blog only
```

Each app loads its own `.env.local` when it runs (Vite for store/admin, Astro for landing/blog). You do **not** need a root `.env.local` unless you want local-only overrides.

## Where variables live

| Scope                         | Location                  | Notes                                                |
| ----------------------------- | ------------------------- | ---------------------------------------------------- |
| Landing (eBay, Etsy, Whatnot) | `apps/landing/.env.local` | Stored in Cloudflare Worker `landing` (R2 + secrets) |
| Blog (Zaraz, R2)              | `apps/blog/.env.local`    | Stored in Cloudflare Worker `blog` (R2 + secrets)    |
| Optional overrides            | Root `.env.local`         | Legacy; merged by `scripts/with-env.mjs` only        |

Duplicate shared keys (e.g. `PUBLIC_BLOG_URL`) on each Cloudflare Worker that needs them (via `wrangler secret put`). `NEXT_PUBLIC_*` names remain accepted as a legacy fallback (see `packages/config/src/site-urls.ts`).

## Server vs client

**Server-only** (default) — API routes, server functions, scripts:

```env
EBAY_APP_ID=
EBAY_CLIENT_SECRET=
```

**Client-visible** — must use `PUBLIC_` (Vite exposes these to the browser):

```env
PUBLIC_BLOG_URL=
```

Never put secrets in `PUBLIC_*` variables.

## Root scripts and Turbo

`bun run validate` / `bun run build` run via `scripts/with-env.mjs`, which merges an optional root `.env.local` then starts Turbo. Turbo passes through env listed in `turbo.json` (`EBAY_*`, `PUBLIC_*`, etc.).

Each app still loads its own `.env.local` at runtime.

## Content pipeline (private data service)

Blog and Pokémon data generation, the extract/transform pipeline, and the R2
publish + render scripts live in the **private** `pinkbinder/blog-pipeline`
repository. This monorepo only contains the public-safe `@repo/data` client
surface (types and pure helpers) plus the apps; published artifacts and
prebuilt article HTML are consumed from the `pink-binder` R2 bucket at request
time. See that repository's README for pipeline, rendering, and publish
credentials.

## Reference

See [`.env.example`](../.env.example) for the full variable list (comments only — no real values).
