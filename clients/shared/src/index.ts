// API Client
export { apiClient } from './api/client'

// Hooks
export { useGetHello, useGetHelloName } from './hooks/use-hello'

// Custom Types (non-generated)
export { ApiError } from './types/api.types'
export type { ApiConfig } from './types/api.types'

// Generated Types - Models
export type {
  User,
  CreateUser,
  Request,
  MakeRequest,
  GenerateRequestInput,
  Hotel,
  CreateGuest,
  UpdateGuest,
  Guest,
  Dev,
} from './api/generated/models'

// Generated API Functions
export {
  getHello,
  getHelloName,
} from './api/generated/endpoints/hello/hello'

export {
  postRequest,
  postRequestGenerate,
} from './api/generated/endpoints/requests/requests'

export {
  postUsers,
  getUsersId,
} from './api/generated/endpoints/users/users'

export {
  postHotel,
  getApiV1HotelsId,
} from './api/generated/endpoints/hotels/hotels'

export {
  getDevsName,
} from './api/generated/endpoints/devs/devs'

export {
  postApiV1Guests,
  getApiV1GuestsId,
  putApiV1GuestsId,
} from './api/generated/endpoints/guests/guests'