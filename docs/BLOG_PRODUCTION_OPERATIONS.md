# Blog production operations

The blog remains a local-data Next.js application hosted on Cloudflare Workers. Its route, feed, SEO, and monitoring checks use repository scripts and GitHub Actions; no paid database or monitoring service is required.

## Release gates

Run the same checks used by CI before publishing:

```bash
bun run validate
bun --filter @repo/data audit:blog-publishing
bunx turbo run build --filter=@repo/blog
bun --filter @repo/blog audit:routes
```

`audit:blog-publishing` validates unique slugs/routes, required metadata, dates, feed-image coverage, related-post targets, exact duplicate metadata, and repeated description openers. Errors fail the command; scheduled posts and repetitive-openers are reported separately. Add `-- --json` for machine-readable output.

Common remediation:

- `duplicate-slug` or `duplicate-route`: fix the generator input or canonical slug mapping, then rebuild the blog index.
- `broken-related-link` or `future-related-link`: remove the relation or publish the target first.
- `feed-image-coverage`: provide a non-logo raster `.png`, `.jpg`, or `.webp` hero image.
- `duplicate-description`: diversify the source template before rebuilding; do not patch thousands of generated files by hand.
- `repetitive-opener`: treat the warning as a content-quality queue and adjust the relevant template family.

`audit:routes` starts the compiled blog, crawls every sitemap post, and validates canonical metadata, structured data, RSS feeds, APIs, and R2 gallery manifests. A failure prints the exact route. It intentionally runs after `next build`, because source-level tests cannot detect missing production output-file traces.

## Production monitoring

The `Blog production monitor` GitHub Actions workflow runs every six hours and checks the deployed Worker origin plus the public custom-domain edge:

- homepage, robots, sitemap, and grid API;
- all five Pinterest/RSS feeds;
- a first, middle, and long-tail sitemap article;
- species, illustrator, and expansion R2 gallery APIs;
- canonical metadata and structured data.

The scheduled job uses `https://blog.pink-binder.workers.dev` as its authoritative
Worker-origin target, so the homepage and all application routes are tested even
when Cloudflare returns a runner-specific `403` for `https://pinkbinder.blog/`.
It then audits the public custom domain's sitemap, feeds, sampled posts, APIs,
and galleries separately. A runner-specific public-edge `403` is reported as a
warning because the Worker-origin audit already validates that route's content;
other HTTP failures remain fatal. A manual run can provide a preview Worker URL
through the `base_url` input.

GitHub emails repository notification subscribers when the scheduled workflow fails. The job summary contains the failing URL. To test a Cloudflare preview, open **Actions → Blog production monitor → Run workflow** and provide its base URL. Locally, run:

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
2. Set `GOOGLE_SITE_VERIFICATION` in the Cloudflare `blog` Worker to the verification token only, then redeploy.
3. Submit `https://pinkbinder.blog/sitemap.xml` and inspect indexing/canonical reports after Google recrawls.
4. Configure and publish the Zaraz tools for `pinkbinder.blog` as described in
   [`ZARAZ_CONFIGURATION.md`](./ZARAZ_CONFIGURATION.md).

The UI emits Zaraz events for blog-card selection (`select_content`), catalog searches (`search`), sharing (`share`), and outbound marketplace clicks (`Product Viewed`). Configure the corresponding Zaraz actions to forward the events to the enabled tools. In GA4, create reports for landing page plus source/medium to separate Google and Pinterest referrals.

The Search Console token is optional. It is rendered as a verification meta tag and is public by design. Zaraz may set analytics cookies depending on the tools configured in the dashboard; keep consent and privacy disclosures aligned with those tools. No visitor identifiers are stored by the local blog data pipeline.

When indexing drops, check the production monitor first, then Search Console's Page Indexing and URL Inspection reports. Confirm the route is present once in the sitemap, returns 200, emits its own canonical, is not future-dated, and is not blocked by robots.
