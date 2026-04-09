import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification, RegisterDeviceTokenInput } from "../types/notifications";
import { useAPIClient } from "./client";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export const useGetNotifications = () => {
  const api = useAPIClient();
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => api.get<Notification[]>("/notifications"),
    staleTime: 30_000,
  });
};

export const useMarkNotificationRead = () => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<void>(`/notifications/${id}/read`, {}),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.put<void>("/notifications/read-all", {}),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};

export const usePostDeviceToken = () => {
  const api = useAPIClient();
  return useMutation({
    mutationFn: (input: RegisterDeviceTokenInput) =>
      api.post<void>("/device-tokens", input),
  });
};
