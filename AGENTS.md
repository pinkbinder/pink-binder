# AGENTS.md — Pink Binder

Guidance for AI agents and contributors working in this repo. For deeper project-specific rules see [`.cursor/rules/`](.cursor/rules/).

## What this is

Pink Binder is a Next.js 15 (App Router) Turborepo monorepo for an online Pokémon TCG shop and brand. It runs four thin apps (landing, store, blog, admin) on Vercel and a shared `@repo/data` ETL pipeline that produces local JSON consumed at render time.

## Stack & toolchain (pinned)

- Node `24.18.0`, Bun `1.3.14` (use [`mise`](https://mise.jdx.dev/) — pins in `mise.toml`; CI uses `jdx/mise-action`)
- Next.js `16.2.10`, React `19.2.7`, TypeScript `6.0.3`
- Tailwind CSS v4, ShadCN / Radix UI (in `@repo/ui`)
- Turborepo `2.10.5`, ESLint v9 (flat config), Prettier `3.9.5`
- Test runner: **Bun's built-in `bun test`** (not Vitest/Jest). DOM via `happy-dom`; preload scripts in `test/preload.ts` + `test/setup.ts`.
- Lockfile: `bun.lock` — use `bun install --frozen-lockfile` in CI-style runs.

Repo scripts go through `scripts/with-env.mjs`, which merges an optional root `.env.local` via `scripts/load-monorepo-env.mjs` before invoking Turbo.

## Common commands

All commands are `bun …` at the repo root unless noted.

```bash
# Setup
bun install
# (then per app) cd apps/landing && vercel link && vercel env pull .env.local

# Dev (kills ports 3000-3003 first, then runs turbo)
bun dev                # all apps
bun dev:landing        # only @repo/landing
bun dev:blog           # only @repo/blog

# Validate (format + lint + type-check) and build
bun validate           # turbo: format + lint + type-check
bun build              # turbo build
bun type-check         # turbo type-check
bun lint               # turbo lint
bun format:fix         # prettier --write (run before commit)

# Tests (bun test, isolated)
bun test               # all
bun test packages/data # single package
bun test:coverage      # all with coverage (writes to ./coverage)
```

Never edit generated artifacts: `packages/data/cache/`, `apps/blog/public/data/card-galleries/`, `apps/blog/public/data/expansion-galleries/`. They are gitignored and rebuilt by the pipeline.

## Repository layout

```
apps/             Thin Next.js apps — routing, metadata, API routes, wiring only
  landing/        port 3000 — landing page; eBay, Etsy, Whatnot integrations
  store/          port 3001 — online store
  blog/           port 3002 — CMS-backed blog; reads pre-generated JSON
  admin/          port 3003 — admin dashboard
packages/
  ui/             @repo/ui — shared ShadCN components (see ui-components rule)
  data/           @repo/data — ETL pipeline + blog loaders + normalized cache
  config/         @repo/config — site URLs, brand, env-backed config
  marketplaces/   @repo/marketplaces — eBay / Etsy / TCGplayer / Whatnot clients
  eslint-config/  @repo/eslint-config (base | library | next | react-internal)
  typescript-config/  @repo/typescript-config
scripts/          Repo-wide Node helpers (env loader, port killer, next config)
docs/             ENV_SETUP.md, BLOG_PRODUCTION_OPERATIONS.md
.cursor/rules/    Project rules (UI, monorepo, data pipeline, no-stale-code, …)
```

## Architecture rules (summary — full text in `.cursor/rules/`)

- **Apps are thin shells** (`monorepo-packages.mdc`). UI → `packages/ui`. Data / domain → `packages/data`. Config → `packages/config`. Marketplace APIs → `packages/marketplaces`.
- **UI must use ShadCN/Radix** primitives (`ui-components.mdc`). New Radix packages go in `packages/ui/package.json`, exported from `packages/ui/src/index.ts`.
- **No stale code** (`no-stale-code.mdc`): delete retired feature flags, dead branches, unused barrels, and imports the moment a migration is done. Then `bun validate`.
- **Blog is CMS-backed**: `packages/data/cache/normalized/blogs/` is the single source of truth at render time. No runtime template generation in the request path.
- **Pipeline timestamps** live only in `cache/normalized/meta/pipeline.json` (`pipeline-timestamps.mdc`). Use `writePipelineMeta()`. Never add `extractedAt` / `transformedAt` to per-entity files.
- **Long ETL loops** must log progress (`data-scripts-progress.mdc`): start with totals + flags, every 50 / 250 items, end with a summary. Use `processRecords()` with `progressEvery` from `scripts/lib/core/process-queue.ts`.

## Environment variables

Secrets live in **Vercel per project** (landing, blog, etc.). Local dev pulls them per app:

```bash
cd apps/<app> && vercel link && vercel env pull .env.local
```

Server-only vs client-visible:

- **Server-only** (default): `EBAY_*`, `ETSY_*`, `WHATNOT_*`, `BLOG_*`, `BLOB_*`, `LIVE_SHOWS_*`, `BLOB_READ_WRITE_TOKEN`.
- **Client-visible** (must start with `NEXT_PUBLIC_`): `NEXT_PUBLIC_LANDING_URL`, `NEXT_PUBLIC_BLOG_URL`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_SHOWS_POLL_INTERVAL_MS`.
- `GOOGLE_SITE_VERIFICATION` is public-by-design (rendered as a meta tag).

Root `.env.local` is **legacy / overrides only** — prefer Vercel per-project env. The full reference is in [`.env.example`](.env.example) and [`docs/ENV_SETUP.md`](docs/ENV_SETUP.md). Turbo pass-through env lives in `turbo.json` (`globalEnv` / `globalPassThroughEnv`).

## `@repo/data` pipeline

Three commands in order — `extract` → `images` → `transform` (full detail in `.cursor/rules/data-pipeline.mdc`):

| Command     | Folder                 | Output                               | Frequency                                |
| ----------- | ---------------------- | ------------------------------------ | ---------------------------------------- |
| `extract`   | `scripts/1-extract/`   | `cache/raw/` + meta evolution-chains | New upstream data                        |
| `images`    | `scripts/2-images/`    | `cache/blob-manifest.json`           | New sprites / scene art / meta art       |
| `transform` | `scripts/3-transform/` | `cache/normalized/` + prices + blogs | Daily (use `--only prices` or `refresh`) |

```bash
# Daily cron (prices only)
bun --filter @repo/data refresh

# New TCG sets
bun --filter @repo/data extract --only pokemontcg tcgdex
bun --filter @repo/data transform

# Annual image run (requires BLOB_READ_WRITE_TOKEN in apps/blog/.env.local)
bun --filter @repo/data images
bun --filter @repo/data transform

# One-off debug: run a single step directly
bun exec tsx packages/data/scripts/3-transform/3-prices/02-sync-tcgcsv-prices.ts
```

Cache wipe policy: safe to delete `cache/raw/**` (except `popularity/*.csv`), `cache/normalized/**`, `cache/images/**`, `cache/scratch/**`, `cache/extract-manifest.json`. **Keep** `cache/blob-manifest.json` (publish checkpoint) and `src/collections/pokemon-collections.json` (curated, not built by transform).

One-off / debug scripts go in `packages/data/scripts/temp/` (gitignored). Long-lived steps belong in `1-extract/`, `2-images/`, or `3-transform/`. Shared helpers live in `scripts/lib/` (`core/`, `paths/`, `staging/`, `pipeline/`, `bulbapedia/`, `tcg/`, `pokemon/`, `images/`, `competitive/`) — see [`packages/data/scripts/lib/README.md`](packages/data/scripts/lib/README.md).

## Code style

- Prettier: no semis, single quotes, trailing comma `es5`, 2 spaces, 100-col, `prettier-plugin-tailwindcss`. Run `bun format:fix` before committing.
- ESLint flat config per package, rooted at each `eslint.config.mjs`. `--max-warnings 0` is the default.
- `tsconfig` strict mode is on at the root; per-package tsconfigs extend `@repo/typescript-config`. React is hoisted via root `tsconfig.json` `paths`.
- **No comments unless asked.** Match the file's existing style.
- Server code that imports `server-only` works in tests because `test/preload.ts` mocks it.

## Tests

- Runner: `bun test` (Bun's built-in). Config in `bunfig.toml`: `isolate = true`, preload `./test/preload.ts` + `./test/setup.ts`.
- DOM provided by `happy-dom` (preloaded before any test imports `@testing-library/dom`).
- `@testing-library/react` cleanup runs in `afterEach` (`test/setup.ts`).
- Coverage lands in `./coverage/`.
- Per-package test scripts: `bun test <path>`, `bun test:watch <path>`, `bun test:coverage <path>`. Always pass the path explicitly to avoid scanning everything.

## CI / Dependabot

- CI: `.github/workflows/ci.yml` — `format:check` → `lint` → `type-check` → `build` → `test` on `main` and `staging`.
- Production monitor: `blog-production-monitor.yml` runs every 6h against `pinkbinder.blog`.
- CodeQL: `codeql.yml` on PRs / push.
- Dependabot groups: `nextjs`, `react`, `lint-and-format`, `turbo`. Ignores major semver bumps. Targets `staging`.

Before opening a PR, locally run the same gates:

```bash
bun validate
bun test
bun build
```

## Git & commits

- Branch from `staging`; PRs target `staging`, then `main` for release.
- Husky pre-commit runs `bun lint-staged` (Prettier write on staged files only).
- Do **not** commit secrets, `.env*.local`, lockfile churn from casual `bun install`, or `packages/data/cache/` outputs.
- Conventional-style commit messages matching the repo (`chore(deps): …`, `feat: …`, `fix: …`, `ci: …`, `test: …`).

## Security

Report vulnerabilities privately — see [`.github/SECURITY.md`](.github/SECURITY.md). Do **not** open public issues for security bugs. The repo does not run a paid bug bounty; we credit reporters and ship Pokémon cards.

## eBay marketplace account deletion (landing only)

`apps/landing` hosts the eBay account-deletion challenge endpoint. Configure in eBay:

- Callback URL: `https://<your-domain>/api/ebay/account-deletion`
- Env: `EBAY_VERIFICATION_TOKEN` (required), `EBAY_ACCOUNT_DELETION_ENDPOINT` (optional, only when the runtime host differs from the registered eBay URL).

## When you finish a task

1. `bun format:fix` (or `prettier --write` on touched files).
2. `bun validate` from repo root.
3. `bun test` (or scoped `bun test <path>`).
4. Re-grep the codebase for any symbols you removed/migrated (`no-stale-code.mdc`).
5. Don't commit unless asked. Don't edit generated cache files — re-run the pipeline.
