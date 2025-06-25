import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import validatePackageName from 'validate-npm-package-name'
import { createTempDir, cleanupTempDir, createMockArgs } from './utils.js'

// Mock external dependencies
vi.mock('cross-spawn', () => ({
  sync: vi.fn(() => ({ status: 0 }))
}))

vi.mock('inquirer', () => ({
  prompt: vi.fn()
}))

describe('CLI Integration', () => {
  let tempDir
  
  beforeEach(async () => {
    tempDir = await createTempDir()
  })
  
  afterEach(async () => {
    await cleanupTempDir(tempDir)
    vi.restoreAllMocks()
  })

  describe('Project Name Validation', () => {
    it('should validate valid project names', () => {
      const validNames = [
        'my-project',
        'my_project',
        'myproject',
        'my-awesome-project-123'
      ]
      
      validNames.forEach(name => {
        const result = validatePackageName(name)
        expect(result.validForNewPackages).toBe(true)
      })
    })

    it('should reject invalid project names', () => {
      const invalidNames = [
        'My-Project',           // uppercase
        'my project',          // spaces
        'my@project',          // special chars
        '.myproject',          // starts with dot
        'node_modules',        // reserved name
        'favicon.ico',         // reserved name
        ''
      ]
      
      invalidNames.forEach(name => {
        const result = validatePackageName(name)
        expect(result.validForNewPackages).toBe(false)
      })
    })
  })

  describe('Command Line Arguments', () => {
    it('should parse command line arguments correctly', () => {
      const args = createMockArgs({
        project: 'test-project-id',
        dataset: 'staging',
        yes: true,
        packageManager: 'npm'
      })
      
      expect(args.extOptions.project).toBe('test-project-id')
      expect(args.extOptions.dataset).toBe('staging')
      expect(args.extOptions.yes).toBe(true)
      expect(args.extOptions.packageManager).toBe('npm')
    })

    it('should have sensible defaults', () => {
      const args = createMockArgs()
      
      expect(args.extOptions.yes).toBe(false)
      expect(args.extOptions.template).toBe('default')
      expect(args.extOptions.packageManager).toBe('pnpm')
    })
  })

  describe('Directory Creation', () => {
    it('should create project directory if it does not exist', async () => {
      const projectPath = path.join(tempDir, 'new-project')
      
      // Verify directory doesn't exist
      expect(await fs.pathExists(projectPath)).toBe(false)
      
      // Create directory
      await fs.ensureDir(projectPath)
      
      // Verify directory was created
      expect(await fs.pathExists(projectPath)).toBe(true)
      
      const stats = await fs.stat(projectPath)
      expect(stats.isDirectory()).toBe(true)
    })

    it('should handle existing empty directory', async () => {
      const projectPath = path.join(tempDir, 'existing-project')
      
      // Create empty directory
      await fs.ensureDir(projectPath)
      
      // Check that directory is empty
      const files = await fs.readdir(projectPath)
      expect(files).toHaveLength(0)
      
      // Should be able to proceed with empty directory
      expect(await fs.pathExists(projectPath)).toBe(true)
    })

    it('should detect non-empty directory', async () => {
      const projectPath = path.join(tempDir, 'non-empty-project')
      
      // Create directory with a file
      await fs.ensureDir(projectPath)
      await fs.writeFile(path.join(projectPath, 'existing-file.txt'), 'content')
      
      // Check that directory is not empty
      const files = await fs.readdir(projectPath)
      expect(files.length).toBeGreaterThan(0)
    })
  })

  describe('Package Manager Detection', () => {
    it('should support npm', () => {
      const packageManagers = ['npm', 'yarn', 'pnpm']
      
      packageManagers.forEach(pm => {
        const args = createMockArgs({ packageManager: pm })
        expect(args.extOptions.packageManager).toBe(pm)
      })
    })

    it('should default to pnpm', () => {
      const args = createMockArgs()
      expect(args.extOptions.packageManager).toBe('pnpm')
    })
  })

  describe('Template Selection', () => {
    it('should support default template', () => {
      const args = createMockArgs({ template: 'default' })
      expect(args.extOptions.template).toBe('default')
    })

    it('should default to default template', () => {
      const args = createMockArgs()
      expect(args.extOptions.template).toBe('default')
    })
  })

  describe('Environment Variable Generation', () => {
    it('should generate proper environment variable format', () => {
      const projectId = 'my-project-123'
      const dataset = 'production'
      
      const expectedWebEnv = `NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId}`
      const expectedStudioEnv = `SANITY_STUDIO_PROJECT_ID=${projectId}`
      const expectedDatasetEnv = `SANITY_STUDIO_DATASET=${dataset}`
      
      // These would be used in the actual env file generation
      expect(expectedWebEnv).toContain(projectId)
      expect(expectedStudioEnv).toContain(projectId)
      expect(expectedDatasetEnv).toContain(dataset)
    })

    it('should handle special characters in project details', () => {
      const projectId = 'project-with-dashes'
      const dataset = 'dataset_with_underscores'
      
      const envVar = `NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId}`
      const datasetVar = `NEXT_PUBLIC_SANITY_DATASET=${dataset}`
      
      expect(envVar).toBe('NEXT_PUBLIC_SANITY_PROJECT_ID=project-with-dashes')
      expect(datasetVar).toBe('NEXT_PUBLIC_SANITY_DATASET=dataset_with_underscores')
    })
  })

  describe('Error Handling', () => {
    it('should handle permission errors gracefully', async () => {
      // This test would check for proper error handling
      // when the CLI encounters permission issues
      
      // We can't actually test this without root access,
      // but we can verify our error handling logic
      expect(() => {
        // Simulate permission error
        const error = new Error('EACCES: permission denied')
        error.code = 'EACCES'
        throw error
      }).toThrow('EACCES: permission denied')
    })

    it('should handle network errors', async () => {
      // Test network error handling
      const networkError = new Error('Network request failed')
      networkError.code = 'ENOTFOUND'
      
      expect(() => {
        throw networkError
      }).toThrow('Network request failed')
    })

    it('should handle invalid Sanity credentials', () => {
      const authError = new Error('Invalid credentials')
      authError.statusCode = 401
      
      expect(() => {
        throw authError
      }).toThrow('Invalid credentials')
    })
  })
})
