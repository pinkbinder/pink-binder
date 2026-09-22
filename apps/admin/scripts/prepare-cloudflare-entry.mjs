import { copyFileSync, readdirSync } from 'node:fs'

const serverDirectory = new URL('../dist/server/', import.meta.url)
const assetsDirectory = new URL('./assets/', serverDirectory)

const copyStableAsset = (name, predicate) => {
  const match = readdirSync(assetsDirectory).find((entry) => predicate(entry))
  if (!match) {
    throw new Error(`Missing generated Cloudflare asset: ${name}`)
  }

  copyFileSync(new URL(match, assetsDirectory), new URL(`${name}.js`, serverDirectory))
}

copyStableAsset(
  'server-fn-resolver',
  (entry) =>
    entry.startsWith('__') &&
    entry.includes('tanstack-start-server-fn-resolver-') &&
    entry.endsWith('.js')
)
copyStableAsset(
  'start-manifest',
  (entry) => entry.startsWith('_tanstack-start-manifest_v-') && entry.endsWith('.js')
)
