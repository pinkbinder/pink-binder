import { bindings, defineConfig } from 'cf/config'

/**
 * Secret-like files were detected but not read or migrated: .env.example, .env.local, dist/server/.dev.vars. Only `secrets.required` entries are migrated.
 * @see https://developers.cloudflare.com/workers/configuration/secrets/
 */

export default defineConfig({
  accountId: 'e9b73b1b6c312b889732f29b884a5166',
  worker: {
    name: 'store',
    compatibilityDate: '2026-09-09',
    compatibilityFlags: [
      'nodejs_compat',
      'nodejs_compat_populate_process_env',
      'global_fetch_strictly_public',
    ],
    entrypoint: 'dist/server/entry.mjs',
    workersDev: true,
    observability: {
      enabled: true,
    },
    env: {
      ASSETS: bindings.assets(),
    },
  },
})
