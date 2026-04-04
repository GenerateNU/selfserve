export const TAB = {
  MY_TASKS: "myTasks",
  UNASSIGNED: "unassigned",
} as const;

export type TabName = (typeof TAB)[keyof typeof TAB];

export const TASK_ASSIGNMENT_STATE = {
  ASSIGNED: "assigned",
  UNASSIGNED: "unassigned",
} as const;

export type TaskAssignmentState =
  (typeof TASK_ASSIGNMENT_STATE)[keyof typeof TASK_ASSIGNMENT_STATE];

/** API `tab` query value */
export function tabToApi(tab: TabName): "my" | "unassigned" {
  return tab === TAB.MY_TASKS ? "my" : "unassigned";
}

export const TASK_FILTER_DEPARTMENTS = [
  { label: "Housekeeping", value: "Housekeeping" },
  { label: "Room Service", value: "Room Service" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Front Desk", value: "Front Desk" },
] as const;

export const TASK_FILTER_PRIORITIES = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
] as const;

/** Status values for `my` tab (API enum). */
export const TASK_FILTER_STATUS_MY = [
  { label: "Assigned", value: "assigned" },
  { label: "In progress", value: "in progress" },
  { label: "Completed", value: "completed" },
] as const;

/** Status values for unassigned tab. */
export const TASK_FILTER_STATUS_UNASSIGNED = [
  { label: "Pending", value: "pending" },
] as const;
