export const API_ENDPOINTS = {
  TASKS: "/api/v1/tasks",
  task: (id: string) => `/api/v1/tasks/${id}`,
  taskClaim: (id: string) => `/api/v1/tasks/${id}/claim`,
  taskDrop: (id: string) => `/api/v1/tasks/${id}/drop`,
} as const;
