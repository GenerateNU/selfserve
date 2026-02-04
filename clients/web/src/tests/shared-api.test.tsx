import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


// Mock Clerk before imports that use it
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('mock-token'),
  }),
}))

// Also mock the alias
vi.mock('@app/clerk', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('mock-token'),
  }),
}))

import { useGetHello, useGetHelloName } from '@shared'

global.fetch = vi.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Shared API - Generated Functions', () => {
  const mockApiBaseUrl = 'http://localhost:8080/api/v1'

  beforeEach(() => {
    process.env.API_BASE_URL = mockApiBaseUrl
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useGetHello', () => {  
    it('should return response with data field', async () => {
      const mockResponse = 'Yogurt. Gurt: Yo!'

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve(mockResponse),
      } as Response)

      const { result } = renderHook(() => useGetHello(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/hello`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      )
      expect(result.current.data).toBe(mockResponse)
      expect(typeof result.current.data).toBe('string')
    })

    it('should handle errors correctly', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
      } as Response)

      const { result } = renderHook(() => useGetHello(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useGetHelloName', () => {
    it('should return personalized response with data field', async () => {
      const name = 'Alice'
      const mockResponse = `Yo, ${name}!`

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve(mockResponse),
      } as Response)

      const { result } = renderHook(() => useGetHelloName(name), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/hello/${name}`,
        expect.objectContaining({
          method: 'GET',
        }),
      )
      expect(result.current.data).toBe(mockResponse)
      expect(typeof result.current.data).toBe('string')
    })

    it('should handle special characters in name', async () => {
      const name = 'John Doe'
      const mockResponse = `Yo, ${name}!`

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve(mockResponse),
      } as Response)

      const { result } = renderHook(() => useGetHelloName(name), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBe(mockResponse)
    })
  })

  describe('Type Safety', () => {
    it('should have correct response structure', async () => {
      const mockResponse = 'Test'

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve(mockResponse),
      } as Response)

      const { result } = renderHook(() => useGetHello(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBe(mockResponse)
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })
  })
})