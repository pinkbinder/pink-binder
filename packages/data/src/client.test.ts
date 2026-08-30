import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'bun:test'

describe('@repo/data/client', () => {
  it('does not re-export the Node-backed utilities barrel', () => {
    const source = readFileSync(new URL('./client.ts', import.meta.url), 'utf8')

    expect(source).toContain("export * from './utils/slug'")
    expect(source).not.toContain("export * from './utils'")
  })
})
