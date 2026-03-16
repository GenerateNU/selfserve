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
