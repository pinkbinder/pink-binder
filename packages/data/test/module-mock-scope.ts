import { afterAll, mock } from 'bun:test'

/**
 * `mock.module()` registrations are process-global and survive the file that
 * registered them: in a shared `bun test` run, a stub installed by one test
 * file stays in the module registry for every file that loads afterwards, so
 * later files exercising the real module get the stub instead
 * (pinkbinder/blog-pipeline#35).
 *
 * This helper keeps stubs scoped to the file that registered them:
 *
 * 1. The root test preload (`test/preload.ts`) calls `captureRealModules`
 *    while the registry is still clean, snapshotting each mocked module's
 *    real exports.
 * 2. Each file that calls `mock.module` also calls `restoreModuleMocks` with
 *    the same specifiers; after the file's tests finish, the real exports are
 *    re-registered so subsequent files bind real modules again.
 *
 * `mock.restore()` does not undo `mock.module` registrations — re-registering
 * the captured exports is the only way to hand the real module back.
 */
const realExports = new Map<string, Record<string, unknown>>()

/**
 * Every specifier stubbed by a `mock.module` call in this package's tests,
 * written relative to this file. `packages/data/test/module-mock-scope.test.ts`
 * enforces that this list stays in sync with the test suite.
 */
export const MOCKED_MODULE_SPECS = [
  '@repo/marketplaces/config',
  '@repo/marketplaces/tcgplayer',
  '../src/pokemon/artwork',
  '../src/pokemon/image-urls',
] as const

/**
 * Preload-only: snapshot the real exports for every specifier the suite
 * mocks. Must run before any test file evaluates so `import` still resolves
 * the real modules.
 */
export async function captureRealModules() {
  for (const spec of MOCKED_MODULE_SPECS) {
    realExports.set(import.meta.resolveSync(spec), {
      ...((await import(spec)) as Record<string, unknown>),
    })
  }
}

/**
 * Re-register the real exports of `specs` after this file's tests run. Call
 * once per test file that uses `mock.module`, passing the same specifiers —
 * they are resolved against the caller's `import.meta`, so write them exactly
 * as they appear in the `mock.module` calls.
 */
export function restoreModuleMocks(meta: ImportMeta, ...specs: string[]) {
  afterAll(() => {
    // The preload never ran (e.g. a single-file `bun test` invocation without
    // the repo bunfig): nothing was captured and nothing can leak, since this
    // file's mocks die with the process.
    if (realExports.size === 0) return
    for (const spec of specs) {
      const resolved = meta.resolveSync(spec)
      const real = realExports.get(resolved)
      if (!real) {
        throw new Error(
          `mock.module('${spec}') has no captured real module; add it to ` +
            `MOCKED_MODULE_SPECS in packages/data/test/module-mock-scope.ts`
        )
      }
      mock.module(resolved, () => real)
    }
  })
}
