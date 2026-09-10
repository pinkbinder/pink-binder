# Pink Binder — landing

The Pink Binder landing page, built with Astro and deployed as a Cloudflare
Worker.

## Commands

Run from the repository root:

```bash
bun run dev:landing
bun run build
bun run build:cloudflare -- landing
bun --cwd apps/landing type-check
bun test apps/landing
```

## Environment variables

Environment variables are managed in the **Cloudflare Worker** (source of
truth). Set local values separately in `apps/landing/.env.local` for Astro
development. Never commit `.env.local`.

To update deployed values:

```bash
wrangler secret put <NAME> --config apps/landing/wrangler.jsonc
```
