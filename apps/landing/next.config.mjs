import path from 'node:path'
import { fileURLToPath } from 'node:url'
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
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'www.google.com',
          pathname: '/s2/favicons/**',
        },
        {
          protocol: 'https',
          hostname: 'i.ebayimg.com',
        },
        {
          protocol: 'https',
          hostname: 'thumbs.ebaystatic.com',
        },
      ],
    },
  },
  {
    appDir,
    // Barrel optimization is build-only here — enabling it in dev caused stale @repo/ui HMR.
    optimizePackageImports: ['@repo/ui'],
  }
)

export default nextConfig
