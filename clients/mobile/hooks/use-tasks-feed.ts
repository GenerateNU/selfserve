import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { API_ENDPOINTS, useAPIClient } from "@shared";

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
  const client = useAPIClient();
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks-feed"] });

  const patchStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await client.patch(API_ENDPOINTS.task(id), { status });
    },
    onSettled: invalidate,
  });

  const claimTask = useMutation({
    mutationFn: async (id: string) => {
      await client.post(API_ENDPOINTS.taskClaim(id), {});
    },
    onSettled: invalidate,
  });

  const dropTask = useMutation({
    mutationFn: async (id: string) => {
      await client.post(API_ENDPOINTS.taskDrop(id), {});
    },
    onSettled: invalidate,
  });

  return { patchStatus, claimTask, dropTask };
}
