import { defineConfig } from 'cf/config'

// Deploy source of truth for `cf deploy --prebuilt`. The Vite plugin keeps
// reading wrangler.jsonc (with its TanStack aliases) at build time; the
// emitted dist/server redirect is only used by the legacy wrangler path.
// Assets carry no binding: the platform serves dist/client before the
// Worker runs, matching the legacy config's assets-first behavior.
export default defineConfig({
  accountId: 'e9b73b1b6c312b889732f29b884a5166',
  worker: {
    name: 'admin',
    compatibilityDate: '2026-09-09',
    compatibilityFlags: ['nodejs_compat', 'nodejs_compat_populate_process_env'],
    entrypoint: 'dist/server/index.js',
    workersDev: true,
    observability: {
      enabled: true,
    },
  },
})
