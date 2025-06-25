// Test setup file
import { vi } from 'vitest'

// Mock external dependencies that require network calls
vi.mock('@sanity/cli', () => ({
  default: {}
}))

// Mock spawn for CLI testing
vi.mock('cross-spawn', () => ({
  sync: vi.fn()
}))

// Mock ora (spinner) for cleaner test output
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis()
  }))
}))

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}
