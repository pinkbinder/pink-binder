import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const app = process.argv[2]
const supportedApps = new Set(['admin', 'blog', 'landing', 'store'])

if (!supportedApps.has(app)) {
  console.error(`Usage: bun run build:cloudflare -- <${[...supportedApps].join('|')}>`)
  process.exit(1)
}

function runBun(args, cwd = repositoryRoot) {
  const result = spawnSync('bun', args, {
    cwd,
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

runBun(['install', '--frozen-lockfile'])
runBun(['x', 'turbo', 'run', 'build', `--filter=@repo/${app}`])
runBun(['x', 'opennextjs-cloudflare', 'build'], resolve(repositoryRoot, 'apps', app))
