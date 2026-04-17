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

export type RoomStatusFilter = "occupied" | "vacant" | "open-tasks";
export type RoomAttributeFilter = "standard" | "deluxe" | "suite" | "accessible";
export type RoomAdvancedFilter = "arrivals-today" | "departures-today";
export type RoomSortOption = "ascending" | "descending" | "urgency";

export type RoomFiltersParams = {
  floors?: number[];
  status?: RoomStatusFilter[];
  attributes?: RoomAttributeFilter[];
  advanced?: RoomAdvancedFilter[];
  sort?: RoomSortOption;
  cursor?: string;
  limit?: number;
};

type RoomsPage = {
  items: RoomWithOptionalGuestBooking[] | null;
  has_more: boolean;
  next_cursor: string | null;
};

export const getRoomsQueryKey = (params: RoomFiltersParams) =>
  ["rooms", params] as const;

export const useGetRooms = (params: RoomFiltersParams, enabled = true) => {
  const api = useAPIClient();
  return useQuery({
    queryKey: getRoomsQueryKey(params),
    queryFn: () =>
      api.post<RoomsPage>("/rooms", { limit: 200, ...params }),
    enabled,
  });
};

export const useGetRoomsFloors = () => {
  const api = useAPIClient();
  return useQuery({
    queryKey: ["rooms", "floors"],
    queryFn: () => api.get<number[]>("/rooms/floors"),
  });
};
