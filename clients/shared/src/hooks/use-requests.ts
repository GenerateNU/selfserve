import { useQuery, useMutation, useQueryClient, UseQueryResult} from '@tanstack/react-query'
import { requestsService } from '../api/services/requests.service'
import { Request, MakeRequest } from '../types/request.types'
import { ApiError } from '../types/api.types'

export const useGetAllRequests = (): UseQueryResult<Request[], ApiError> => {
  return useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsService.getAllRequests(),
  })
}

export const useGetRequest = (id: string): UseQueryResult<Request, ApiError> => {
  return useQuery({
    queryKey: ['request', id],
    queryFn: () => requestsService.getRequest(id),
    enabled: !!id && id.trim().length > 0,
  })
}



export const useCreateRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: MakeRequest) => requestsService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}
