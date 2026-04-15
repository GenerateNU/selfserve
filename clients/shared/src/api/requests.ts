import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GuestRequest } from "./generated/models";
import { useAPIClient } from "./client";

type GuestRequestPage = {
  items: GuestRequest[] | null;
  next_cursor: string | null;
  has_more: boolean;
};

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
})
}

export const REQUESTS_FEED_QUERY_KEY = ["requests-feed"] as const;

export type RequestFeedItem = {
  id: string;
  name: string;
  priority: string;
  status: string;
  description?: string | null;
  notes?: string | null;
  room_number?: number | null;
  request_type: string;
  request_category?: string | null;
  created_at: string;
  request_version: string;
};

export type RequestFeedPage = {
  items: RequestFeedItem[] | null;
  next_cursor: string | null;
  has_more: boolean;
};

export type RequestFeedParams = {
  userId?: string;
  unassigned?: boolean;
};

export const useCompleteTask = () => {
  const api = useAPIClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      api.put<RequestFeedItem>(`/request/${taskId}`, { status: "completed" }),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
      const previous = queryClient.getQueriesData<{ pages: RequestFeedPage[] }>({
        queryKey: REQUESTS_FEED_QUERY_KEY,
      });
      queryClient.setQueriesData(
        { queryKey: REQUESTS_FEED_QUERY_KEY },
        (old: { pages: RequestFeedPage[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: (page.items ?? []).map((item) =>
                item.id === taskId ? { ...item, status: "completed" } : item,
              ),
            })),
          };
        },
      );
      return { previous };
    },
    onError: (_err, _taskId, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
    },
  });
};

export const useGetRequestsFeed = (params: RequestFeedParams) => {
  const api = useAPIClient();
  return useInfiniteQuery({
    queryKey: [...REQUESTS_FEED_QUERY_KEY, params] as const,
    initialPageParam: "",
    queryFn: ({ pageParam }) => {
      const query: Record<string, string> = { limit: "20" };
      if (pageParam) query.cursor = pageParam;
      if (params.userId) query.user_id = params.userId;
      if (params.unassigned) query.unassigned = "true";
      return api.get<RequestFeedPage>("/requests", query);
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
};
