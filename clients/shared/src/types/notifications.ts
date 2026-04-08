export type NotificationType = "task_assigned" | "high_priority_task";

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
  platform: "ios" | "android";
};
