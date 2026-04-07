import {
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  API_ENDPOINTS,
  useAPIClient,
  usePatchTasksId,
  usePostTasksIdClaim,
  usePostTasksIdDrop,
} from "@shared";

import { TAB, type TabName, tabToApi } from "@/constants/tasks";
import type {
  BackendTask,
  CursorPage,
  Task,
  TasksFilterState,
} from "@/types/tasks";
import { mapBackendTask } from "@/types/tasks";

function buildTaskParams(
  tab: TabName,
  filters: TasksFilterState,
  cursor: string,
): Record<string, string> {
  const params: Record<string, string> = {
    tab: tabToApi(tab),
    limit: "20",
  };
  if (cursor) params.cursor = cursor;
  if (filters.department) params.department = filters.department;
  if (filters.priority) params.priority = filters.priority;
  if (filters.status) params.status = filters.status;
  return params;
}

export function useTasksFeed(tab: TabName, filters: TasksFilterState) {
  const client = useAPIClient();

  const query = useInfiniteQuery({
    queryKey: ["tasks-feed", tab, filters] as const,
    initialPageParam: "",
    queryFn: async ({ pageParam }) => {
      const params = buildTaskParams(tab, filters, pageParam);
      return client.get<CursorPage<BackendTask>>(API_ENDPOINTS.TASKS, params);
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

  const flatTasks: Task[] = (query.data?.pages ?? []).flatMap((p) =>
    (p.items ?? []).map(mapBackendTask),
  );

  return { ...query, flatTasks };
}

export function useTaskMutations() {
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks-feed"] });

  const patchStatusMutation = usePatchTasksId({
    mutation: {
      onSettled: invalidate,
    },
  });
  type PatchStatusInput = {
    id: string;
    status: Parameters<typeof patchStatusMutation.mutateAsync>[0]["data"]["status"];
  };
  const patchStatus = {
    ...patchStatusMutation,
    mutate: (
      vars: PatchStatusInput,
      ...args: Parameters<typeof patchStatusMutation.mutate> extends [any, ...infer R]
        ? R
        : never
    ) =>
      patchStatusMutation.mutate(
        { id: vars.id, data: { status: vars.status } },
        ...args,
      ),
    mutateAsync: (vars: PatchStatusInput) =>
      patchStatusMutation.mutateAsync({
        id: vars.id,
        data: { status: vars.status },
      }),
  };

  const claimTaskMutation = usePostTasksIdClaim({
    mutation: {
      onSettled: invalidate,
    },
  });
  const claimTask = {
    ...claimTaskMutation,
    mutate: (
      id: string,
      ...args: Parameters<typeof claimTaskMutation.mutate> extends [any, ...infer R]
        ? R
        : never
    ) => claimTaskMutation.mutate({ id }, ...args),
    mutateAsync: (id: string) => claimTaskMutation.mutateAsync({ id }),
  };

  const dropTaskMutation = usePostTasksIdDrop({
    mutation: {
      onSettled: invalidate,
    },
  });
  const dropTask = {
    ...dropTaskMutation,
    mutate: (
      id: string,
      ...args: Parameters<typeof dropTaskMutation.mutate> extends [any, ...infer R]
        ? R
        : never
    ) => dropTaskMutation.mutate({ id }, ...args),
    mutateAsync: (id: string) => dropTaskMutation.mutateAsync({ id }),
  };

  return { patchStatus, claimTask, dropTask };
}
