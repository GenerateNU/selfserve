import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { getHello, getHelloName } from '../api/generated/endpoints/hello/hello'
import { ApiError } from '../types/api.types'

/**
 * Hook to get hello message
 */
export const useGetHello = (): UseQueryResult<string, ApiError> => {
  return useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const response = await getHello()
      return response.data
    },
  })
}

/**
 * Hook to get personalized hello message
 */
export const useGetHelloName = (
  name: string
): UseQueryResult<string, ApiError> => {
  return useQuery({
    queryKey: ['hello', name],
    queryFn: async () => {
      const response = await getHelloName(name)
      return response.data
    },
    enabled: !!name && name.trim().length > 0,
  })
}
