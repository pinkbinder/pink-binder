import { fileURLToPath } from 'node:url'
import { loadMonorepoEnv } from '../../scripts/load-monorepo-env.mjs'

// Fallback when Next is started directly from apps/landing (not via root `pnpm dev`).
loadMonorepoEnv({ startDir: fileURLToPath(new URL('.', import.meta.url)) })

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
  experimental: {
    optimizePackageImports: ['@repo/ui'],
  },
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
}

export default nextConfig
