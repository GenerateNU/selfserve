// Custom Types (non-generated)
export { ApiError } from "./types/api.types";
export type { ApiConfig } from "./types/api.types";
export type { Config } from "./api/config";

// config functions
export { setConfig, getConfig } from "./api/config";

export { getExtFromMime } from "./utils";
export {
  getProfilePicture,
  getUploadUrl,
  saveProfilePictureKey,
  deleteProfilePicture,
  uploadFileToS3,
} from "./api/profile-picture";
export type {
  UploadUrlResponse,
  ProfilePictureResponse,
} from "./api/profile-picture";

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
  Assistance,
  ActiveBooking,
  Stay,
  UpdateGuest,
  GithubComGenerateSelfserveInternalModelsBookingStatus as BookingStatus,
  GithubComGenerateSelfserveInternalModelsAssistanceFilter as AssistanceFilter,
  GuestFiltersRequestSort as RequestSort,
  GuestFiltersFloorSort as FloorSort,
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
  useGetRequestGuestId,
} from "./api/generated/endpoints/requests/requests";

export {
  usePostUsers,
  useGetUsersId,
} from "./api/generated/endpoints/users/users";

export {
  usePostHotels,
  useGetHotelsId,
} from "./api/generated/endpoints/hotels/hotels";

export { useGetDevsName } from "./api/generated/endpoints/devs/devs";

export {
  usePostGuests,
  useGetGuestsId,
  usePutGuestsId,
  getGetGuestsStaysIdQueryKey,
  usePostGuestsSearchHook,
  useGetGuestsStaysId,
} from "./api/generated/endpoints/guests/guests";

export type {
  GuestWithBooking,
  GuestWithStays,
  GuestFilters,
} from "./api/generated/models";

export { usePostRooms, useGetRoomsFloors } from "./api/generated/endpoints/rooms/rooms";
export { useGetGuestBookingsGroupSizes } from "./api/generated/endpoints/guest-bookings/guest-bookings";

export type {
  RoomWithOptionalGuestBooking,
  FilterRoomsRequest,
  GuestRequest,
  RoomRequestsResponse,
  GithubComGenerateSelfserveInternalUtilsCursorPageGuestRequest,
} from "./api/generated/models";

export { useInfiniteRequestsByGuest, getGuestRequestsQueryKey } from "./api/requests";


// User hooks
export { getUserQueryKey, useGetUser, useUpdateUser } from "./api/users";

// Department types and hooks
export type { Department } from "./types/departments";

export {
  getDepartmentsQueryKey,
  useGetDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "./api/departments";

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
