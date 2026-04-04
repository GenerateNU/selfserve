export const API_ENDPOINTS = {
  TASKS: "/tasks",
  task: (id: string) => `/tasks/${id}`,
  taskClaim: (id: string) => `/tasks/${id}/claim`,
  taskDrop: (id: string) => `/tasks/${id}/drop`,
} as const;
