const nextCoreWebVitals = require('eslint-config-next/core-web-vitals')
const eslintConfigPrettier = require('eslint-config-prettier')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]
