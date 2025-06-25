import studio from '@sanity/eslint-config-studio'
import {baseConfig} from '@workspace/eslint-config/base'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import importPlugin from 'eslint-plugin-import'
import typescriptParser from '@typescript-eslint/parser'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  ...studio,
  ...baseConfig,
  {
    ignores: ['node_modules', '.sanity', 'eslint.config.mjs', 'sanity.types.ts'],
    plugins: {
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/no-default-export': 'error',
    },
  },
  {
    files: ['**/sanity.config.ts', '**/sanity.cli.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
]
