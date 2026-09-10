# ADR 0004: M5 closeout — final architecture, residual risks, completion

- Status: accepted
- Date: 2026-09-10
- Scope: M5 issues #232, #233, #234, and #235; closes the M0–M5 optimization program
- Measurements: [`../baselines/m0-2026-09-08.json`](../baselines/m0-2026-09-08.json),
  [`../baselines/m5-2026-09-10.json`](../baselines/m5-2026-09-10.json),
  [`../baselines/m5-route-regression.json`](../baselines/m5-route-regression.json)
- Supersedes: nothing; extends ADR 0001–0003

## Program completion status

The M0–M5 optimization and modernization program is **complete**. The
framework/build/state/UI/performance decisions below are final for this
program; future work starts from the residual-risk register, not from an
open-ended "keep optimizing" mandate. Reopening performance work requires a
new measured baseline, not a re-run of this one.

## Final decision summary

| Concern       | Decision                                                                                                                               | Evidence                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Frameworks    | Astro (landing, blog, store) + TanStack Start (admin); Next.js fully retired                                                           | ADR 0003; migration PRs #257/#258/#262/#278 |
| Bundler       | Vite everywhere (embedded in Astro; direct for admin); Turborepo orchestration                                                         | ADR 0003                                    |
| State         | URL (nuqs) + TanStack Query + server ownership; Zustand only on proven need                                                            | ADR 0002                                    |
| Data          | Blog content is pre-generated R2 artifacts from the private `blog-pipeline` repo; store commerce via private `medusa` repo             | blog-pipeline split (#281)                  |
| Shared UI     | `packages/ui` shadcn-style primitives; icon artwork + accent tokens in `@repo/config` / `@repo/ui`                                     | #284 (M4.1/M4.2)                            |
| Performance   | Worker edge cache (`@repo/config/edge-cache`) on landing marketplace API and blog HTML; `client:idle` blog grid; prebuilt article HTML | #284 (M4.3), #275                           |
| Accessibility | WCAG-safe `--primary-deep` accent token shared by all apps; shared Radix primitives own focus/keyboard semantics                       | #273, #284                                  |

## Verification results (M5.1, M5.3)

- Route regression matrix: 13/13 pass across all four apps from production
  builds (`scripts/route-regression.mjs`, results in
  `docs/baselines/m5-route-regression.json`; visual/keyboard notes in
  `docs/baselines/M5-REGRESSION-MATRIX.md`).
- Release flow verified end to end and documented in
  [`../RELEASE_FLOW.md`](../RELEASE_FLOW.md): draft→ready→validate→squash,
  Release Please versioning, per-app Cloudflare production deploys, and
  rollback paths. Local validation during Actions pauses is a standing rule,
  exercised live on #282/#284.
- Performance budgets: see
  [`M5-PERFORMANCE-EVIDENCE.md`](../baselines/M5-PERFORMANCE-EVIDENCE.md)
  for the M0→M5 comparison with attribution.

## Residual risk register

| Risk / gap                                                                                                       | Owner         | Priority | Next review condition                                     |
| ---------------------------------------------------------------------------------------------------------------- | ------------- | -------- | --------------------------------------------------------- |
| Blog Lighthouse performance is capped ~58 by third-party Zaraz tags, not app code                                | Blog owner    | Medium   | Zaraz tag review in the Cloudflare dashboard              |
| Store renders a 500 locally without a reachable Medusa backend + publishable key; not exercised end-to-end in CI | Store owner   | High     | First Medusa production deploy; add a smoke check then    |
| One `validation-audit` check fails permanently (pre-existing, tracked)                                           | Repo owner    | Low      | When the audit rule is fixed or retired                   |
| Unknown flat blog slugs 301 into the species namespace before 404ing                                             | Blog owner    | Low      | Next content-work pass; consider a direct 404             |
| Local blog development needs R2 seed objects (index + post + render artifacts)                                   | Blog owner    | Low      | If local content work becomes frequent, add a seed script |
| Cloudflare zone cache rules (e.g. `landing-marketplace-edge-300s`) live outside the repo                         | Landing owner | Medium   | On any zone change, re-verify marketplace API freshness   |

## Durable procedures

- Validation/CI/deploy/rollback: [`../RELEASE_FLOW.md`](../RELEASE_FLOW.md)
- Blog operations: [`../BLOG_PRODUCTION_OPERATIONS.md`](../BLOG_PRODUCTION_OPERATIONS.md)
- Cloudflare builds: [`../CLOUDFLARE_BUILDS.md`](../CLOUDFLARE_BUILDS.md)
