import { useQuery } from '@tanstack/react-query'
import { useAPIClient } from '@shared/api/client'
import type { ApiError } from '@shared'

/**
 * Example of manual hook creation, instead of orval
 */
export const useGetHello = () => {
  const api = useAPIClient()
  return useQuery<string, ApiError>({
    queryKey: ['hello'],
    queryFn: () => api.get<string>('/hello'),
  })
}

export const useGetHelloName = (name: string) => {
  const api = useAPIClient()
  return useQuery<string, ApiError>({
    queryKey: ['hello', name],
    queryFn: () => api.get<string>(`/hello/${name}`),
  })
}
