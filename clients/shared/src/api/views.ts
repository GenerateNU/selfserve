import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { View, CreateViewInput } from "../types/views";
import { useAPIClient } from "./client";

export const getViewsQueryKey = (slug: string) => ["views", slug] as const;

export const useGetViews = (slug: string) => {
  const api = useAPIClient();
  return useQuery({
    queryKey: getViewsQueryKey(slug),
    queryFn: () => api.get<View[]>("/views", { slug }),
    enabled: !!slug,
  });
};

export const useCreateView = (slug: string) => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateViewInput) => api.post<View>("/views", input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getViewsQueryKey(slug) });
    },
  });
};

export const useDeleteView = (slug: string) => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/views/${id}`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getViewsQueryKey(slug) });
    },
  });
};
