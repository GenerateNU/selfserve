import { useInfiniteQuery } from "@tanstack/react-query";
import { useAPIClient } from "./client";

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
      return api.get<RequestFeedPage>("/requests", query);
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
};
