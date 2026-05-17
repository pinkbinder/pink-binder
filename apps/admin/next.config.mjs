/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
  experimental: {
    optimizePackageImports: ['@repo/ui'],
  },
}

export default nextConfig
