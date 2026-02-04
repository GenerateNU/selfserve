import { ApiError } from '../types/api.types'

const API_BASE_PATH = '/api/v1'

/**
 * Custom mutator for Orval to use our existing fetch-based client
 * This function will be called by all generated API functions
 * Returns response in Orval's expected format: { data, status, headers }
 */
export const customInstance = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  // @ts-ignore - Environment variable injected by bundler (Vite/Metro)
  const API_BASE_URL = process.env.API_BASE_URL
  const fullUrl = `${API_BASE_URL}${API_BASE_PATH}${url}`
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
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

    // Get response data based on content type
    const contentType = response.headers.get('content-type')
    let data: any
    
    switch (true) {
      case contentType?.includes('text/plain'):
        data = await response.text()
        break
      case contentType?.includes('application/json'):
        data = await response.json()
        break
      default:
        data = await response.text()
        break
    }

    // Return in Orval's expected format
    return {
      data,
      status: response.status,
      headers: response.headers,
    } as T
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

export default customInstance
