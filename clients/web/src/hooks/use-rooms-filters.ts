import { useCallback, useState } from "react";

export type RoomsPageFilters = {
  floors: Array<number>;
  filterChips: Array<string>;
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

  const setFilterChips = useCallback((filterChips: Array<string>) => {
    setFilters((prev) => ({ ...prev, filterChips }));
  }, []);

  const removeFilterChip = useCallback((chip: string) => {
    setFilters((prev) => ({
      ...prev,
      filterChips: prev.filterChips.filter((value) => value !== chip),
    }));
  }, []);

  return { filters, setFloors, setFilterChips, removeFilterChip };
}
