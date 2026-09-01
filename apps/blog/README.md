# Pink Binder — blog

Part of the Pink Binder Turborepo monorepo.

## Environment Variables

Environment variables are managed in the **Cloudflare Worker** (source of truth). Set local values separately:

```bash
# Create apps/blog/.env.local (gitignored) with the values needed for local development.
```

To update deployed values:

```bash
wrangler secret put <NAME> --config apps/blog/wrangler.jsonc
# or set secrets and variables in the Cloudflare Worker dashboard
```

> Never commit `.env.local` — it is gitignored.

## Gallery manifest delivery

Canonical gallery manifests are published to the `pink-binder` R2 bucket under
`v1/data/galleries/<kind>/<slug>.json`. Publish them after
regenerating data and before deploying the Worker:

```bash
bun --cwd apps/blog publish:gallery-manifests --dry-run
bun --cwd apps/blog publish:gallery-manifests
```

The Worker serves R2 manifests exclusively through `/api/card-gallery`; the
repository does not ship a duplicate public gallery directory. The upload command
prefers the persistent bucket-scoped R2 S3 credentials in `apps/blog/.env.local`
and falls back to Wrangler OAuth when they are not configured.

Generated post artifacts are also published under
`v1/data/blogs/<kind>/<slug>.json`. The Worker reads the small index first and
fetches only the requested post artifact, keeping production rendering
filesystem-independent without image transformations.

```bash
bun --env-file=apps/blog/.env.local --cwd apps/blog publish:blog-posts --dry-run
bun --env-file=apps/blog/.env.local --cwd apps/blog publish:blog-posts
```

## Blog image delivery

The blog does not use Next.js runtime image optimization or a Cloudflare Images
binding. Blog-owned assets live under the versioned `v1/` namespace:

- `v1/images/brand/<asset>/<width>.webp` contains the small set of brand
  and promotional assets.
- `v1/images/pokemon/<small|large>/<source-key>.webp` contains the two
  prebuilt image sizes for every source image under the shared `pokemon/`
  namespace.
- `v1/data/galleries/<kind>/<slug>.json` contains the runtime gallery
  manifests.

The shared `pokemon/` namespace remains the canonical original-source store for
other apps. The blog prefers the appropriate static variant:

```bash
bun --cwd apps/blog publish:blog-assets --dry-run
bun --cwd apps/blog publish:blog-assets

# The persistent bucket-scoped R2 S3 credentials are preferred:
bun --env-file=apps/blog/.env.local --cwd apps/blog publish:pokemon-images --dry-run --limit 10
bun --env-file=apps/blog/.env.local --cwd apps/blog publish:pokemon-images
```

The versioned R2 objects use long-lived immutable caching. Bump the asset
version in the publisher and UI constants whenever a source image changes.
Publishers preserve animated GIF frames when encoding animated WebP. Card,
sprite, scene, and illustrator images prefer the static R2 variants; external
provider URLs remain fallbacks where the original data uses them.
