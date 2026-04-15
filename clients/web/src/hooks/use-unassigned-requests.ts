import { useQuery } from "@tanstack/react-query";
import { useAPIClient } from "@shared/api/client";
import type { GuestRequest } from "@shared";

type UnassignedRequestsPage = {
  items: GuestRequest[] | null;
  next_cursor: string | null;
  has_more: boolean;
};

export const UNASSIGNED_REQUESTS_QUERY_KEY = ["requests", "unassigned"] as const;

export function useUnassignedRequests() {
  const api = useAPIClient();

  return useQuery({
    queryKey: UNASSIGNED_REQUESTS_QUERY_KEY,
    queryFn: () => api.get<UnassignedRequestsPage>("/requests/unassigned"),
  });
}
