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

Publishing article artifacts, render HTML, gallery manifests, and image
variants is owned by the private `pinkbinder/blog-pipeline` repository
(its Publish Data workflow renders article HTML, uploads artifacts, and
purges the blog CDN cache). This app only reads from R2 at request time;
do not add publish scripts here.

Local development without an R2 binding renders an empty grid and 404
articles. Use the data service's `seed-local-r2` script (or Wrangler R2
bindings) to populate a local bucket for offline work.

## Recovery checklist

For a Worker 500, remove generated output, run the root Astro build, and
inspect the route verification before considering a deployment. Keep runtime
fixes in source configuration or application code; do not patch generated
Worker files after the build finishes.
