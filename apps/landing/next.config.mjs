import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ebayListingImageRemotePatterns,
  googleFaviconRemotePatterns,
} from '@repo/marketplaces/next-images'
import { loadMonorepoEnv } from '../../scripts/load-monorepo-env.mjs'
import { withMonorepoDevSupport } from '../../scripts/next-monorepo-config.mjs'

const appDir = path.dirname(fileURLToPath(import.meta.url))

// Fallback when Next is started directly from apps/landing (not via root `pnpm dev`).
loadMonorepoEnv({ startDir: appDir })

/** @type {import('next').NextConfig} */
const nextConfig = withMonorepoDevSupport(
  {
    transpilePackages: ['@repo/ui', '@repo/config', '@repo/data', '@repo/marketplaces'],
    images: {
      remotePatterns: [...googleFaviconRemotePatterns(), ...ebayListingImageRemotePatterns()],
    },
  },
  {
    appDir,
    // Barrel optimization is build-only here — enabling it in dev caused stale @repo/ui HMR.
    optimizePackageImports: ['@repo/ui'],
  }
)

export default nextConfig
