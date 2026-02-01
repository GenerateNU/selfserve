import { apiClient } from '../client'
import { Request, MakeRequest } from '../../types/request.types'

export const requestsService = {
  getAllRequests: async (): Promise<Request[]> => {
    return apiClient.get<Request[]>('/api/v1/requests')
  },

  getRequest: async (id: string): Promise<Request> => {
    return apiClient.get<Request>(`/api/v1/requests/${id}`)
  },

  createRequest: async (data: MakeRequest): Promise<Request> => {
    return apiClient.post<Request>('/api/v1/request', data)
  },
}
