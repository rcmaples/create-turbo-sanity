import fs from 'fs-extra'
import path from 'path'
import { tmpdir } from 'os'

/**
 * Create a temporary directory for testing
 */
export async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'create-turbo-sanity-test-'))
  return tempDir
}

/**
 * Clean up temporary directory
 */
export async function cleanupTempDir(tempDir) {
  if (await fs.pathExists(tempDir)) {
    await fs.remove(tempDir)
  }
}

/**
 * Mock Sanity user config
 */
export function createMockSanityConfig(authToken = 'mock-token') {
  return {
    authToken,
    userId: 'mock-user-id'
  }
}

/**
 * Mock Sanity project data
 */
export function createMockProject(overrides = {}) {
  return {
    id: 'mock-project-id',
    displayName: 'Mock Project',
    createdAt: '2023-01-01T00:00:00Z',
    organizationId: 'mock-org-id',
    ...overrides
  }
}

/**
 * Mock Sanity dataset data
 */
export function createMockDataset(overrides = {}) {
  return {
    name: 'production',
    aclMode: 'public',
    ...overrides
  }
}

/**
 * Mock command line arguments
 */
export function createMockArgs(overrides = {}) {
  return {
    argsWithoutOptions: ['test-project'],
    extOptions: {
      yes: false,
      template: 'default',
      packageManager: 'pnpm',
      ...overrides
    }
  }
}

/**
 * Check if a directory structure matches expected template
 */
export async function verifyProjectStructure(projectDir) {
  const expectedFiles = [
    'package.json',
    'turbo.json',
    'pnpm-workspace.yaml',
    'apps/web/package.json',
    'apps/studio/package.json',
    'apps/studio/sanity.config.ts',
    'packages/eslint-config/package.json',
    'packages/typescript-config/package.json'
  ]

  const results = {}
  
  for (const file of expectedFiles) {
    const filePath = path.join(projectDir, file)
    results[file] = await fs.pathExists(filePath)
  }
  
  return results
}

/**
 * Read and parse a JSON file
 */
export async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content)
}
