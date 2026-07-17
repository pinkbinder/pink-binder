# Pink Binder — admin

Part of the Pink Binder Turborepo monorepo.

## Environment Variables

Environment variables are managed in **Vercel** (source of truth). Sync them locally:

```bash
# Link this project to its Vercel project (one-time)
vercel link 

# Pull all env vars into .env.local (gitignored)
vercel env pull .env.local
```

To push local changes back to Vercel:

```bash
vercel env push .env.local
# or set them per-environment (Production / Preview) in the Vercel dashboard
```

> Never commit `.env.local` — it is gitignored. For team projects use `vercel --scope niftyleague`.
