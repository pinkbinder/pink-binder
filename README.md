# Pink Binder

A modern NextJS Turborepo monorepo for Pink Binder apps.

## Apps

| App            | Port | Description     |
| -------------- | ---- | --------------- |
| `apps/landing` | 3000 | Landing page    |
| `apps/store`   | 3001 | Online store    |
| `apps/blog`    | 3002 | Blog            |
| `apps/admin`   | 3003 | Admin dashboard |

## Packages

| Package                      | Description                         |
| ---------------------------- | ----------------------------------- |
| `packages/ui`                | Shared UI components (ShadCN-based) |
| `packages/typescript-config` | Shared TypeScript configurations    |

## Getting Started

```bash
# Install dependencies
bun install

# Pull env from Cloudflare (once per app you run locally)
# Secrets live in Cloudflare Workers (wrangler secret) per app
# For local dev, copy from Cloudflare dashboard or use wrangler:
#   CLOUDFLARE_ACCOUNT_ID=e9b73b1b6c312b889732f29b884a5166 bunx wrangler secret list --name landing  (or check dashboard)
# Or duplicate from apps/landing/.env.local if you have it

# Run all apps in development
bun dev

# Build all apps
bun build
```

Environment variables are managed in Cloudflare Workers — see [`docs/ENV_SETUP.md`](docs/ENV_SETUP.md) and [`.env.example`](.env.example). Blog release, monitoring, Pinterest, and SEO operations are documented in [`docs/BLOG_PRODUCTION_OPERATIONS.md`](docs/BLOG_PRODUCTION_OPERATIONS.md).

Cloudflare Workers Builds setup, monorepo watch paths, build caching, and the
GitHub deployment-status behavior are documented in
[`docs/CLOUDFLARE_BUILDS.md`](docs/CLOUDFLARE_BUILDS.md).

## eBay marketplace account deletion notifications

Configure this callback URL in your eBay marketplace account deletion notification settings:

- `https://<your-domain>/api/ebay/account-deletion`

Set this environment variable for `apps/landing`:

- `EBAY_VERIFICATION_TOKEN`: The verification token value configured in your eBay notification subscription.
- `EBAY_ACCOUNT_DELETION_ENDPOINT` (optional): Exact public callback URL to use for challenge hashing when your runtime request host differs from the registered eBay endpoint URL.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN/ui
- **Build**: Turborepo
- **Package Manager**: bun (`bun install --frozen-lockfile`)
- **Linting**: Oxlint + Oxfmt
- **Git Hooks**: Husky + lint-staged
