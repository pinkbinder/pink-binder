import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import viteSolid from 'vite-plugin-solid'
import { defineConfig } from 'vite'

// The Cloudflare plugin must precede tanstackStart() so the SSR environment
// is available when Start wires up its server/client builds.
// https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/
export default defineConfig({
  server: {
    // Tailscale MagicDNS hostname used for shared dev-server links.
    allowedHosts: ['amf-mb-pro'],
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteSolid({ ssr: true }),
    tailwindcss(),
  ],
})
