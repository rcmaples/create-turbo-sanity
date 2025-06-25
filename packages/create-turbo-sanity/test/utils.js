import { tmpdir } from 'os'
import { join } from 'path'
import { mkdtemp, rm } from 'fs/promises'

export async function createTempDir() {
  const prefix = join(tmpdir(), 'create-turbo-sanity-test-')
  return await mkdtemp(prefix)
}

export async function cleanupTempDir(tempDir) {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true })
  }
}

export function createMockArgs(options = {}) {
  return {
    extOptions: {
      yes: false,
      template: 'default',
      packageManager: 'pnpm',
      ...options
    }
  }
}

export function createMockSanityConfig(authToken) {
  return {
    authToken,
    userId: 'test-user-id'
  }
}
