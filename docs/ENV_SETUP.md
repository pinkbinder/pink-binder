# Environment Variables Setup Guide

This monorepo shares configuration and API keys across all Next.js apps (landing, admin, blog, store).

## How It Works

### Root-Level Shared Environment (`.env.local`)

Shared configuration is stored in the root `.env.local`, accessible to all apps:

- **Marketplace APIs**: `ETSY_SHOP_ID`, `ETSY_KEYSTRING`, `ETSY_SECRET`, `EBAY_APP_ID`, `EBAY_CLIENT_SECRET`
- **Whatnot Scraper**: `WHATNOT_USERNAME`, `WHATNOT_USER_AGENT`, `WHATNOT_SCRAPE_CACHE_TTL_MS`, `LIVE_SHOWS_SOURCE_URL`, `LIVE_SHOWS_SOURCE_TOKEN`
- **Client-Side Polling**: `NEXT_PUBLIC_SHOWS_POLL_INTERVAL_MS` (requires `NEXT_PUBLIC_` prefix)
- **Site URLs**: `NEXT_PUBLIC_SITE_URL` (requires `NEXT_PUBLIC_` prefix)

**By default, all variables are server-side only** (not exposed to browser). Use `NEXT_PUBLIC_` prefix for client-side access.

### Per-App Environment Files

Each app can have its own `.env.example` documenting available variables:

- App-specific config
- Inherited shared keys from root (documented in the `.env.example`)
- Client-side variables using `NEXT_PUBLIC_` prefix

## Accessing Shared Keys in Each App

### Option 1: Load Root `.env.local` in Each App (Recommended)

Update each app's `next.config.mjs` to load parent env vars:

```javascript
// apps/landing/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js will automatically load .env.local from the root
  // when running dev/build from the monorepo root
}
export default nextConfig
```

### Option 2: Duplicate Keys in Each App's `.env.local` (Not Recommended)

If you need isolation, duplicate the API keys in each app's `.env.local`.

## Environment Variable Naming

### Server-Side Only (Default) — Do NOT Expose

```env
ETSY_SHOP_ID=cutepkmn
ETSY_KEYSTRING=xxx
ETSY_SECRET=xxx
EBAY_APP_ID=xxx
EBAY_CLIENT_SECRET=xxx
EBAY_VERIFICATION_TOKEN=xxx
WHATNOT_USERNAME=thepinkbinder
WHATNOT_USER_AGENT=custom-ua
WHATNOT_SCRAPE_CACHE_TTL_MS=60000
LIVE_SHOWS_SOURCE_URL=https://...
LIVE_SHOWS_SOURCE_TOKEN=xxx
```

✅ Available in API routes and server components
❌ NOT available in browser/client components
⚠️ Safe to contain sensitive API keys and credentials

### Client-Side (REQUIRES `NEXT_PUBLIC_` Prefix)

```env
NEXT_PUBLIC_SHOWS_POLL_INTERVAL_MS=60000
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_...
```

✅ Available everywhere (browser + server)
⚠️ NEVER put sensitive data here — these values appear in browser's global scope

## Accessing Variables in Code

### Server-Side (API Routes, Server Components)

```javascript
// Can access both server-side and NEXT_PUBLIC_ vars
const etsyShopId = process.env.ETSY_SHOP_ID // ✅ Available
const ebayAppId = process.env.EBAY_APP_ID // ✅ Available
const ebayClientSecret = process.env.EBAY_CLIENT_SECRET // ✅ Available
const whatnotUser = process.env.WHATNOT_USERNAME // ✅ Available
const pollInterval = process.env.NEXT_PUBLIC_SHOWS_POLL_INTERVAL_MS // ✅ Available
```

### Client-Side (Client Components, Browser)

```javascript
// Can ONLY access variables with NEXT_PUBLIC_ prefix
const pollInterval = process.env.NEXT_PUBLIC_SHOWS_POLL_INTERVAL_MS // ✅ Available
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL // ✅ Available

// These will be undefined in the browser:
const ebayAppId = process.env.EBAY_APP_ID // ❌ Undefined
const whatnotUser = process.env.WHATNOT_USERNAME // ❌ Undefined
```

## Files Created

- `.env.local` (root) - Shared configuration (API keys, Whatnot settings, client polling)
- `.env.example` (root) - Template for shared variables
- `apps/*/env.example` - App-specific templates with inherited variables documented

## Summary of Variable Classification

| Variable                             | Location        | Access           | Sensitive |
| ------------------------------------ | --------------- | ---------------- | --------- |
| `ETSY_*`, `EBAY_*`                   | Root .env.local | Server-side only | ✅ Yes    |
| `WHATNOT_*`, `LIVE_SHOWS_*`          | Root .env.local | Server-side only | ⚠️ Partly |
| `NEXT_PUBLIC_SHOWS_POLL_INTERVAL_MS` | Root .env.local | Client + Server  | ❌ No     |
| `NEXT_PUBLIC_SITE_URL`               | Root .env.local | Client + Server  | ❌ No     |
| `STRIPE_SECRET_KEY`                  | App .env.local  | Server-side only | ✅ Yes    |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`      | App .env.local  | Client + Server  | ❌ No     |
