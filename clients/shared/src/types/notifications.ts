export const NotificationType = {
  TaskAssigned: "task_assigned",
  HighPriorityTask: "high_priority_task",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const DevicePlatform = {
  iOS: "ios",
  Android: "android",
} as const;

export type DevicePlatform = (typeof DevicePlatform)[keyof typeof DevicePlatform];

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
};

export type RegisterDeviceTokenInput = {
  token: string;
  platform: DevicePlatform;
};
