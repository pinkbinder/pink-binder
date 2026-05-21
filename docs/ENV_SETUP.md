# Environment Variables

Secrets live in **Vercel** (per project). Local dev uses `vercel env pull` into each app directory.

## Quick start

```bash
# One-time: link a project (from the app folder)
cd apps/landing
vercel link

# Pull Development env into that app (creates apps/landing/.env.local)
vercel env pull .env.local

# Repeat for other apps you run locally, e.g. apps/blog
cd ../blog
vercel link
vercel env pull .env.local
```

From the repo root, start dev as usual:

```bash
pnpm dev          # all apps
pnpm dev:landing  # landing only
pnpm dev:blog     # blog only
```

Next.js loads each app's `.env.local` when that app runs. You do **not** need a root `.env.local` unless you want local-only overrides.

## Where variables live

| Scope | Location | Notes |
| ----- | -------- | ----- |
| Landing (eBay, Etsy, Whatnot) | `apps/landing/.env.local` | Pulled from the landing Vercel project |
| Blog (GTM, Blob token) | `apps/blog/.env.local` | Pulled from the blog Vercel project |
| Data scripts (Blob upload) | `apps/blog/.env.local` | `@repo/data` publish scripts read the blog token |
| Optional overrides | Root `.env.local` | Legacy; merged by `scripts/with-env.mjs` only |

Duplicate shared keys (e.g. `NEXT_PUBLIC_BLOG_URL`) on each Vercel project that needs them.

## Server vs client

**Server-only** (default) — API routes, server components, scripts:

```env
EBAY_APP_ID=
EBAY_CLIENT_SECRET=
BLOB_READ_WRITE_TOKEN=
```

**Client-visible** — must use `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_BLOG_URL=
```

Never put secrets in `NEXT_PUBLIC_*` variables.

## Root scripts and Turbo

`pnpm validate` / `pnpm build` run via `scripts/with-env.mjs`, which merges an optional root `.env.local` then starts Turbo. Turbo passes through env listed in `turbo.json` (`EBAY_*`, `NEXT_PUBLIC_*`, etc.).

Each Next.js app still loads its own `.env.local` at runtime.

## Image publish pipeline

After extract, run the full transform pipeline (pokeapi → normalized, Blob upload, URL patch):

```bash
cd apps/blog && vercel env pull .env.local   # ensures BLOB_READ_WRITE_TOKEN
pnpm --filter @repo/data transform
```

Runs three steps in order: pokeapi → normalized JSON, Blob upload, URL patch. Re-runs are safe — unchanged files are skipped at each step.

Requires `BLOB_READ_WRITE_TOKEN` in `apps/blog/.env.local` for steps 2–3.

## Reference

See [`.env.example`](../.env.example) for the full variable list (comments only — no real values).
