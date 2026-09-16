import cloudflare from '@astrojs/cloudflare'
import solid from '@astrojs/solid-js'
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
  integrations: [solid(), interactionDirective()],
  vite: {
    server: {
      // Tailscale MagicDNS hostname used for shared dev-server links.
      allowedHosts: ['amf-mb-pro'],
    },
    ssr: {
      noExternal: ['@repo/config', '@repo/data', '@repo/marketplaces', '@repo/ui'],
    },
  },
})
