import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withMonorepoDevSupport } from '../../scripts/next-monorepo-config.mjs'

const appDir = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = withMonorepoDevSupport(
  {
    transpilePackages: ['@repo/ui', '@repo/config'],
  },
  { appDir, optimizePackageImports: ['@repo/ui'] }
)

export default nextConfig
