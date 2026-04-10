// Custom Types (non-generated)
export { ApiError } from "./types/api.types";
export type { ApiConfig } from "./types/api.types";
export type { Config } from "./api/config";

// config functions
export { setConfig, getConfig } from "./api/config";

// Generated Types - Models
export { MakeRequestPriority } from "./api/generated/models";

export type {
  User,
  CreateUser,
  Request,
  MakeRequest,
  GenerateRequestInput,
  GenerateRequestResponse,
  GenerateRequestWarning,
  Hotel,
  Guest,
  GuestPage,
  Dev,
} from "./api/generated/models";

// Generated API Functions
export {
  useGetHello,
  useGetHelloName,
} from "./api/generated/endpoints/hello/hello";

export {
  usePostRequest,
  usePostRequestGenerate,
  useGetRequestRoomId,
} from "./api/generated/endpoints/requests/requests";

export {
  usePostUsers,
  useGetUsersId,
} from "./api/generated/endpoints/users/users";

export {
  usePostApiV1Hotels,
  useGetApiV1HotelsId,
} from "./api/generated/endpoints/hotels/hotels";

export { useGetDevsName } from "./api/generated/endpoints/devs/devs";

export {
  usePostApiV1Guests,
  useGetApiV1GuestsId,
  usePutApiV1GuestsId,
  usePostApiV1GuestsSearchHook,
  useGetApiV1GuestsStaysId,
} from "./api/generated/endpoints/guests/guests";

export type {
  GuestWithBooking,
  GuestWithStays,
  GuestFilters,
  Stay,
} from "./api/generated/models";

export { usePostRooms, useGetRoomsFloors } from "./api/generated/endpoints/rooms/rooms";
export { useGetGuestBookingsGroupSizes } from "./api/generated/endpoints/guest-bookings/guest-bookings";

export type {
  RoomWithOptionalGuestBooking,
  FilterRoomsRequest,
  GuestRequest,
  RoomRequestsResponse,
} from "./api/generated/models";

// Notification types and hooks
export type {
  Notification,
  NotificationType,
  RegisterDeviceTokenInput,
} from "./types/notifications";

export {
  NOTIFICATIONS_QUERY_KEY,
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  usePostDeviceToken,
} from "./api/notifications";
