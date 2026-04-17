import { useCallback, useState } from "react";

export type RoomsPageFilters = {
  floors: Array<number>;
  filterChips: Array<string>;
};

export function useRoomsFilters(initialFilters: RoomsPageFilters) {
  const [filters, setFilters] = useState<RoomsPageFilters>(initialFilters);

  const setFloors = useCallback((floors: Array<number>) => {
    setFilters((prev) => ({ ...prev, floors }));
  }, []);

  const setFilterChips = useCallback((filterChips: Array<string>) => {
    setFilters((prev) => ({ ...prev, filterChips }));
  }, []);

  return { filters, setFloors, setFilterChips };
}
