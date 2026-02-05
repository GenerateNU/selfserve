import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useGetHello, useGetHelloName } from '@shared'

global.fetch = vi.fn()

describe('Shared API - Generated Functions', () => {
  const mockApiBaseUrl = 'http://localhost:8080/api/v1'
  let queryClient: QueryClient

  beforeEach(() => {
    process.env.API_BASE_URL = mockApiBaseUrl
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
        },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
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
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { result } = renderHook(() => useGetHello(), { wrapper })

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true)
        },
        { timeout: 3000 },
      )

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
      const mockError = { message: 'Server error' }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve(mockError),
        text: () => Promise.resolve(JSON.stringify(mockError)),
      } as Response)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { result } = renderHook(() => useGetHello(), { wrapper })

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 3000 },
      )

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
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { result } = renderHook(() => useGetHelloName(name), { wrapper })

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true)
        },
        { timeout: 3000 },
      )

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
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { result } = renderHook(() => useGetHelloName(name), { wrapper })

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true)
        },
        { timeout: 3000 },
      )

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
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { result } = renderHook(() => useGetHello(), { wrapper })

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true)
        },
        { timeout: 3000 },
      )

      expect(result.current.data).toBe(mockResponse)
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })
  })
})
