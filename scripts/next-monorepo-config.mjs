import path from 'node:path'

/**
 * Monorepo root (two levels above `apps/<app>`).
 * @param {string} appDir Absolute path to the Next.js app directory.
 */
export function getMonorepoRoot(appDir) {
  return path.resolve(appDir, '../..')
}

/**
 * Webpack watch settings so HMR picks up changes in pnpm workspace packages (`@repo/*`).
 * @param {import('webpack').Configuration} config
 * @param {{ dev: boolean }} ctx
 */
export function applyMonorepoWebpackDevWatch(config, { dev }) {
  if (!dev) {
    return config
  }

  config.watchOptions = {
    ...config.watchOptions,
    followSymlinks: true,
    ignored: ['**/node_modules/**', '!**/node_modules/@repo/**'],
  }

  return config
}

/**
 * Shared dev settings for Next apps in this Turborepo.
 * @param {import('next').NextConfig} config
 * @param {{ appDir: string, optimizePackageImports?: string[] }} options
 */
export function withMonorepoDevSupport(config, { appDir, optimizePackageImports = [] }) {
  const monorepoRoot = getMonorepoRoot(appDir)
  const isDev = process.env.NODE_ENV !== 'production'

  const userWebpack = config.webpack

  return {
    ...config,
    turbopack: {
      ...config.turbopack,
      root: monorepoRoot,
    },
    experimental: {
      ...config.experimental,
      ...(isDev || optimizePackageImports.length === 0 ? {} : { optimizePackageImports }),
    },
    webpack: (webpackConfig, ctx) => {
      let next = userWebpack ? (userWebpack(webpackConfig, ctx) ?? webpackConfig) : webpackConfig
      return applyMonorepoWebpackDevWatch(next, ctx)
    },
  }
}
