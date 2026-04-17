import { formatTimestamp } from "./notification.utils";
import type { Notification } from "@shared";
import { cn } from "@/lib/utils";

type NotificationItemProps = {
  item: Notification;
};

export function NotificationItem({ item }: NotificationItemProps) {
  const isUnread = !item.read_at;
  const timestamp = formatTimestamp(item.created_at, isUnread);

  return (
    <div className="flex flex-col gap-1 border-b border-stroke-disabled pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-4 shrink-0 rounded-sm border border-text-subtle" />
          <span className="text-sm font-semibold text-text-default">
            {item.title}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "text-xs",
              isUnread ? "text-primary" : "text-text-subtle",
            )}
          >
            {timestamp}
          </span>
          {isUnread && (
            <div className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-8 pr-5">
        <p className="text-xs leading-snug text-text-secondary">{item.body}</p>
      </div>
    </div>
  );
}
