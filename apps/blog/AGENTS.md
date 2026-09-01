# Blog agent guide

The blog is a Next.js app packaged for Cloudflare Workers with OpenNext. Keep
the Worker runtime filesystem-independent: published post and gallery data is
read from the `pink-binder` R2 bucket, while the OpenNext incremental cache is
stored in `blog-opennext-cache-v3`.

## Build and deploy checks

Run the build from the repository root:

```bash
bun run build:cloudflare -- blog
```

Run Wrangler from this directory because `wrangler.jsonc` uses a repository
relative custom-build directory:

```bash
bunx wrangler deploy --dry-run --config wrangler.jsonc
```

Do not edit `.next/`, `.open-next/`, or `.wrangler/`; they are generated and
ignored. The Wrangler watcher is intentionally limited to source directories
so a generated build cannot restart its own build.

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

For a Worker 500, remove generated output, run the root OpenNext build, and
inspect the route-trace verification before considering a deployment. Keep
runtime fixes in source configuration or application code; do not patch
generated Worker files after OpenNext finishes.
