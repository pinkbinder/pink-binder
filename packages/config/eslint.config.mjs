import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default [
  ...compat.config({
    root: true,
    extends: ['@repo/eslint-config/library'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: true,
    },
  }),
  {
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
  {
    files: ['test/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
]
