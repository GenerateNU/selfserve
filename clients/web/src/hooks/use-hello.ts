import { useQuery } from '@tanstack/react-query'
import { useAPIClient } from './use-api-client'
import { ApiError } from '@shared'

export const useGetHello = () => {
  const api = useAPIClient()
  return useQuery<string, ApiError>({
    queryKey: ['hello'],
    queryFn: () => api.get<string>('/api/v1/hello'),
  })
}

export const useGetHelloName = (name: string) => {
  const api = useAPIClient()
  return useQuery<string, ApiError>({
    queryKey: ['hello', name],
    queryFn: () => api.get<string>(`/api/v1/hello/${name}`),
  })
}
