const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parser: '@typescript-eslint/parser',
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['node_modules/', 'dist/', '.*.js'],
  rules: {
    // New in eslint-plugin-react-hooks@7; existing URL/carousel sync patterns are intentional.
    'react-hooks/set-state-in-effect': 'off',
  },
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
    },
  ],
}
