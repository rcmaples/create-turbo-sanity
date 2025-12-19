const globals = require('globals')
const js = require('@eslint/js')
const vitestGlobals = require('eslint-plugin-vitest-globals')

module.exports = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: ['templates/**'],
  },

  // Base configuration for all JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', {argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_'}],
      'no-console': 'off',
    },
  },

  // Test files configuration
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: vitestGlobals.environments.env.globals,
    },
    plugins: {
      'vitest-globals': vitestGlobals,
    },
    rules: {
      ...vitestGlobals.configs.recommended.rules,
      'no-unused-expressions': 'off',
    },
  },
]
