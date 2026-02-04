// Custom Types (non-generated)
export { ApiError } from "./types/api.types";
export type { ApiConfig } from "./types/api.types";

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
  useGetHello,
  useGetHelloName,
} from './api/generated/endpoints/hello/hello'

export {
  usePostRequest,
  usePostRequestGenerate,
} from './api/generated/endpoints/requests/requests'

export {
  usePostUsers,
  useGetUsersId,
} from './api/generated/endpoints/users/users'

export {
  usePostHotel,
  useGetApiV1HotelsId,
} from './api/generated/endpoints/hotels/hotels'

export {
  useGetDevsName,
} from './api/generated/endpoints/devs/devs'

export {
  usePostApiV1Guests,
  useGetApiV1GuestsId,
  usePutApiV1GuestsId,
} from './api/generated/endpoints/guests/guests'