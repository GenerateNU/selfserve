import { useGetRequestsFeed } from "@shared";
import type { RoomRequestItem } from "@/components/rooms/RoomRequestList";

export function useUnassignedTasks() {
  const query = useGetRequestsFeed({ unassigned: true, sort: "priority" });

  const tasks: Array<RoomRequestItem> = (query.data?.pages ?? []).flatMap(
    (page) =>
      (page.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        room_number: item.room_number ?? undefined,
        request_category: item.request_category ?? undefined,
        priority: item.priority,
        status: item.status,
        description: item.description ?? undefined,
        notes: item.notes ?? undefined,
        floor: item.floor ?? undefined,
        request_type: item.request_type,
        department_id: item.department_id ?? undefined,
        department_name: item.department_name ?? undefined,
        user_id: item.user_id ?? undefined,
        created_at: item.created_at,
        request_version: item.request_version,
        isAssigned: false,
      })),
  );

  return { ...query, tasks };
}
