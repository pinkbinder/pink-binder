# Blog agent guide

The blog is an Astro 7 app deployed to Cloudflare Workers with
`@astrojs/cloudflare`. Keep the Worker runtime filesystem-independent:
published post and gallery data is read from the `pink-binder` R2 bucket.

## Build and deploy checks

Run the build from the repository root:

```bash
bun run build:cloudflare -- blog
```

Run Wrangler from this directory after the Astro build. Cloudflare Workers
Builds owns the build command; Wrangler only bundles and deploys the generated
Worker:

```bash
bunx wrangler deploy --dry-run --config wrangler.jsonc
```

Do not edit `dist/` or `.wrangler/`; they are generated and ignored. The
Wrangler config intentionally has no `build` block: adding one causes a second
build during `wrangler deploy`. Configure Workers Builds watch paths in the
Cloudflare dashboard; see [`docs/CLOUDFLARE_BUILDS.md`](../../docs/CLOUDFLARE_BUILDS.md).

The app intentionally retains `src/middleware.ts` with a Web API-only
middleware implementation applying the shared `SECURITY_HEADERS` plus agent
discovery headers.

## R2 publishing

Publish manifests and assets before deploying a build that references new
content. Use the dry-run form first, and keep S3 credentials in the ignored
`apps/blog/.env.local` file or use Wrangler OAuth. Never put credentials in
source, fixtures, or `.env.example` files.

```bash
bun --cwd apps/blog publish:gallery-manifests --dry-run
bun --cwd apps/blog publish:blog-posts --dry-run
bun --cwd apps/blog publish:blog-assets --dry-run
```

Versioned R2 image and data keys may use long-lived immutable caching. Change
the asset version when an object at an existing key changes; do not add a
browser cache that can serve mutable manifests indefinitely.

## Recovery checklist

For a Worker 500, remove generated output, run the root Astro build, and
inspect the route verification before considering a deployment. Keep runtime
fixes in source configuration or application code; do not patch generated
Worker files after the build finishes.
