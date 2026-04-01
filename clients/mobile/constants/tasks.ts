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

export type TaskViewMode = "default" | "compact";

export const TASK_FILTER_DEPARTMENTS = [
  { label: "Housekeeping", value: "housekeeping" },
  { label: "Room Service", value: "room service" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Front Desk", value: "front desk" },
] as const;

export const TASK_FILTER_PRIORITIES = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
] as const;

export const TASK_FILTER_STATUS_MY = [
  { label: "Assigned", value: "assigned" },
  { label: "In progress", value: "in progress" },
  { label: "Completed", value: "completed" },
] as const;

export const TASK_FILTER_STATUS_UNASSIGNED = [
  { label: "Pending", value: "pending" },
] as const;
