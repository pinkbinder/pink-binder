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
| `packages/eslint-config`     | Shared ESLint configurations        |

## Getting Started

```bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Build all apps
pnpm build

# Lint all workspaces
pnpm lint
```

## eBay marketplace account deletion notifications

Configure this callback URL in your eBay marketplace account deletion notification settings:

- `https://<your-domain>/api/ebay/account-deletion`

Set this environment variable for `apps/landing`:

- `EBAY_VERIFICATION_TOKEN`: The verification token value configured in your eBay notification subscription.
- `EBAY_ACCOUNT_DELETION_ENDPOINT` (optional): Exact public callback URL to use for challenge hashing when your runtime request host differs from the registered eBay endpoint URL.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN/ui
- **Build**: Turborepo
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
