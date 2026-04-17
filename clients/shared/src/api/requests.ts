import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { GuestRequest, Request } from "./generated/models";
import { RequestStatus } from "./generated/models";
import { useAPIClient } from "./client";
import { getConfig } from "./config";

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
  });
};

export const REQUESTS_FEED_QUERY_KEY = ["requests-feed"] as const;

export const getRoomRequestsByRoomIdQueryKey = (roomId: string) =>
  [`/request/room/${roomId}`] as const;

export const useAssignRequestToSelf = (_roomId?: string) => {
  const api = useAPIClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      api.post<unknown>(`/request/${requestId}/assign`, { assign_to_self: true }),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
      const previousData = queryClient.getQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY });
      queryClient.setQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: (page.items ?? []).filter((item) => item.id !== requestId),
          })),
        };
      });
      return { previousData };
    },
    onError: (_err, _requestId, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === "string" && key.startsWith("/request/room/");
        },
      });
    },
  });
};

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
  department_id?: string | null;
  department_name?: string | null;
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
  priorities?: string[];
  departments?: string[];
  floors?: number[];
  search?: string;
};

export const useDropTask = () => {
  const api = useAPIClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      api.put<RequestFeedItem>(`/request/${taskId}`, { unassign: true }),
    onSuccess: (_data, taskId) => {
      queryClient.setQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: (page.items ?? []).filter((item) => item.id !== taskId),
          })),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
    },
  });
};

export const useCompleteTask = () => {
  const api = useAPIClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      api.put<RequestFeedItem>(`/request/${taskId}`, {
        status: RequestStatus.completed,
      }),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
      const previousData = queryClient.getQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY });
      queryClient.setQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: (page.items ?? []).map((item) =>
              item.id === taskId
                ? { ...item, status: RequestStatus.completed }
                : item,
            ),
          })),
        };
      });
      return { previousData };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
    },
  });
};

export const useMarkTaskPending = () => {
  const api = useAPIClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      api.put<RequestFeedItem>(`/request/${taskId}`, {
        status: RequestStatus.pending,
      }),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
      const previousData = queryClient.getQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY });
      queryClient.setQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: (page.items ?? []).map((item) =>
              item.id === taskId
                ? { ...item, status: RequestStatus.pending }
                : item,
            ),
          })),
        };
      });
      return { previousData };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
    },
  });
};

export const useDeleteTask = () => {
  const api = useAPIClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => api.delete<void>(`/request/${taskId}`),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
      const previousData = queryClient.getQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY });
      queryClient.setQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: (page.items ?? []).filter((item) => item.id !== taskId),
          })),
        };
      });
      return { previousData };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
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

type UpdateRequestDepartmentVars = {
  requestId: string;
  departmentId: string;
  sourceDepartmentId: string;
  updatedItem: RequestFeedItem;
};

export const useUpdateRequestDepartment = () => {
  const api = useAPIClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, departmentId }: UpdateRequestDepartmentVars) =>
      api.put<RequestFeedItem>(`/request/${requestId}`, { department: departmentId }),
    onMutate: async ({ requestId, departmentId, sourceDepartmentId, updatedItem }) => {
      await queryClient.cancelQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
      const previousData = queryClient.getQueriesData<{
        pages: RequestFeedPage[];
        pageParams: unknown[];
      }>({ queryKey: REQUESTS_FEED_QUERY_KEY });

      for (const [key, data] of previousData) {
        if (!data) continue;
        const params = key[1] as RequestFeedParams | undefined;
        const depts = params?.departments;
        if (depts?.includes(sourceDepartmentId)) {
          queryClient.setQueryData(key, {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: (page.items ?? []).filter((item) => item.id !== requestId),
            })),
          });
        } else if (depts?.includes(departmentId)) {
          queryClient.setQueryData(key, {
            ...data,
            pages: data.pages.map((page, i) =>
              i === 0
                ? { ...page, items: [updatedItem, ...(page.items ?? [])] }
                : page,
            ),
          });
        }
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: REQUESTS_FEED_QUERY_KEY,
        exact: false,
      });
    },
  });
};

export const useGetRequestsFeed = (params: RequestFeedParams) => {
  const api = useAPIClient();
  return useInfiniteQuery({
    queryKey: [...REQUESTS_FEED_QUERY_KEY, params] as const,
    initialPageParam: "",
    queryFn: ({ pageParam }) => {
      const { hotelId } = getConfig();
      return api.post<RequestFeedPage>("/requests/feed", {
        hotel_id: hotelId,
        cursor: pageParam || undefined,
        limit: 20,
        user_id: params.userId,
        unassigned: params.unassigned,
        sort: params.sort,
        status: params.status,
        priorities: params.priorities,
        departments: params.departments,
        floors: params.floors,
        search: params.search,
      });
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
};
