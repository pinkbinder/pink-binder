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

## Article rendering

Article pages serve **prebuilt HTML** that the private data service renders
offline and publishes to the `pink-binder` R2 bucket
(`v1/render/<kind>/<slug>.html`). The JSON artifacts under
`v1/data/blogs/<kind>/<slug>.json` supply page metadata (title, description,
canonical, image, dates). This Worker performs no generation logic: it joins
the two artifacts per request and sets long `s-maxage` +
`stale-while-revalidate` headers so responses are edge-cached; the data
service purges the CDN cache after each publish.

## Data pipeline and publishing

The generation pipeline, datasets, gallery/image publishing, and the article
renderer live in the **private** `pinkbinder/blog-pipeline` repository.
`packages/data` here is the public-safe client surface (artifact types and
pure helpers) that the frontend needs to read those artifacts.
