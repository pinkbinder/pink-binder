import cloudflare from '@astrojs/cloudflare'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

// Keep the existing marketplace/data packages on process.env while allowing
// direct Astro development to read apps/landing/.env.local as expected.
const localEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '')
for (const [key, value] of Object.entries(localEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value
  }
}

export default defineConfig({
  site: 'https://pinkbinder.shop',
  output: 'server',
  session: false,
  adapter: cloudflare({
    configPath: './astro.wrangler.jsonc',
    imageService: 'passthrough',
  }),
  vite: {
    ssr: {
      noExternal: ['@repo/config', '@repo/data', '@repo/marketplaces', '@repo/ui'],
    },
  },
})
