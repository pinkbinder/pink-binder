# Release flow

Verified state of the PinkBinder release path as of 2026-09-10 (M5.3, issue
#234). Every gate below is exercised by the current workflows or was exercised
live during the M2–M5 migrations (PRs #257, #258, #261, #262, #278, #281,
#282, #283, #284; releases 1.5.0–1.6.0).

## Change path: pull request → main

1. **Every ordinary PR opens as a draft** (`gh pr create --draft`). Draft Guard
   (`.github/workflows/draft-enforcement.yml`) converts ready ordinary PRs
   back to draft on open/reopen; Cloudflare preview callers are exempt via
   `draft-protection: false`.
2. **Mark ready when review prep is done.** `validation.yml` then runs format,
   lint, type-check, build, and tests on `ready_for_review` and every
   `synchronize`; runner-heavy validation never runs on drafts.
3. **Lockfile check** (`lockfile-check.yml`) verifies `bun.lock` still matches
   the workspace manifests with `bun install --frozen-lockfile`. Dependabot's
   npm updates change `package.json` (including `overrides`) without
   regenerating the lockfile, so those PRs fail here — at review, with a clear
   message — instead of breaking every Cloudflare deploy on `main` after the
   merge. Fix is always the same: run `bun install` and commit `bun.lock`.
4. **Cloudflare Preview** (`cloudflare-preview.yml`) deploys per-app preview
   Workers for ready PRs only (`ready_for_review`, `synchronize`,
   `converted_to_draft`), gated on a Turbo deployment-impact check so
   untouched apps do not spend preview builds.
5. **Merge with squash only.** `main` is the protected release branch; the
   repository's canonical merge method is squash. Never merge with `--admin`
   or an ad-hoc method. Conventional Commit subjects are required so Release
   Please can version.

### Cost-aware CI behavior

- Draft PRs allocate no validation runner, no lockfile check, and no preview
  deploy.
- Preview deploys skip apps the PR does not affect (Turbo impact check).
- The lockfile check and the deploy jobs both run a frozen `bun install`, so
  the dependency graph validated in review is the one that ships. Never work
  around a lockfile failure by dropping the frozen flag; regenerate the
  lockfile instead.
- **GitHub Actions billing pause:** when Actions is paused, workflow checks
  report `skipping`, which branch protection treats as green. The repository's
  standing rule in that state is to run the full local validation suite
  (`bun run validate`, `bun run test`, `bun run build` for every affected
  app) before marking a PR ready or merging, exactly as done for #282, #284,
  and the 1.5.x/1.6.0 releases. Skipped CI is never treated as passing
  validation without that local run recorded in the PR body.

## Release path: main → version → deploy

1. **Release Please** (Code Foundry `release.yml`, on push to `main`) opens or
   updates a version PR from `release-please-config.json` (squash merge
   strategy; `feat:` → minor, `fix:`/`perf:` → patch, `feat!:` → major).
2. **Merging the version PR** publishes the GitHub release and tagged
   changelog per package.
3. **Cloudflare Production** (`cloudflare-production.yml`, on push to `main`
   and `workflow_dispatch`) deploys `admin`, `blog`, and `landing` as a
   fail-open matrix from `apps/<app>` with `build:cloudflare` and each app's
   own `wrangler.jsonc`. The store is gated out of production until the
   Medusa backend is hosted and the `MEDUSA_*` Worker secrets are set
   (per the workflow comment; see `docs/ENV_SETUP.md`). Per-app deploy
   failures do not block the other apps.

## Rollback

- **App-level:** `git revert` the offending squash commit on `main` (each
  migration landed as one independent commit) and let the next production
  deploy run, or `workflow_dispatch` `Cloudflare Production` for the affected
  app only. Framework rollbacks were verified to be per-app independent
  (ADR 0003).
- **Content-level (blog):** R2 data artifacts are versioned and purged by the
  private `pinkbinder/blog-pipeline` publish workflow; republish the prior
  artifact set. Edge HTML honors the purge (blog post pages cache with
  `s-maxage=86400` and purge on data publish; `caches.default` freshness is
  bounded at 5 minutes fresh + 1 hour stale-while-revalidate).
- **Release-level:** revert the release PR contents with a `chore:` revert and
  let Release Please cut a patch.

## Implicit-assumption audit

- Deploy credentials live in repository/Cloudflare settings (`CLOUDFLARE_API_TOKEN`
  etc.); local deploys use `wrangler` OAuth. No deployment secret is read from
  the repo.
- The store's production Worker reads `MEDUSA_BACKEND_URL` /
  `MEDUSA_PUBLISHABLE_KEY` from the Cloudflare dashboard, not from the repo;
  local store runs without them fail fast with a 500 (documented in
  `docs/baselines/M5-REGRESSION-MATRIX.md`).
- Branch rulesets are codified in `.github/rulesets/main-protection.json` and
  applied via `scripts/apply-rulesets.sh` where the GitHub plan supports them;
  the free plan cannot enforce them API-side, so the rules live in
  documentation and agent contracts (AGENTS.md).
