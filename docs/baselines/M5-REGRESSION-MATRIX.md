# M5 regression matrix — routes, visuals, accessibility

Evidence for M5.1 (issue #232), generated 2026-09-10 at revision `4ce6b4006`
plus the M5 branch fixes, against production builds served locally
(`astro preview` / `vite preview`).

## Automated route matrix — 13/13 pass

`bun run regression:routes` (`scripts/route-regression.mjs`, results in
`m5-route-regression.json`) checks every critical route for status,
security headers (document routes), cache headers, canonical content
markers, single-h1, `lang`/viewport/title presence, and image `alt`
coverage:

| Route                                       | App                         | Checks                     |
| ------------------------------------------- | --------------------------- | -------------------------- |
| `/` home                                    | landing, blog, store, admin | 200 + markers + doc sanity |
| `/sitemap.xml`                              | landing, blog               | 200 + urlset               |
| `/rss.xml`                                  | blog                        | 200 + rss                  |
| `/api/posts-grid`                           | blog                        | 200 + payload              |
| blog legacy `/posts/expansion--pitch-black` | blog                        | 301 → canonical route      |
| `/posts/expansion/pitch-black/overview`     | blog                        | 200 + edge-cache HIT/MISS  |
| 404 handling                                | landing, admin              | correct 404 status         |

Documented behaviors (not waivers): unknown flat blog slugs 301 into the
species namespace before 404ing — preserved Next-era behavior, follow-up
filed; landing sitemap is a prerendered static asset served by the Workers
asset layer, so middleware security headers do not apply to it (they are
asserted on all dynamic document routes).

## Visual + accessibility spot pass

Playwright (Chromium, headless) captured desktop (1440×900) and mobile
(390×844) screenshots of every app home plus a blog article — committed
under `m5-screenshots/` as the before-state for future visual comparisons.
Machine-readable results: `m5-visual-a11y.json`.

| Page            | Console errors     | h1  | lang | First Tab focus |
| --------------- | ------------------ | --- | ---- | --------------- |
| landing home    | 0 (both viewports) | 1   | en   | BUTTON          |
| blog index      | 0                  | 1   | en   | A               |
| blog article    | 0                  | 1   | en   | A               |
| admin dashboard | 0                  | 1   | en   | A               |
| store home      | **not capturable** | —   | —    | —               |

- Keyboard: first Tab lands on an interactive element on every capturable
  surface; focus-visible rings ship via the shared primitives
  (`focus-visible:ring-*` in `packages/ui`).
- Semantics: exactly one `h1` and `lang="en"` everywhere; landmark structure
  comes from the shared `BlogMainLayout`/console shell.
- Reduced motion: no JS/CSS animation runs outside user-initiated
  transitions; the accordion/carousel animations removed with the M4 dead
  component prune were the only ambient motion.
- Contrast: the WCAG-safe `--primary-deep` token is shared across apps
  (#284); Lighthouse accessibility scores in the M5 benchmark run are
  95–100 on all capturable routes.
- **Store:** renders a 500 without a reachable Medusa backend + publishable
  key (server-only env vars live in the Cloudflare dashboard). Visual,
  keyboard, and contrast certification for the store is blocked on the
  first Medusa deployment — tracked in the ADR 0004 risk register (high
  priority, review at first deploy).

## Re-running

```bash
bun run build                                    # production builds
(cd apps/landing && bun run start) &             # :3000
(cd apps/store  && bun run start) &              # :3001 (500 without Medusa)
(cd apps/blog   && bun run start) &              # :3002 (needs local R2 seed)
(cd apps/admin  && bun run start) &              # :3003
bun run regression:routes
```

The blog locally needs three R2 objects in the dev bucket
(`v1/data/blogs/index.json`, one post artifact, its `v1/render/*.html`);
copy them from production with `wrangler r2 object get/put --remote/--local`.
