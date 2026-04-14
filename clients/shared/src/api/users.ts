import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "./generated/models";
import { useAPIClient } from "./client";

export const getUserQueryKey = (userId: string | undefined) =>
  ["user", userId] as const;

export const useGetUser = (userId: string | undefined) => {
  const api = useAPIClient();
  return useQuery({
    queryKey: getUserQueryKey(userId),
    queryFn: () => api.get<User>(`/users/${userId}`),
    enabled: !!userId,
  });
};

export const useUpdateUser = (userId: string | undefined) => {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: { phone_number?: string }) =>
      api.put<User>(`/users/${userId}`, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: getUserQueryKey(userId) });
      const previous = queryClient.getQueryData<User>(getUserQueryKey(userId));
      queryClient.setQueryData<User>(getUserQueryKey(userId), (old) => ({
        ...old!,
        ...updates,
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(getUserQueryKey(userId), context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getUserQueryKey(userId) });
    },
  });
};
