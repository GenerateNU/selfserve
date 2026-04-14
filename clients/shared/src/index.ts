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
} from "./api/generated/endpoints/guests/guests";

export { useGetGuestBookingsGroupSizes } from "./api/generated/endpoints/guest-bookings/guest-bookings";

export {
  usePostRooms,
  useGetRoomsFloors,
} from "./api/generated/endpoints/rooms/rooms";

export type {
  RoomWithOptionalGuestBooking,
  FilterRoomsRequest,
  GuestRequest,
} from "./api/generated/models";

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