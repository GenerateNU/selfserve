import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GuestRequest, Request } from "./generated/models";
import { RequestStatus } from "./generated/models";
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
  status: RequestStatus;
  description?: string | null;
  notes?: string | null;
  room_number?: number | null;
  floor?: number | null;
  request_type: string;
  request_category?: string | null;
  department?: string | null;
  user_id?: string | null;
  created_at: string;
  request_version: string;
};

export type RequestFeedPage = {
  items: RequestFeedItem[] | null;
  next_cursor: string | null;
  has_more: boolean;
};

export type RequestFeedSort = "priority" | "newest" | "oldest";

export type RequestFeedParams = {
  userId?: string;
  unassigned?: boolean;
  sort?: RequestFeedSort;
  status?: string;
  departments?: string[];
};

export const useCompleteTask = () => {
  const api = useAPIClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      api.put<RequestFeedItem>(`/request/${taskId}`, { status: RequestStatus.completed }),
    onSuccess: (_data, taskId) => {
      queryClient.setQueriesData<{ pages: RequestFeedPage[]; pageParams: unknown[] }>(
        { queryKey: REQUESTS_FEED_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: (page.items ?? []).map((item) =>
                item.id === taskId ? { ...item, status: RequestStatus.completed } : item,
              ),
            })),
          };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
    },
  });
};

export const useGetRequestById = (requestId: string | null) => {
  const api = useAPIClient();
  return useQuery({
    queryKey: ["request", requestId],
    queryFn: () => api.get<Request>(`/request/${requestId}`),
    enabled: !!requestId,
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
      if (params.sort) query.sort = params.sort;
      if (params.status) query.status = params.status;
      if (params.departments?.length) query.departments = params.departments.join(",");
      return api.get<RequestFeedPage>("/requests", query);
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
};
