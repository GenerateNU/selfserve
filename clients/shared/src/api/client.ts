import { ApiError } from '../types/api.types'

// @ts-ignore - Environment variable injected by bundler (Vite/Metro)
const API_BASE_URL = process.env.VITE_API_BASE_URL

/**
 * Internal helper to make HTTP requests w/ error handling
 */
const request = async <T>(
  endpoint: string,
  options: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

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
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      error
    )
  }
}

export const apiClient = {
  /**
   * Performs a GET request
   */
  get: <T>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, { method: 'GET' })
  },

  /**
   * Performs a POST request
   */
  post: <T>(endpoint: string, data: any): Promise<T> => {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Performs a PUT request
   */
  put: <T>(endpoint: string, data: any): Promise<T> => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Performs a DELETE request
   */
  delete: <T>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, { method: 'DELETE' })
  },
}

export { API_BASE_URL }
