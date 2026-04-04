import { useInfiniteQuery } from "@tanstack/react-query";
import { useCustomInstance } from "@shared/api/orval-mutator";
import type { Request } from "@shared";

type CursorParam = { cursor_time?: number; cursor_id?: string };

type RequestPage = {
  requests: Array<Request>;
  next_cursor_time?: number;
  next_cursor_id?: string;
};

export function useKanbanRequests(hotelId: string | undefined, status: string) {
  const request = useCustomInstance<RequestPage>();

  return useInfiniteQuery({
    queryKey: ["requests", "kanban", hotelId, status],
    queryFn: async ({ pageParam }) => {
      return request({
        url: "/request/cursor",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          ...(pageParam.cursor_time !== undefined && {
            cursor_time: pageParam.cursor_time,
          }),
          ...(pageParam.cursor_id !== undefined && {
            cursor_id: pageParam.cursor_id,
          }),
          status,
        },
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next_cursor_time) return undefined;
      return {
        cursor_time: lastPage.next_cursor_time,
        cursor_id: lastPage.next_cursor_id ?? "",
      };
    },
    initialPageParam: {} as CursorParam,
    enabled: !!hotelId,
  });
}
