import type { Notification } from "@shared";
import type { NotificationGroup } from "./notification.types";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatTimestamp(createdAt: string, isUnread: boolean): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  const relative =
    mins < 60 ? `${mins}m` : hours < 24 ? `${hours}h` : `${days}d`;
  return isUnread ? `Updated ${relative} ago` : relative;
}

export function groupNotifications(
  notifications: Array<Notification>,
): Array<NotificationGroup> {
  const todayStart = startOfDay(new Date());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const today: Array<Notification> = [];
  const thisWeek: Array<Notification> = [];
  const older: Array<Notification> = [];

  for (const n of notifications) {
    const created = new Date(n.created_at);
    if (created >= todayStart) today.push(n);
    else if (created >= weekStart) thisWeek.push(n);
    else older.push(n);
  }

  const groups: Array<NotificationGroup> = [];
  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (thisWeek.length > 0) groups.push({ label: "This Week", items: thisWeek });
  if (older.length > 0) groups.push({ label: "Older", items: older });
  return groups;
}
