import { apiClient } from '../client'

export const helloService = {
  /**
   * Get hello message
   */
  getHello: async (): Promise<string> => {
    return apiClient.get<string>('/api/v1/hello')
  },

  /**
   * Get personalized hello message
   */
  getHelloName: async (name: string): Promise<string> => {
    return apiClient.get<string>(`/api/v1/hello/${name}`)
  },
}
