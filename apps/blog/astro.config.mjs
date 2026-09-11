import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

/**
 * Registers `client:interaction` — hydrate the island on the user's first
 * interaction intent with it (see client-directives/interaction.js).
 * @returns {import('astro').AstroIntegration}
 */
function interactionDirective() {
  return {
    name: 'blog:interaction-directive',
    hooks: {
      'astro:config:setup': ({ addClientDirective }) => {
        addClientDirective({
          name: 'interaction',
          entrypoint: './client-directives/interaction.js',
        })
      },
    },
  }
}

// Keep the existing data/config packages on process.env while allowing
// direct Astro development to read apps/blog/.env.local as expected.
const localEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '')
for (const [key, value] of Object.entries(localEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value
  }
}

export default defineConfig({
  site: 'https://pinkbinder.blog',
  output: 'server',
  session: false,
  adapter: cloudflare({
    configPath: './astro.wrangler.jsonc',
    imageService: 'passthrough',
  }),
  integrations: [react(), interactionDirective()],
  vite: {
    ssr: {
      noExternal: ['@repo/config', '@repo/data', '@repo/marketplaces', '@repo/ui'],
    },
    // `server-only` is a Next.js marker whose default export throws
    // unconditionally; only its `react-server` condition is empty. Astro
    // renders islands on the server inside Workers with no such condition,
    // so stub it to an empty module (absolute path bypasses the package
    // exports map, which does not expose the empty file). This app never
    // hydrates server-only code paths — R2/disk fallbacks catch absence.
    resolve: {
      alias: [
        {
          find: /^server-only$/,
          replacement: new URL('./src/lib/server-only-stub.ts', import.meta.url).pathname,
        },
      ],
    },
  },
})
