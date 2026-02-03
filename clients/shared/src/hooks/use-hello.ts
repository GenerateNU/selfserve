import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { helloService } from '../api/services/hello.service'
import { ApiError } from '../types/api.types'

/**
 * Hook to get hello message
 */
export const useGetHello = (): UseQueryResult<string, ApiError> => {
  return useQuery({
    queryKey: ['hello'],
    queryFn: () => helloService.getHello(),
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
    queryFn: () => helloService.getHelloName(name),
    enabled: !!name && name.trim().length > 0,
  })
}
