import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

// Keep the shared data/config packages on process.env while allowing direct
// Astro development to read apps/store/.env.local as expected.
const localEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '')
for (const [key, value] of Object.entries(localEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value
  }
}

export default defineConfig({
  site: 'https://pinkbinder.shop',
  output: 'server',
  adapter: cloudflare({
    configPath: './astro.wrangler.jsonc',
    imageService: 'passthrough',
  }),
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: ['@repo/config', '@repo/data', '@repo/marketplaces', '@repo/ui'],
    },
  },
})
