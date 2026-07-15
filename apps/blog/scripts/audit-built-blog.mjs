import { spawn } from 'node:child_process'

const baseUrl = 'http://127.0.0.1:3212'
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: '3212', HOSTNAME: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
server.stdout.pipe(process.stdout)
server.stderr.pipe(process.stderr)

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1_000) })
      if (response.ok) return
    } catch {
      // Build startup is expected to take a few seconds.
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('Compiled blog server did not become ready within 60 seconds')
}

try {
  await waitForServer()
  const audit = spawn(
    process.execPath,
    [
      'scripts/audit-blog-routes.mjs',
      '--base-url',
      baseUrl,
      '--max-posts',
      process.env.BLOG_AUDIT_MAX_POSTS ?? '0',
    ],
    { cwd: process.cwd(), stdio: 'inherit' }
  )
  const exitCode = await new Promise((resolve) => audit.on('exit', (code) => resolve(code ?? 1)))
  if (exitCode !== 0) process.exitCode = exitCode
} finally {
  server.kill('SIGTERM')
  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ])
  if (server.exitCode === null) server.kill('SIGKILL')
}
