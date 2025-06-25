import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { createTempDir, cleanupTempDir, createMockSanityConfig } from './utils.js'

// We need to mock the modules before importing
vi.mock('https', () => ({
  request: vi.fn()
}))

vi.mock('cross-spawn', () => ({
  sync: vi.fn()
}))

const mockHttpsRequest = vi.hoisted(() => vi.fn())
vi.mock('https', () => ({
  request: mockHttpsRequest
}))

// Import after mocking
const { makeApiRequest } = await import('../src/sanity-utils.js')

describe('Sanity Utils', () => {
  let tempDir
  let mockConfigPath
  
  beforeEach(async () => {
    tempDir = await createTempDir()
    mockConfigPath = path.join(tempDir, '.config', 'sanity', 'config')
    
    // Mock os.homedir to return our temp directory
    vi.spyOn(os, 'homedir').mockReturnValue(tempDir)
  })
  
  afterEach(async () => {
    await cleanupTempDir(tempDir)
    vi.restoreAllMocks()
  })

  describe('getUserConfig', () => {
    it('should return empty object when no config exists', async () => {
      const { getUserConfig } = await import('../src/sanity-utils.js')
      const config = getUserConfig()
      expect(config).toEqual({})
    })

    it('should read config from standard location', async () => {
      const { getUserConfig } = await import('../src/sanity-utils.js')
      
      // Create mock config file
      const mockConfig = createMockSanityConfig('test-token')
      await fs.ensureDir(path.dirname(mockConfigPath))
      await fs.writeFile(mockConfigPath, JSON.stringify(mockConfig))
      
      const config = getUserConfig()
      expect(config.authToken).toBe('test-token')
    })

    it('should try alternative config locations', async () => {
      const { getUserConfig } = await import('../src/sanity-utils.js')
      
      // Create config in alternative location
      const altPath = path.join(tempDir, '.sanity', 'config')
      const mockConfig = createMockSanityConfig('alt-token')
      await fs.ensureDir(path.dirname(altPath))
      await fs.writeFile(altPath, JSON.stringify(mockConfig))
      
      const config = getUserConfig()
      expect(config.authToken).toBe('alt-token')
    })

    it('should handle invalid JSON gracefully', async () => {
      const { getUserConfig } = await import('../src/sanity-utils.js')
      
      // Create invalid JSON file
      await fs.ensureDir(path.dirname(mockConfigPath))
      await fs.writeFile(mockConfigPath, 'invalid json')
      
      const config = getUserConfig()
      expect(config).toEqual({})
    })
  })

  describe('makeApiRequest', () => {
    it('should make successful API request', async () => {
      const mockResponse = { id: 'user123', email: 'test@example.com' }
      const mockRes = {
        statusCode: 200,
        on: vi.fn((event, callback) => {
          if (event === 'data') {
            callback(JSON.stringify(mockResponse))
          } else if (event === 'end') {
            callback()
          }
        })
      }
      
      const mockReq = {
        on: vi.fn(),
        write: vi.fn(),
        end: vi.fn()
      }
      
      mockHttpsRequest.mockImplementation((options, callback) => {
        callback(mockRes)
        return mockReq
      })
      
      const result = await makeApiRequest('/users/me', 'test-token')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const mockErrorResponse = { message: 'Unauthorized' }
      const mockRes = {
        statusCode: 401,
        on: vi.fn((event, callback) => {
          if (event === 'data') {
            callback(JSON.stringify(mockErrorResponse))
          } else if (event === 'end') {
            callback()
          }
        })
      }
      
      const mockReq = {
        on: vi.fn(),
        write: vi.fn(),
        end: vi.fn()
      }
      
      mockHttpsRequest.mockImplementation((options, callback) => {
        callback(mockRes)
        return mockReq
      })
      
      await expect(makeApiRequest('/users/me', 'invalid-token'))
        .rejects.toThrow('API Error: Unauthorized')
    })

    it('should handle network errors', async () => {
      const mockReq = {
        on: vi.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Network error'))
          }
        }),
        write: vi.fn(),
        end: vi.fn()
      }
      
      mockHttpsRequest.mockImplementation(() => mockReq)
      
      await expect(makeApiRequest('/users/me', 'test-token'))
        .rejects.toThrow('Network error')
    })
  })
})
