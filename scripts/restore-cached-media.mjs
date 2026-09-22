import { cpSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Re-copies an app's public files into its client output after a turbo cache
 * hit. The cf:build cache scope excludes copied public media (images, icons,
 * favicon) to stay under the Workers request body limit, so a restored
 * output needs them back before the deploy upload — and a cache hit implies
 * the inputs (including the public dir) are unchanged, so re-copying them is
 * byte-identical to what the build would have done.
 *
 * Usage: bun scripts/restore-cached-media.mjs <admin|blog|landing>
 */
const APPS = {
  admin: { out: 'apps/admin/dist/client', public: 'apps/admin/public' },
  blog: { out: 'apps/blog/dist/client', public: 'apps/blog/public' },
  landing: { out: 'apps/landing/dist/client', public: 'apps/landing/public' },
}

const app = process.argv[2]
const paths = APPS[app]
if (!paths) {
  console.error(`[restore-cached-media] unknown app: ${app}`)
  process.exit(1)
}

const target = join(process.cwd(), paths.out)
const publicDir = join(process.cwd(), paths.public)
if (!existsSync(target)) {
  console.log('[restore-cached-media] no build output; skipping')
  process.exit(0)
}
if (!existsSync(publicDir)) {
  console.error(`[restore-cached-media] missing public dir: ${paths.public}`)
  process.exit(1)
}

let restored = 0
for (const entry of readdirSync(publicDir)) {
  const destination = join(target, entry)
  if (existsSync(destination)) continue
  cpSync(join(publicDir, entry), destination, { recursive: true })
  restored += 1
}

console.log(`[restore-cached-media] ${restored} public entries restored into ${paths.out}`)
