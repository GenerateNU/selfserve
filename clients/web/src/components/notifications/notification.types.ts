import type { Notification } from "@shared";

export type NotificationGroup = {
  label: string;
  items: Array<Notification>;
};
