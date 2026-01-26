<<<<<<< HEAD
// base HTTP client (fetch or axios wrapper)

// use the clerk frontend sdk for react or expo to get this client: use the getAuth() method
type AuthClient = {
  getToken: () => Promise<string | null>
}

interface HttpClient {
  get: <T>(path: string) => Promise<APIResponse<T>>,
  post: <T>(path: string, body: unknown) => Promise<APIResponse<T>>,
  put: <T>(path: string, body: unknown) => Promise<APIResponse<T>>,
  patch: <T>(path: string, body: unknown) => Promise<APIResponse<T>>,
  delete: <T>(path: string) => Promise<APIResponse<T>>,
}

type APIResponse<T> = { data: T; error: null } | { data: null; error: string }

// returns a struct whose fields are functions that represent http calls like get, post
export const getAPIClient = (authClient: AuthClient, baseUrl: string): HttpClient => {
    const request = 
    async <T>(path: string, options: RequestInit = {}) => {
        try {
        const token = await authClient.getToken()

        const res = await fetch(`${baseUrl}${path}`, {
            ...options,
            headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
            },
        })

        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            return { data: null, error: body.message || `Error: ${res.status}` }
        }

        const data = await res.json()
        return { data, error: null }
        } catch (err) {
        return { data: null, error: 'Network error' }
        }
    }

    return {
        get: <T>(path: string) => request<T>(path, { method: 'GET' }),
        post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body)}),
        put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
        delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
        patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body)}),  
    }
}
=======
import { ApiError } from '../types/api.types'

// @ts-ignore - Environment variable injected by bundler (Vite/Metro)
const API_BASE_URL = process.env.API_BASE_URL

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
>>>>>>> main
