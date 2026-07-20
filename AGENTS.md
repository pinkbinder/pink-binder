## Stack

- Next.js 15 (App Router) Turborepo monorepo; 4 thin apps on Vercel: `apps/landing` (3000), `apps/store` (3001), `apps/blog` (3002), `apps/admin` (3003).
- Shared packages: `@repo/ui` (ShadCN/Radix, Tailwind v4), `@repo/data` (ETL → local JSON), `@repo/config`, `@repo/marketplaces` (eBay/Etsy/TCGplayer/Whatnot), `@repo/eslint-config`, `@repo/typescript-config`.
- Bun-only. `packageManager: bun@1.3.14`. Toolchain pinned in `mise.toml` (node `24.18.0` + bun `1.3.14`); CI uses `jdx/mise-action`. Do not introduce `npm`/`yarn`/`pnpm`/`volta` — no `node_modules` churn from another manager.
- Turborepo `2.10.5`, ESLint 9 (flat config, per-package `eslint.config.mjs`, `--max-warnings 0`), Prettier `3.9.5` (no semis, single quotes, `es5` trailing comma, 2 spaces, 100-col, `prettier-plugin-tailwindcss`).

## Commands

All scripts are at repo root. `scripts/with-env.mjs` merges an optional root `.env.local` (via `scripts/load-monorepo-env.mjs`) before invoking Turbo for build/lint/type-check/validate. Per-app secrets come from Vercel, not the root env.

```bash
# Install (CI-style: frozen lockfile; local dev also accepts plain `bun install`)
bun install --frozen-lockfile

# Build (turbo)
bun run build

# Test runner: bun's built-in `bun test` (NOT vitest, NOT jest) with happy-dom
# preload via test/preload.ts + test/setup.ts. Pass a path to avoid scanning everything.
bun test                    # all
bun test packages/data      # single package

# Type-check / lint (turbo)
bun run type-check          # alias also exists: bun run type:check
bun run lint

# Format
bun run format              # turbo format (per-package prettier)
bun run format:fix          # turbo format:fix (per-package prettier --write)
bun run format:check        # root: prettier --check .

# Pre-PR combined gate
bun run validate            # turbo: format + lint + type-check
```

## Structure

```
apps/                  Thin Next.js shells — routing, metadata, API routes, wiring only
  landing/             port 3000 — eBay/Etsy/Whatnot integrations; hosts eBay account-deletion challenge
  store/               port 3001
  blog/                port 3002 — reads pre-generated JSON; no runtime CMS fetch
  admin/               port 3003
packages/
  ui/                  @repo/ui — ShadCN/Radix only; new Radix deps go here, re-export from src/index.ts
  data/                @repo/data — ETL (extract → images → transform) + blog loaders
  config/              @repo/config — URLs, brand, env-backed config
  marketplaces/        @repo/marketplaces — eBay / Etsy / TCGplayer / Whatnot clients
  eslint-config/       @repo/eslint-config (base | library | next | react-internal)
  typescript-config/   @repo/typescript-config
scripts/               Repo-wide Node helpers (with-env.mjs, load-monorepo-env.mjs, kill-dev-ports.mjs)
test/                  preload.ts + setup.ts (bun test setup, server-only mock, RTL cleanup)
docs/                  ENV_SETUP.md, BLOG_PRODUCTION_OPERATIONS.md
.cursor/rules/         Project rules (ui-components, monorepo-packages, no-stale-code, data-pipeline, …)
```

## Conventions & Gotchas

- **Bun-only.** `packageManager: bun@1.3.14` is authoritative. Never use `npm`/`yarn`/`pnpm`; do not add `engines.npm` or alternate lockfiles. `bun install --frozen-lockfile` in CI-style runs.
- **husky + lint-staged are active.** Pre-commit runs `lint-staged` (Prettier write on staged files only). Never use `--no-verify` / `-n` to skip hooks. `prepare: husky || true` — install hooks before your first commit.
- **Test runner is `bun test` (Bun native), not vitest/jest.** Config in `bunfig.toml`: `isolate = true`, preload `./test/preload.ts` + `./test/setup.ts`. `happy-dom` is registered globally before any `@testing-library/dom` import. `@testing-library/react` cleanup runs in `afterEach`. Coverage lands in `./coverage/`. Vitest/Jest configs/imports are wrong — don't add them. (Solidity subdirs are the only exception and don't exist here.)
- **Never edit generated artifacts.** `packages/data/cache/**` and `apps/blog/public/data/**` are gitignored and rebuilt by the ETL. To change them, re-run the pipeline: `bun --filter @repo/data extract --only …` → `images` → `transform`. Per-entity files must not carry `extractedAt`/`transformedAt` — pipeline timestamps live only in `cache/normalized/meta/pipeline.json` via `writePipelineMeta()`.
- **Apps are thin shells.** UI → `packages/ui`. Domain/data → `packages/data`. Config → `packages/config`. Marketplace API clients → `packages/marketplaces`. Do not put business logic in `apps/`.
- **UI must use ShadCN/Radix.** New Radix packages are added to `packages/ui/package.json` and re-exported from `packages/ui/src/index.ts`. No raw HTML controls in apps when a Radix primitive exists.
- **No stale code.** After a migration, delete retired feature flags, dead branches, unused barrels, and orphan imports immediately, then `bun validate`. Re-grep the codebase for any symbol you removed.
- **Env vars are Vercel per-project.** `cd apps/<app> && vercel link && vercel env pull .env.local`. Root `.env.local` is legacy/overrides only. Server-only: `EBAY_*`, `ETSY_*`, `WHATNOT_*`, `BLOG_*`, `BLOB_*`, `LIVE_SHOWS_*`, `BLOB_READ_WRITE_TOKEN`. Client-visible (must start with `NEXT_PUBLIC_`): `NEXT_PUBLIC_LANDING_URL`, `NEXT_PUBLIC_BLOG_URL`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_SHOWS_POLL_INTERVAL_MS`. `GOOGLE_SITE_VERIFICATION` is public-by-design. Turbo pass-through env in `turbo.json` (`globalEnv` / `globalPassThroughEnv`).
- **Long ETL loops must log progress.** Start with totals + flags, every 50/250 items, end with a summary. Use `processRecords({ progressEvery })` from `scripts/lib/core/process-queue.ts`.
- **One-off scripts go in `packages/data/scripts/temp/`** (gitignored). Long-lived steps belong in `scripts/1-extract/`, `scripts/2-images/`, or `scripts/3-transform/`. Shared helpers in `scripts/lib/`.
- **Cache wipe policy.** Safe to delete `cache/raw/**` (except `popularity/*.csv`), `cache/normalized/**`, `cache/images/**`, `cache/scratch/**`, `cache/extract-manifest.json`. **Keep** `cache/blob-manifest.json` (publish checkpoint) and `src/collections/pokemon-collections.json` (curated, not built by transform).
- **Dev ports collide.** `bun dev` runs `scripts/kill-dev-ports.mjs` first to clear 3000–3003. If a port sticks, that's the script's job, not yours.
- **`tsconfig` strict at the root;** per-package tsconfigs extend `@repo/typescript-config`. React is hoisted via root `tsconfig.json` `paths`. No comments unless asked; match the file's existing style. Server code that imports `server-only` works in tests because `test/preload.ts` mocks it.
- **PR gates (run locally before pushing).** `bun run validate` → `bun test` → `bun run build`. CI (`.github/workflows/ci.yml`) runs `format:check` → `lint` → `type-check` → `build` → `test` on `main` and `staging`.
- **Git:** branch from `staging`; PRs target `staging`, then `main` for release. Conventional-style commits (`chore(deps): …`, `feat: …`, `fix: …`, `ci: …`, `test: …`). Never commit secrets, `.env*.local`, lockfile churn from casual `bun install`, or `packages/data/cache/` outputs.
- **Security reports** go through `.github/SECURITY.md` — no public issues for vulns.
