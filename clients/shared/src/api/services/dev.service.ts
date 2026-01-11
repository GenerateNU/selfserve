import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export type Dev = {
  id: number;
  created_at: Date;
  name: string;
}

export const devsService = {
  getAll: () => apiClient.get<Dev[]>(ENDPOINTS.DEVS),
  getByName: (name: string) => apiClient.get<Dev>(ENDPOINTS.DEV_BY_NAME(name)),
  create: (name: string) => apiClient.post<Dev>(ENDPOINTS.DEVS, { name }),
};