module.exports = {
  root: true, // This prevents ESLint from looking for config files in parent directories
  env: {
    node: true,
    es2022: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off'
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      env: {
        node: true,
        'vitest-globals/env': true
      },
      extends: [
        'plugin:vitest-globals/recommended'
      ],
      rules: {
        'no-unused-expressions': 'off'
      }
    }
  ]
}
