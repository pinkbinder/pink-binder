import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { plugin } from 'bun'
import { captureRealModules } from '../packages/data/test/module-mock-scope'

// Register happy-dom globals BEFORE any testing-library/Solid modules load.
if (!(globalThis as { happyDOM?: unknown }).happyDOM) {
  GlobalRegistrator.register()
}

const SOLID_ROOT = new URL('../node_modules/solid-js', import.meta.url).pathname

/**
 * Bun resolves `solid-js` with the `node` export condition, which points at the
 * server build where DOM rendering APIs throw. Tests run against happy-dom, so
 * redirect the server dist files to their browser counterparts in `onLoad`
 * (Bun's plugin `onResolve` does not intercept runtime resolution under
 * `bun test`, and `mock.module` does not reach node_modules importers).
 */
const SERVER_BUILD_REDIRECTS: [RegExp, string][] = [
  [/\/solid-js\/dist\/server\.js$/, `${SOLID_ROOT}/dist/solid.js`],
  [/\/solid-js\/web\/dist\/server\.js$/, `${SOLID_ROOT}/web/dist/web.js`],
  [/\/solid-js\/store\/dist\/server\.js$/, `${SOLID_ROOT}/store/dist/store.js`],
]

/**
 * `.tsx` sources are compiled with babel-preset-solid; Bun's own JSX pipeline
 * can't emit Solid's `createComponent` output.
 */
plugin({
  name: 'solid-test-env',
  setup(build) {
    for (const [filter, target] of SERVER_BUILD_REDIRECTS) {
      build.onLoad({ filter }, async () => ({
        contents: await Bun.file(target).text(),
        loader: 'js',
      }))
    }
    build.onLoad({ filter: /\.tsx$/ }, async ({ path }) => {
      if (path.includes('/node_modules/')) return undefined
      const source = await Bun.file(path).text()
      const { transformAsync } = await import('@babel/core')
      const result = await transformAsync(source, {
        filename: path,
        babelrc: false,
        configFile: false,
        presets: [['@babel/preset-typescript', {}], 'babel-preset-solid'],
        sourceMaps: 'inline',
      })
      return { contents: result?.code ?? '', loader: 'js' }
    })
  },
})

/**
 * Snapshot the real exports of every module that packages/data tests stub via
 * `mock.module`, while the registry is still clean. Test files re-register
 * these snapshots in `afterAll` via `restoreModuleMocks` so their process-
 * global stubs cannot leak into files that run after them (issue #35).
 */
await captureRealModules()
