#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { loadMonorepoEnv } from './load-monorepo-env.mjs'

loadMonorepoEnv()

const [, , ...command] = process.argv
if (command.length === 0) {
  console.error('Usage: node scripts/with-env.mjs <command> [args...]')
  process.exit(1)
}

const child = spawn(command[0], command.slice(1), {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
