import { HttpClient } from '../types/api.types'

export const createHelloService = (api: HttpClient) => ({
  getHello: () => api.get<string>('/api/v1/hello'),
  getHelloName: (name: string) => api.get<string>(`/api/v1/hello/${name}`),
})