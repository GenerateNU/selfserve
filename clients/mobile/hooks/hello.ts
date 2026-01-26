import { useQuery } from '@tanstack/react-query'
import { useAPIClient } from './api'
import { createHelloService } from '@shared/hooks/use-hello'

export const useGetHello = () => {
  const api = useAPIClient()
  const helloService = createHelloService(api)
  return useQuery({ queryKey: ['hello'], queryFn: () => helloService.getHello() })
}

export const useGetHelloName = (name: string) => {
  const api = useAPIClient()
  const helloService = createHelloService(api)
  return useQuery({ queryKey: ['hello', name], queryFn: () => helloService.getHelloName(name)})
}