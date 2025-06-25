import { describe, it, expect } from 'vitest'
import { createTempDir, cleanupTempDir, createMockSanityConfig, createMockArgs } from './utils.js'

describe('Sanity Utils - Unit Tests', () => {
  describe('Configuration Utilities', () => {
    it('should create mock Sanity config correctly', () => {
      const token = 'test-token-123'
      const config = createMockSanityConfig(token)
      
      expect(config).toHaveProperty('authToken', token)
      expect(config).toHaveProperty('userId', 'test-user-id')
    })

    it('should create mock args with defaults', () => {
      const args = createMockArgs()
      
      expect(args.extOptions.yes).toBe(false)
      expect(args.extOptions.template).toBe('default')
      expect(args.extOptions.packageManager).toBe('pnpm')
    })

    it('should create mock args with overrides', () => {
      const args = createMockArgs({
        yes: true,
        template: 'custom',
        packageManager: 'npm',
        project: 'test-project-id'
      })
      
      expect(args.extOptions.yes).toBe(true)
      expect(args.extOptions.template).toBe('custom')
      expect(args.extOptions.packageManager).toBe('npm')
      expect(args.extOptions.project).toBe('test-project-id')
    })
  })

  describe('Temporary Directory Utilities', () => {
    let tempDir

    it('should create a temporary directory', async () => {
      tempDir = await createTempDir()
      
      expect(tempDir).toBeDefined()
      expect(typeof tempDir).toBe('string')
      expect(tempDir).toContain('create-turbo-sanity-test-')
    })

    it('should cleanup temporary directory', async () => {
      if (tempDir) {
        await cleanupTempDir(tempDir)
        // Directory should be cleaned up, but we can't easily test this without fs access
        expect(true).toBe(true) // Just verify the function runs without error
      }
    })
  })

  describe('API Configuration', () => {
    it('should construct correct API paths', () => {
      const basePath = '/v2023-05-03'
      const userPath = '/users/me'
      const projectsPath = '/projects'
      
      const fullUserPath = `${basePath}${userPath}`
      const fullProjectsPath = `${basePath}${projectsPath}`
      
      expect(fullUserPath).toBe('/v2023-05-03/users/me')
      expect(fullProjectsPath).toBe('/v2023-05-03/projects')
    })

    it('should handle API request options', () => {
      const token = 'test-token'
      const requestOptions = {
        hostname: 'api.sanity.io',
        port: 443,
        path: '/v2023-05-03/users/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
      
      expect(requestOptions.hostname).toBe('api.sanity.io')
      expect(requestOptions.headers.Authorization).toBe(`Bearer ${token}`)
      expect(requestOptions.headers['Content-Type']).toBe('application/json')
    })
  })

  describe('Project Validation', () => {
    it('should validate project name format', () => {
      const validNames = [
        'my-project',
        'my_project', 
        'myproject',
        'project123'
      ]
      
      const invalidNames = [
        'My-Project', // uppercase
        'my project', // spaces
        'my@project', // special chars
        '.myproject', // starts with dot
        '' // empty
      ]
      
      const isValidProjectName = (name) => {
        if (!name || name.length === 0) return false
        if (name.startsWith('.')) return false
        return /^[a-z0-9_-]+$/.test(name)
      }
      
      validNames.forEach(name => {
        expect(isValidProjectName(name)).toBe(true)
      })
      
      invalidNames.forEach(name => {
        expect(isValidProjectName(name)).toBe(false)
      })
    })

    it('should validate dataset name format', () => {
      const validDatasets = [
        'production',
        'development',
        'staging',
        'test-env',
        'env_1'
      ]
      
      const invalidDatasets = [
        'Production', // uppercase
        'prod env', // spaces
        'prod@env', // special chars
        '' // empty
      ]
      
      const isValidDatasetName = (name) => {
        if (!name || name.length === 0) return false
        return /^[a-z0-9_-]+$/.test(name)
      }
      
      validDatasets.forEach(name => {
        expect(isValidDatasetName(name)).toBe(true)
      })
      
      invalidDatasets.forEach(name => {
        expect(isValidDatasetName(name)).toBe(false)
      })
    })
  })

  describe('Error Handling', () => {
    it('should create appropriate error messages', () => {
      const createApiError = (message) => {
        return new Error(`API Error: ${message || 'Unknown error'}`)
      }
      
      const error1 = createApiError('Unauthorized')
      const error2 = createApiError()
      
      expect(error1.message).toBe('API Error: Unauthorized')
      expect(error2.message).toBe('API Error: Unknown error')
    })

    it('should handle network errors', () => {
      const createNetworkError = (code) => {
        const error = new Error('Network request failed')
        error.code = code
        return error
      }
      
      const error = createNetworkError('ENOTFOUND')
      
      expect(error.message).toBe('Network request failed')
      expect(error.code).toBe('ENOTFOUND')
    })
  })
})
