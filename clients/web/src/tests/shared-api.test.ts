import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getHello, getHelloName } from '@shared'

// Mock fetch globally
global.fetch = vi.fn()

describe('Shared API - Generated Functions', () => {
  const mockApiBaseUrl = 'http://localhost:8080'
  
  beforeEach(() => {
    // Set up environment variable
    process.env.API_BASE_URL = mockApiBaseUrl
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getHello', () => {
    it('should return response with data field', async () => {
      const mockResponse = 'Yogurt. Gurt: Yo!'
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => mockResponse,
      } as Response)

      const result = await getHello()

      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/api/v1/hello`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result.data).toBe(mockResponse)
      expect(result.status).toBe(200)
      expect(typeof result.data).toBe('string')
    })

    it('should handle errors correctly', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      } as Response)

      await expect(getHello()).rejects.toThrow()
    })
  })

  describe('getHelloName', () => {
    it('should return personalized response with data field', async () => {
      const name = 'Alice'
      const mockResponse = `Yo, ${name}!`
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => mockResponse,
      } as Response)

      const result = await getHelloName(name)

      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/api/v1/hello/${name}`,
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result.data).toBe(mockResponse)
      expect(result.status).toBe(200)
      expect(typeof result.data).toBe('string')
    })

    it('should handle special characters in name', async () => {
      const name = 'John Doe'
      const mockResponse = `Yo, ${name}!`
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => mockResponse,
      } as Response)

      const result = await getHelloName(name)

      expect(result.data).toBe(mockResponse)
    })
  })

  describe('Type Safety', () => {
    it('should have correct response structure', async () => {
      const mockResponse = 'Test'
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => mockResponse,
      } as Response)

      const result = await getHello()
      
      // TypeScript compile-time check - response has data, status, headers
      expect(result.data).toBe(mockResponse)
      expect(result.status).toBe(200)
      expect(result.headers).toBeDefined()
    })
  })
})
