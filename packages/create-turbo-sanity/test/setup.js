import { vi } from 'vitest'

// Global test setup
globalThis.vi = vi

// Mock console methods to reduce noise
globalThis.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}
