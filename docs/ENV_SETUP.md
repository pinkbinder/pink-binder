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

Sprites, scene art, and Blob upload live in the **`images`** command (~yearly). Transform only migrates JSON and applies CDN URLs.

**Weekly refresh:**

```bash
pnpm --filter @repo/data refresh
pnpm --filter @repo/data transform
```

**When sprites or scene art change (new species, art refresh):**

```bash
cd apps/blog && vercel env pull .env.local   # ensures BLOB_READ_WRITE_TOKEN
pnpm --filter @repo/data images              # sprites, artofpkm, backfill, Blob upload
pnpm --filter @repo/data transform           # normalized JSON + URL patch
```

Re-runs are safe — unchanged files are skipped at each step. Step 5 removes local `cache/images/` after validating every file is in `blob-manifest.json` (use `--skip-cleanup` to keep local copies).

Requires `BLOB_READ_WRITE_TOKEN` in `apps/blog/.env.local` for `images` publish (step 4). Apply URLs (transform) reads the manifest only — no token.

### Sharing `blob-manifest.json` across machines

| Artifact | Commit to git? | Why |
| -------- | -------------- | --- |
| `cache/normalized/species/*.json` | **Yes** (already) | Apps read Blob URLs from here at runtime |
| `cache/blob-manifest.json` | **Recommended for teams** | Lets others run `transform` (apply URLs) and `images` publish skips without re-uploading |
| `cache/images/` | **No** | Staging only; cleaned up after publish |

The manifest is large (~10k+ entries) but changes infrequently (annual image runs). Without it, `transform` step 2 exits early and cannot refresh `art.sprites` / `sceneArt` from CDN paths.

To commit: remove `/blob-manifest.json` from `packages/data/cache/.gitignore`, then add the file. Teammates who only run weekly `refresh` + `transform` for metadata do not need the manifest if species JSON in git already has current art URLs.

## Reference

See [`.env.example`](../.env.example) for the full variable list (comments only — no real values).
