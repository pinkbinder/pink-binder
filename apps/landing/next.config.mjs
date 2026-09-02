import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ebayListingImageRemotePatterns,
  googleFaviconRemotePatterns,
} from '@repo/marketplaces/next-images'
import { loadMonorepoEnv } from '../../scripts/load-monorepo-env.mjs'
import { withMonorepoDevSupport } from '../../scripts/next-monorepo-config.mjs'

const appDir = path.dirname(fileURLToPath(import.meta.url))

// Fallback when Next is started directly from apps/landing (not via root `bun run dev`).
loadMonorepoEnv({ startDir: appDir })

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'",
  },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
]

/** @type {import('next').NextConfig} */
const nextConfig = withMonorepoDevSupport(
  {
    transpilePackages: ['@repo/ui', '@repo/config', '@repo/data', '@repo/marketplaces'],
    images: {
      remotePatterns: [...googleFaviconRemotePatterns(), ...ebayListingImageRemotePatterns()],
    },
    async headers() {
      return [{ source: '/:path*', headers: securityHeaders }]
    },
    poweredByHeader: false,
  },
  {
    appDir,
    // Barrel optimization is build-only here — enabling it in dev caused stale @repo/ui HMR.
    optimizePackageImports: ['@repo/ui'],
  }
)

export default nextConfig
