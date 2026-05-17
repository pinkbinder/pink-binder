import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nextEnv from '@next/env'

// Load shared monorepo env (root .env.local) for marketplace API keys.
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
nextEnv.loadEnvConfig(monorepoRoot)

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
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

export default nextConfig;
