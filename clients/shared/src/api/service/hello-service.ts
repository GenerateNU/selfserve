import { HttpClient } from '@/types/api.types'

export const createHelloService = (apiClient: HttpClient) => ({
  getHello: () => apiClient.get<string>('/api/v1/hello'),
  getHelloName: (name: string) => apiClient.get<string>(`/api/v1/hello/${name}`),
})
