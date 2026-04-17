import { useQuery } from "@tanstack/react-query";
import { GithubComGenerateSelfserveInternalModelsBookingStatus } from "./generated/models";
import type { RoomWithOptionalGuestBooking } from "./generated/models";
import { useAPIClient } from "./client";

export const BookingStatus = GithubComGenerateSelfserveInternalModelsBookingStatus;

export const RoomStatusValue = {
  Available: "available",
  Cleaning: "cleaning",
  OutOfOrder: "out-of-order",
} as const;

type RoomsPage = {
  items: RoomWithOptionalGuestBooking[] | null;
  has_more: boolean;
  next_cursor: string | null;
};

export const getRoomsQueryKey = (floors: number[]) =>
  ["rooms", ...floors] as const;

export const useGetRoomsForFloor = (floors: number[]) => {
  const api = useAPIClient();
  return useQuery({
    queryKey: getRoomsQueryKey(floors),
    queryFn: () => api.post<RoomsPage>("/rooms", { floors, limit: 200 }),
    enabled: floors.length > 0,
  });
};
