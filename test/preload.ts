import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { mock } from 'bun:test'

// Register happy-dom globals BEFORE @testing-library/dom is loaded by any test.
if (!(globalThis as { happyDOM?: unknown }).happyDOM) {
  GlobalRegistrator.register()
}

// Keep the `server-only` import as a no-op in the Bun test environment.
mock.module('server-only', () => ({}))
