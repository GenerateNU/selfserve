/** API row from GET /tasks (matches backend models.Task). */
export type BackendTask = {
  id: string;
  title: string;
  priority: string;
  department?: string | null;
  location: string;
  description?: string | null;
  due_time?: string | null;
  status: string;
  is_assigned: boolean;
};

export type CursorPage<T> = {
  /** Backend may send `null` for empty lists (Go nil slice JSON). */
  items: T[] | null;
  next_cursor: string | null;
  has_more: boolean;
};

/** Normalized task for list/card UI. */
export type Task = {
  id: string;
  title: string;
  priority: string;
  department: string;
  location: string;
  description?: string;
  dueTime?: string;
  status: string;
  isAssigned: boolean;
};

export type TasksFilterState = {
  department?: string;
  priority?: string;
  status?: string;
};

export function mapBackendTask(t: BackendTask): Task {
  const cap = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
  let due: string | undefined;
  if (t.due_time) {
    try {
      due = new Date(t.due_time).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      due = t.due_time;
    }
  }
  return {
    id: t.id,
    title: t.title,
    priority: cap(t.priority),
    department: t.department?.trim() || "—",
    location: t.location,
    description: t.description ?? undefined,
    dueTime: due,
    status: t.status,
    isAssigned: t.is_assigned,
  };
}
