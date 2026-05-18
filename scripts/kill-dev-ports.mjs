#!/usr/bin/env node
import { execSync } from 'node:child_process'

const PORTS = [3000, 3001, 3002, 3003]

if (process.platform === 'win32') {
  console.warn('kill-dev-ports: skipped on Windows (use Task Manager or netstat to free ports)')
  process.exit(0)
}

for (const port of PORTS) {
  try {
    const pids = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' }).trim()
    if (!pids) continue
    for (const pid of pids.split('\n').filter(Boolean)) {
      process.kill(Number(pid), 'SIGTERM')
    }
    console.log(`Freed port ${port}`)
  } catch {
    // Nothing listening on this port.
  }
}
