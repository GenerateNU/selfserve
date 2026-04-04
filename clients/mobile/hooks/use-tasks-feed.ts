import { useInfiniteQuery } from "@tanstack/react-query";
import { useAPIClient } from "@shared/api/client";
import { API_ENDPOINTS } from "@shared/api/endpoints";
import { TAB, type TabName } from "@/constants/tasks";
import type { CursorPage, Task, TasksFilterState } from "@/types/tasks";

type BackendTask = {
  id: string;
  title: string;
  priority: string;
  department: string;
  location: string;
  description?: string;
  due_time?: string;
  status: string;
  is_assigned: boolean;
};

const toUiPriority = (priority: string): Task["priority"] => {
  const normalized = priority.toLowerCase();
  if (normalized === "urgent" || normalized === "high") return "High";
  if (normalized === "middle" || normalized === "medium") return "Middle";
  return "Low";
};

const toUiTask = (task: BackendTask): Task => ({
  id: task.id,
  title: task.title,
  priority: toUiPriority(task.priority),
  department: task.department,
  location: task.location,
  description: task.description,
  dueTime: task.due_time,
  status: (task.status ?? "").toLowerCase(),
  isAssigned: task.is_assigned,
});

export const useTasksFeed = (tab: TabName, filters: TasksFilterState) => {
  const api = useAPIClient();

  return useInfiniteQuery({
    queryKey: ["tasks-feed", tab, filters],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string | number> = {
        tab: tab === TAB.MY_TASKS ? "my" : "unassigned",
        limit: 20,
      };
      if (pageParam) params.cursor = pageParam;
      if (filters.department?.trim())
        params.department = filters.department.trim();
      if (filters.priority?.trim()) params.priority = filters.priority.trim();
      if (filters.status?.trim()) params.status = filters.status.trim();

      const page = await api.get<CursorPage<BackendTask>>(
        API_ENDPOINTS.TASKS,
        params,
      );
      const rawItems = Array.isArray(page.items) ? page.items : [];
      return {
        ...page,
        items: rawItems.map(toUiTask),
      } satisfies CursorPage<Task>;
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
};
