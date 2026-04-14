import { useInfiniteQuery } from "@tanstack/react-query";
import type { GithubComGenerateSelfserveInternalUtilsCursorPageGuestRequest as GuestRequestPage } from "./generated/models";
import { useAPIClient } from "./client";

export const getGuestRequestsQueryKey = (guestId: string) =>
  ["requests", "guest", guestId] as const;

export const useInfiniteRequestsByGuest = (guestId: string) => {
  const api = useAPIClient();

  return useInfiniteQuery({
    queryKey: getGuestRequestsQueryKey(guestId),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      api.get<GuestRequestPage>(`/request/guest/${guestId}`, {
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    enabled: !!guestId,
  });
};
