# Blog production operations

The blog remains a local-data Next.js application hosted on Vercel. Its route, feed, SEO, and monitoring checks use repository scripts and GitHub Actions; no paid database or monitoring service is required.

## Release gates

Run the same checks used by CI before publishing:

```bash
pnpm validate
pnpm --filter @repo/data audit:blog-publishing
pnpm exec turbo run build --filter=@repo/blog
pnpm --filter @repo/blog audit:routes
```

`audit:blog-publishing` validates unique slugs/routes, required metadata, dates, feed-image coverage, related-post targets, exact duplicate metadata, and repeated description openers. Errors fail the command; scheduled posts and repetitive-openers are reported separately. Add `-- --json` for machine-readable output.

Common remediation:

- `duplicate-slug` or `duplicate-route`: fix the generator input or canonical slug mapping, then rebuild the blog index.
- `broken-related-link` or `future-related-link`: remove the relation or publish the target first.
- `feed-image-coverage`: provide a non-logo raster `.png`, `.jpg`, or `.webp` hero image.
- `duplicate-description`: diversify the source template before rebuilding; do not patch thousands of generated files by hand.
- `repetitive-opener`: treat the warning as a content-quality queue and adjust the relevant template family.

`audit:routes` starts the compiled blog, crawls every sitemap post, and validates canonical metadata, structured data, RSS feeds, APIs, compatibility redirects, and static gallery assets. A failure prints the exact route. It intentionally runs after `next build`, because source-level tests cannot detect missing Vercel output-file traces.

## Static card galleries

The prebuild creates deterministic manifests for species, illustrators, and expansions under `/data/card-galleries/{kind}/{slug}.json`. The UI reads those CDN-cacheable assets directly. `/api/card-gallery` remains as a 307 compatibility redirect and does not trace the Pokémon or illustrator card corpus into its serverless function.

Run `pnpm --filter @repo/blog data:gallery-manifests` to rebuild and verify the manifests. The verifier prints counts, bytes, and a SHA-256 digest; identical data must produce an identical digest.

## Production monitoring

The `Blog production monitor` GitHub Actions workflow runs every six hours and checks:

- homepage, robots, sitemap, and grid API;
- all five Pinterest/RSS feeds;
- a first, middle, and long-tail sitemap article;
- species, illustrator, and expansion static galleries;
- legacy gallery redirects, canonical metadata, and structured data.

GitHub emails repository notification subscribers when the scheduled workflow fails. The job summary contains the failing URL. To test a Vercel preview, open **Actions → Blog production monitor → Run workflow** and provide its base URL. Locally, run:

```bash
node apps/blog/scripts/audit-blog-routes.mjs --base-url https://pinkbinder.blog --max-posts 3
```

## Pinterest RSS feeds

Claim `pinkbinder.blog` in Pinterest Business before connecting a feed. Use one feed per board when you want focused automation:

| Feed                                          | Suggested board             |
| --------------------------------------------- | --------------------------- |
| `https://pinkbinder.blog/rss.xml`             | All Pink Binder posts       |
| `https://pinkbinder.blog/rss/species.xml`     | Pokémon collector guides    |
| `https://pinkbinder.blog/rss/illustrator.xml` | TCG illustrators            |
| `https://pinkbinder.blog/rss/expansion.xml`   | Pokémon TCG sets            |
| `https://pinkbinder.blog/rss/roundup.xml`     | Cute cards and binder ideas |

Each feed is RSS 2.0, generated from local published data, cached for one day, and limited to the 20 newest eligible posts. Items require a unique claimed-domain canonical link and a raster `media:content` image. Pinterest can take up to 24 hours to process updates.

## Search Console and analytics

1. Create a Google Search Console domain or URL-prefix property for `https://pinkbinder.blog`.
2. Set `GOOGLE_SITE_VERIFICATION` in the Vercel blog project to the verification token only, then redeploy.
3. Submit `https://pinkbinder.blog/sitemap.xml` and inspect indexing/canonical reports after Google recrawls.
4. Configure `NEXT_PUBLIC_GTM_ID` for the blog project if analytics is desired.

The UI emits GA4-compatible events for blog-card selection (`select_content`), catalog searches (`search`), sharing (`share`), and outbound marketplace clicks (`view_item`). In GA4, create reports for landing page plus source/medium to separate Google and Pinterest referrals.

Both variables are optional. The Search Console token is rendered as a verification meta tag and is public by design. GTM may set analytics cookies depending on the tags configured in the container; keep consent and privacy disclosures aligned with those tags. No visitor identifiers are stored by the local blog data pipeline.

When indexing drops, check the production monitor first, then Search Console's Page Indexing and URL Inspection reports. Confirm the route is present once in the sitemap, returns 200, emits its own canonical, is not future-dated, and is not blocked by robots.
