import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const repositoryRoot = fileURLToPath(new URL('.', import.meta.url))
const domSetup = resolve(repositoryRoot, 'test/setup-dom.ts')
const serverOnlyStub = resolve(repositoryRoot, 'test/stubs/server-only.ts')

function workspaceProject(name: string, directory: string, environment: 'node' | 'jsdom') {
  const root = resolve(repositoryRoot, directory)

  return {
    extends: true,
    root,
    oxc: {
      jsx: {
        runtime: 'automatic',
      },
    },
    resolve: {
      tsconfigPaths: true,
      dedupe: ['react', 'react-dom'],
      alias: {
        'server-only': serverOnlyStub,
      },
    },
    test: {
      name,
      environment,
      include: ['**/*.{test,spec}.{ts,tsx}'],
      setupFiles: environment === 'jsdom' ? [domSetup] : [],
    },
  }
}

export default defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    projects: [
      workspaceProject('admin', 'apps/admin', 'jsdom'),
      workspaceProject('blog', 'apps/blog', 'jsdom'),
      workspaceProject('landing', 'apps/landing', 'jsdom'),
      workspaceProject('store', 'apps/store', 'jsdom'),
      workspaceProject('config', 'packages/config', 'node'),
      workspaceProject('data', 'packages/data', 'node'),
      workspaceProject('marketplaces', 'packages/marketplaces', 'node'),
      workspaceProject('ui', 'packages/ui', 'jsdom'),
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary', 'lcov'],
      reportsDirectory: 'coverage',
      include: [
        'apps/*/app/**/*.{ts,tsx}',
        'apps/*/components/**/*.{ts,tsx}',
        'apps/*/lib/**/*.{ts,tsx}',
        'packages/config/src/**/*.ts',
        'packages/data/src/**/*.ts',
        'packages/marketplaces/src/**/*.ts',
        'packages/ui/src/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.{test,spec}.{ts,tsx}',
        '**/.next/**',
        '**/.turbo/**',
        '**/build/**',
        '**/cache/**',
        '**/coverage/**',
        '**/dist/**',
        '**/node_modules/**',
      ],
      thresholds: {
        branches: 29,
        functions: 39,
        lines: 40,
        statements: 40,
      },
    },
  },
})
