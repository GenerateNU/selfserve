import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Department } from "../types/departments";
import { useAPIClient } from "./client";
import { REQUESTS_FEED_QUERY_KEY } from "./requests";

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
      queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
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

export const useAddEmployeeDepartment = (hotelId: string | undefined) => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, departmentId }: { employeeId: string; departmentId: string }) =>
      api.post<void>(`/users/${employeeId}/departments`, { department_id: departmentId }),
    onSettled: (_data, _err, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ["hotel-members", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["user", employeeId] });
    },
  });
};

export const useRemoveEmployeeDepartment = (hotelId: string | undefined) => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, departmentId }: { employeeId: string; departmentId: string }) =>
      api.delete<void>(`/users/${employeeId}/departments/${departmentId}`),
    onSettled: (_data, _err, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ["hotel-members", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["user", employeeId] });
    },
  });
};
