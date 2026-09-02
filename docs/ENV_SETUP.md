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

Next.js loads each app's `.env.local` when that app runs. You do **not** need a root `.env.local` unless you want local-only overrides.

## Where variables live

| Scope                         | Location                                          | Notes                                                        |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Landing (eBay, Etsy, Whatnot) | `apps/landing/.env.local`                         | Stored in Cloudflare Worker `landing` (R2 + secrets)         |
| Blog (Zaraz, R2)              | `apps/blog/.env.local`                            | Stored in Cloudflare Worker `blog` (R2 + secrets)            |
| Data scripts (R2 upload)      | `apps/blog/.env.local` or `CLOUDFLARE_ACCOUNT_ID` | `@repo/data` publish scripts use R2 (images.pinkbinder.shop) |
| Optional overrides            | Root `.env.local`                                 | Legacy; merged by `scripts/with-env.mjs` only                |

Duplicate shared keys (e.g. `NEXT_PUBLIC_BLOG_URL`) on each Cloudflare Worker that needs them (via `wrangler secret put`).

## Server vs client

**Server-only** (default) — API routes, server components, scripts:

```env
EBAY_APP_ID=
EBAY_CLIENT_SECRET=
```

**Client-visible** — must use `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_BLOG_URL=
```

Never put secrets in `NEXT_PUBLIC_*` variables.

## Root scripts and Turbo

`bun run validate` / `bun run build` run via `scripts/with-env.mjs`, which merges an optional root `.env.local` then starts Turbo. Turbo passes through env listed in `turbo.json` (`EBAY_*`, `NEXT_PUBLIC_*`, etc.).

Each Next.js app still loads its own `.env.local` at runtime.

## Image publish pipeline

Sprites, scene art, and Blob upload live in the **`images`** command (~yearly). Transform only migrates JSON and applies CDN URLs.

**Daily TCG prices + roundup caches:**

```bash
bun --filter @repo/data refresh
```

(`refresh` is an alias for `transform --only prices`.)

**When new sets or generations ship (catalog metadata only):**

```bash
bun --filter @repo/data extract --only pokemontcg tcgdex
bun --filter @repo/data transform
bun --filter @repo/data refresh
```

**When sprites or scene art change (new species, art refresh):**

```bash
# R2 uses CLOUDFLARE_ACCOUNT_ID + wrangler OAuth.
bun --filter @repo/data images              # sprites, artofpkm, backfill, R2 upload
bun --filter @repo/data transform           # normalized JSON + URL patch
```

Re-runs are safe — unchanged files are skipped at each step. Step 5 removes local `cache/images/` after validating every file is in `blob-manifest.json` (use `--skip-cleanup` to keep local copies).

Requires Cloudflare Wrangler authentication (or R2 S3 API credentials) for `images` publish. Apply URLs (transform) reads the manifest only — no credentials.

### Sharing `blob-manifest.json` across machines

| Artifact                          | Commit to git?            | Why                                                                                      |
| --------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| `cache/normalized/species/*.json` | **Yes** (already)         | Apps read R2 URLs from here at runtime                                                   |
| `cache/blob-manifest.json`        | **Recommended for teams** | Lets others run `transform` (apply URLs) and `images` publish skips without re-uploading |
| `cache/images/`                   | **No**                    | Staging only; cleaned up after publish                                                   |

The manifest is large (~10k+ entries) but changes infrequently (annual image runs). Without it, `transform` step 2 exits early and cannot refresh `art.sprites` / `sceneArt` from CDN paths.

`blob-manifest.json` is intentionally tracked. Teammates who only run the prices group do not need it if species JSON in git already has current art URLs.

## Reference

See [`.env.example`](../.env.example) for the full variable list (comments only — no real values).
