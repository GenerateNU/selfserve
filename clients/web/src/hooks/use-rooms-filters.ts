import { useCallback, useState } from "react";
import type {
  RoomAdvancedFilter,
  RoomAttributeFilter,
  RoomStatusFilter,
} from "@shared/api/rooms";

export type RoomFilters = {
  status: Array<RoomStatusFilter>;
  attributes: Array<RoomAttributeFilter>;
  advanced: Array<RoomAdvancedFilter>;
};

export type RoomsPageFilters = RoomFilters & {
  floors: Array<number>;
};

export const EMPTY_ROOM_FILTERS: RoomFilters = {
  status: [],
  attributes: [],
  advanced: [],
};

function sortFloorsAscending(floors: Array<number>) {
  return [...floors].sort((a, b) => a - b);
}

export function useRoomsFilters(initialFilters: RoomsPageFilters) {
  const [filters, setFilters] = useState<RoomsPageFilters>({
    ...initialFilters,
    floors: sortFloorsAscending(initialFilters.floors),
  });

  const setFloors = useCallback((floors: Array<number>) => {
    setFilters((prev) => ({
      ...prev,
      floors: sortFloorsAscending(floors),
    }));
  }, []);

  const applyFilters = useCallback((group: RoomFilters) => {
    setFilters((prev) => ({ ...prev, ...group }));
  }, []);

  const removeStatus = useCallback((value: RoomStatusFilter) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.filter((s) => s !== value),
    }));
  }, []);

  const removeAttribute = useCallback((value: RoomAttributeFilter) => {
    setFilters((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((a) => a !== value),
    }));
  }, []);

  const removeAdvanced = useCallback((value: RoomAdvancedFilter) => {
    setFilters((prev) => ({
      ...prev,
      advanced: prev.advanced.filter((a) => a !== value),
    }));
  }, []);

  return {
    filters,
    setFloors,
    applyFilters,
    removeStatus,
    removeAttribute,
    removeAdvanced,
  };
}
