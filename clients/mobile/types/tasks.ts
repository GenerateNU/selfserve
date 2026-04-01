export type Priority = "High" | "Middle" | "Low";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  department: string;
  location: string;
  description?: string;
  dueTime?: string;
  /** Raw API status: pending | assigned | in progress | completed */
  status: string;
  isAssigned: boolean;
}

/** Query filters for GET /tasks (values match DB / API). */
export type TasksFilterState = {
  department?: string;
  priority?: string;
  status?: string;
};

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}
