import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import { createTempDir, cleanupTempDir } from './utils.js'

// Mock external dependencies
vi.mock('fs-extra')
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis()
  }))
}))

// Import the module after mocking
const { createProjectStructure, updateEnvFiles } = await import('../src/template-utils.js')

describe('Template Utils', () => {
  let tempDir
  let projectDir
  
  beforeEach(async () => {
    tempDir = await createTempDir()
    projectDir = path.join(tempDir, 'test-project')
    vi.clearAllMocks()
  })
  
  afterEach(async () => {
    await cleanupTempDir(tempDir)
    vi.restoreAllMocks()
  })

  describe('createProjectStructure', () => {
    const mockConfig = {
      projectName: 'test-project',
      displayName: 'Test Project',
      projectId: 'test-project-123',
      datasetName: 'production',
      template: 'default'
    }

    it('should create project directory', async () => {
      const mockEnsureDir = vi.mocked(fs.ensureDir)
      const mockPathExists = vi.mocked(fs.pathExists)
      const mockCopy = vi.mocked(fs.copy)
      const mockReadFile = vi.mocked(fs.readFile)
      
      mockPathExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue('{{PROJECT_NAME}} content {{PROJECT_ID}}')
      
      await createProjectStructure(projectDir, mockConfig)
      
      expect(mockEnsureDir).toHaveBeenCalledWith(projectDir)
      expect(mockCopy).toHaveBeenCalled()
    })

    it('should process template files with replacements', async () => {
      const mockPathExists = vi.mocked(fs.pathExists)
      const mockReadFile = vi.mocked(fs.readFile)
      const mockWriteFile = vi.mocked(fs.writeFile)
      
      mockPathExists.mockImplementation((filePath) => {
        return Promise.resolve(typeof filePath === 'string' && filePath.includes('package.json'))
      })
      
      mockReadFile.mockResolvedValue('{"name": "{{PROJECT_NAME}}", "projectId": "{{PROJECT_ID}}"}')
      
      await createProjectStructure(projectDir, mockConfig)
      
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.stringContaining('test-project')
      )
    })

    it('should handle missing template directory', async () => {
      const mockEnsureDir = vi.mocked(fs.ensureDir)
      const mockPathExists = vi.mocked(fs.pathExists)
      
      mockPathExists.mockResolvedValue(false)
      
      await expect(createProjectStructure(projectDir, mockConfig))
        .rejects.toThrow('Template "default" not found')
      
      expect(mockEnsureDir).toHaveBeenCalledWith(projectDir)
    })

    it('should replace all template variables', async () => {
      const mockPathExists = vi.mocked(fs.pathExists)
      const mockReadFile = vi.mocked(fs.readFile)
      const mockWriteFile = vi.mocked(fs.writeFile)
      
      mockPathExists.mockResolvedValue(true)
      
      const templateContent = `
        Project: {{PROJECT_NAME}}
        Display: {{DISPLAY_NAME}}
        ID: {{PROJECT_ID}}
        Dataset: {{DATASET_NAME}}
        Legacy ID: your-project-id
        Legacy Dataset: production
      `
      
      mockReadFile.mockResolvedValue(templateContent)
      
      await createProjectStructure(projectDir, mockConfig)
      
      const writeCall = mockWriteFile.mock.calls[0]
      const writtenContent = writeCall[1]
      
      expect(writtenContent).toContain('test-project')
      expect(writtenContent).toContain('Test Project')
      expect(writtenContent).toContain('test-project-123')
      expect(writtenContent).toContain('production')
      expect(writtenContent).not.toContain('{{PROJECT_NAME}}')
      expect(writtenContent).not.toContain('your-project-id')
    })
  })

  describe('updateEnvFiles', () => {
    const projectId = 'test-project-123'
    const datasetName = 'production'

    it('should create all environment files', async () => {
      const mockWriteFile = vi.mocked(fs.writeFile)
      
      await updateEnvFiles(projectDir, projectId, datasetName)
      
      expect(mockWriteFile).toHaveBeenCalledTimes(3)
      
      // Check root .env file
      expect(mockWriteFile).toHaveBeenCalledWith(
        path.join(projectDir, '.env'),
        expect.stringContaining(`NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId}`)
      )
      
      // Check web .env file
      expect(mockWriteFile).toHaveBeenCalledWith(
        path.join(projectDir, 'apps/web/.env'),
        expect.stringContaining(`NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId}`)
      )
      
      // Check studio .env file
      expect(mockWriteFile).toHaveBeenCalledWith(
        path.join(projectDir, 'apps/studio/.env'),
        expect.stringContaining(`SANITY_STUDIO_PROJECT_ID=${projectId}`)
      )
    })

    it('should include dataset name in environment files', async () => {
      const mockWriteFile = vi.mocked(fs.writeFile)
      
      await updateEnvFiles(projectDir, projectId, datasetName)
      
      const calls = mockWriteFile.mock.calls
      
      calls.forEach(([, content]) => {
        expect(content).toContain(`DATASET=${datasetName}`)
      })
    })

    it('should create proper environment file structure', async () => {
      const mockWriteFile = vi.mocked(fs.writeFile)
      
      await updateEnvFiles(projectDir, projectId, datasetName)
      
      const rootEnvCall = mockWriteFile.mock.calls.find(([filePath]) => 
        filePath === path.join(projectDir, '.env')
      )
      
      expect(rootEnvCall[1]).toContain('# Sanity Configuration')
      expect(rootEnvCall[1]).toContain('NEXT_PUBLIC_SANITY_PROJECT_ID=')
      expect(rootEnvCall[1]).toContain('NEXT_PUBLIC_SANITY_DATASET=')
      expect(rootEnvCall[1]).toContain('SANITY_API_READ_TOKEN=')
    })

    it('should handle special characters in project details', async () => {
      const specialProjectId = 'project-with-dashes_and_underscores'
      const specialDataset = 'dataset_with_underscores-and-dashes'
      const mockWriteFile = vi.mocked(fs.writeFile)
      
      await updateEnvFiles(projectDir, specialProjectId, specialDataset)
      
      const calls = mockWriteFile.mock.calls
      
      calls.forEach(([, content]) => {
        expect(content).toContain(specialProjectId)
        expect(content).toContain(specialDataset)
      })
    })
  })

  describe('Environment File Templates', () => {
    it('should generate different content for web and studio environments', async () => {
      const mockWriteFile = vi.mocked(fs.writeFile)
      
      await updateEnvFiles(projectDir, 'test-id', 'test-dataset')
      
      const webEnvCall = mockWriteFile.mock.calls.find(([filePath]) =>
        filePath.includes('apps/web/.env')
      )
      
      const studioEnvCall = mockWriteFile.mock.calls.find(([filePath]) =>
        filePath.includes('apps/studio/.env')
      )
      
      // Web should use NEXT_PUBLIC_ prefix
      expect(webEnvCall[1]).toContain('NEXT_PUBLIC_SANITY_PROJECT_ID=')
      
      // Studio should use SANITY_STUDIO_ prefix
      expect(studioEnvCall[1]).toContain('SANITY_STUDIO_PROJECT_ID=')
      expect(studioEnvCall[1]).toContain('SANITY_STUDIO_DATASET=')
    })

    it('should include optional tokens in all environments', async () => {
      const mockWriteFile = vi.mocked(fs.writeFile)
      
      await updateEnvFiles(projectDir, 'test-id', 'test-dataset')
      
      const calls = mockWriteFile.mock.calls
      
      calls.forEach(([, content]) => {
        expect(content).toContain('SANITY_API_READ_TOKEN=')
      })
    })
  })
})
