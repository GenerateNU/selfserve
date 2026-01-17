import { apiClient } from '../client'
import { API_ENDPOINTS } from '../endpoints'

export const helloService = {
  /**
   * Get hello message
   */
  getHello: async (): Promise<string> => {
    return apiClient.get<string>(API_ENDPOINTS.HELLO)
  },

  /**
   * Get personalized hello message
   */
  getHelloName: async (name: string): Promise<string> => {
    return apiClient.get<string>(API_ENDPOINTS.HELLO_NAME(name))
  },
}
