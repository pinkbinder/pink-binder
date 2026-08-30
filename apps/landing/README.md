# Pink Binder — landing

Part of the Pink Binder Turborepo monorepo.

## Environment Variables

Environment variables are managed in the **Cloudflare Worker** (source of truth). Set local values separately:

```bash
# Create apps/landing/.env.local (gitignored) with the values needed for local development.
```

To update deployed values:

```bash
wrangler secret put <NAME> --config apps/landing/wrangler.jsonc
# or set secrets and variables in the Cloudflare Worker dashboard
```

> Never commit `.env.local` — it is gitignored.
