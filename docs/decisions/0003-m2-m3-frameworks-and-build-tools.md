# ADR 0003: M2 per-app frameworks and M3 build tools

- Status: accepted
- Date: 2026-09-10
- Scope: M2 issues #219, #220, #221, #222, and #223; M3 issues #224, #225, #226, and #227
- Supersedes: the Next.js 16 + OpenNext baseline in ADR 0001

## Decision

Every Pink Binder app leaves Next.js. Rendering-heavy, content-facing apps run
Astro; the interaction-heavy admin console runs TanStack Start. Both frameworks
sit on Vite, so Vite is the single build tool across the repository, with
Turborepo orchestrating tasks and one `wrangler.jsonc` per app for Cloudflare
Workers deployment. No app keeps a Webpack, Turbopack, or OpenNext build path.

### Framework decision table

| App     | Decision                   | Rationale                                                                                                              | Migration evidence                                 |
| ------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| landing | Astro (Cloudflare adapter) | Mostly static marketing/content routes; server output only where live marketplace data is injected                     | #257                                               |
| blog    | Astro (Cloudflare adapter) | Content site with islands for interactive filters; R2-backed local data; best Core Web Vitals of the tested candidates | #258                                               |
| store   | Astro + Medusa backend     | Catalog/storefront rendering with islands for cart interactions; commerce backend split to the private `medusa` repo   | #261 (TanStack Start prototype) superseded by #278 |
| admin   | TanStack Start (Vite)      | Authenticated, interaction-heavy console; server functions and typed routing fit better than island architecture       | #262                                               |

Remix/React Router was not adopted: its overlap with the chosen stacks offered
no measured advantage for any route shape, and no app needed its full-document
React rendering model on top of what Astro or TanStack Start already provides.

### Build-tool decision table

| Concern       | Decision                                                                      |
| ------------- | ----------------------------------------------------------------------------- |
| Bundler       | Vite (via Astro for landing/blog/store; direct `vite.config.ts` for admin)    |
| Orchestration | Turborepo task graph (`build`, `dev`, `lint`, `type-check`, `test`)           |
| Deployment    | Per-app `wrangler.jsonc`; `@astrojs/cloudflare` and `@cloudflare/vite-plugin` |
| Removed paths | `next.config.*`, OpenNext builds, Webpack/Turbopack evaluation paths          |

## Consequences

- One bundler mental model and one dev-server behavior across apps; framework
  differences remain at the routing/rendering layer only.
- Cloudflare Workers are the only deploy target; Vercel and OpenNext artifacts
  are gone from scripts, CI, and ignore lists.
- The shared `@repo/marketplaces` fetch helper no longer emits Next.js ISR
  (`next: { revalidate }`) options; freshness is enforced by the landing edge
  cache and pipeline-level hints instead.
- Rollback is per app: each migration landed as an independent squash merge on
  `main`, so reverting one app's framework commit restores its previous stack
  without touching the others.

## Verification

- All four apps build, lint, type-check, and pass tests on Vite-based paths
  (release 1.6.0, PRs #264, #267, #268, #270, #273, #275, #278).
- Repository search finds no `next` dependencies, `next.config.*` files, or
  OpenNext references outside historical ADRs and changelogs.
