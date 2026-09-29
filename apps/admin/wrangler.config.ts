import { defineWranglerConfig } from 'wrangler/experimental-config'

// Tooling-side settings for the cf deploy path; the worker itself is
// configured in cloudflare.config.ts. The Vite build already bundles the
// worker and emits additional server modules, so cf re-packages them with
// these rules instead of re-bundling.
export default defineWranglerConfig({
  noBundle: true,
  assetsDirectory: './dist/client',
  rules: [
    {
      type: 'ESModule',
      globs: ['**/*.js', '**/*.mjs'],
    },
  ],
})
