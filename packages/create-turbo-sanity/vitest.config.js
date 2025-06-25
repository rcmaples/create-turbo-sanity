import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    setupFiles: ['./test/setup.js']
  },
  esbuild: {
    target: 'node18'
  }
})
