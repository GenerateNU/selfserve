import { useInfiniteQuery } from "@tanstack/react-query";
import { useGetRequestCursorCursorHook } from "@shared/api/generated/endpoints/requests/requests";
import type { Request } from "@shared";

const CURSOR_START = "0";

type RequestPage = { requests: Request[]; next_cursor: string };

export function useKanbanRequests(hotelId: string | undefined, status: string) {
  const getRequests = useGetRequestCursorCursorHook();

  return useInfiniteQuery({
    queryKey: ["requests", "kanban", hotelId, status],
    queryFn: async ({ pageParam }: { pageParam: string }) => {
      const result = await getRequests(pageParam, {
        hotel_id: hotelId!,
        status,
      });
      return result as RequestPage;
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
    initialPageParam: CURSOR_START,
    enabled: !!hotelId,
  });
}
