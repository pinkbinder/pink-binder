import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { mock } from 'bun:test'

// Register happy-dom globals BEFORE @testing-library/dom is loaded by any test.
if (!(globalThis as { happyDOM?: unknown }).happyDOM) {
  GlobalRegistrator.register()
}

// Replicate the vitest `server-only` alias stub so importing `server-only` is a no-op.
mock.module('server-only', () => ({}))
