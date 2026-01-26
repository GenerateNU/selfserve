import { useQuery } from '@tanstack/react-query'
import { useAPIClient } from './client'
import { createHelloService } from '@shared/hooks/use-hello.ts'
import { ApiError } from '@shared/types/api.types'

export const useGetHello = () => {
  const api = useAPIClient()
  const helloService = createHelloService(api)
  return useQuery<string, ApiError>({ queryKey: ['hello'], queryFn: () => helloService.getHello() })
}

export const useGetHelloName = (name: string) => {
  const api = useAPIClient()
  const helloService = createHelloService(api)
  return useQuery<string, ApiError>(
    { queryKey: ['hello', name], queryFn: () => helloService.getHelloName(name),
      enabled: !!name
    })
}