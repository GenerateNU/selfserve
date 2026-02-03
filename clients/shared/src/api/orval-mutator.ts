import { ApiError } from '../types/api.types'

// @ts-ignore - Environment variable injected by bundler (Vite/Metro)
const API_BASE_URL = process.env.API_BASE_URL

/**
 * Custom mutator for Orval to use our existing fetch-based client
 * This function will be called by all generated API functions
 */
export const customInstance = <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const fullUrl = `${API_BASE_URL}${url}`
  
  return fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'Request failed',
        response.status,
        errorData
      )
    }

    // Handle text responses
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/plain')) {
      return (await response.text()) as T
    }

    return response.json()
  }).catch((error) => {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      error
    )
  })
}

export default customInstance
