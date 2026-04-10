import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Department } from "../types/departments";
import { useAPIClient } from "./client";

export const getDepartmentsQueryKey = (hotelId: string | undefined) =>
  ["departments", hotelId] as const;

export const useGetDepartments = (hotelId: string | undefined) => {
  const api = useAPIClient();
  return useQuery({
    queryKey: getDepartmentsQueryKey(hotelId),
    queryFn: () => api.get<Department[]>(`/hotels/${hotelId}/departments`),
    enabled: !!hotelId,
  });
};

export const useCreateDepartment = (hotelId: string | undefined) => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      api.post<Department>(`/hotels/${hotelId}/departments`, { name }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getDepartmentsQueryKey(hotelId) });
    },
  });
};

export const useUpdateDepartment = (hotelId: string | undefined) => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.put<Department>(`/hotels/${hotelId}/departments/${id}`, { name }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getDepartmentsQueryKey(hotelId) });
    },
  });
};

export const useDeleteDepartment = (hotelId: string | undefined) => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<void>(`/hotels/${hotelId}/departments/${id}`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getDepartmentsQueryKey(hotelId) });
    },
  });
};
