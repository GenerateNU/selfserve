export const TAB = {
    MY_TASKS: "myTasks",
    UNASSIGNED: "unassigned",
  } as const;
  
  export type TabName = (typeof TAB)[keyof typeof TAB];
  
  export const VARIANT = {
    ASSIGNED: "assigned",
    UNASSIGNED: "unassigned",
  } as const;
  
  export type VariantName = (typeof VARIANT)[keyof typeof VARIANT];