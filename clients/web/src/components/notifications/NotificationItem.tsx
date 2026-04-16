import type { NotificationItem as NotificationItemType } from "./notification.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type NotificationItemProps = {
  item: NotificationItemType;
};

export function NotificationItem({ item }: NotificationItemProps) {
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
              item.unread ? "text-primary" : "text-text-subtle",
            )}
          >
            {item.timestamp}
          </span>
          {item.unread && (
            <div className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-8 pr-5">
        <p className="text-xs leading-snug text-text-secondary">
          {item.description}
        </p>
        {item.action && (
          <Button
            variant="primary"
            onClick={item.action.onClick}
            className="w-full text-xs font-bold"
          >
            {item.action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
