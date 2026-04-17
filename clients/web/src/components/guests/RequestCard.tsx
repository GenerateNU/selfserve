import { Clock4, FlagIcon } from "lucide-react";
import type { GuestRequest, RequestPriority } from "@shared";
import { cn } from "@/lib/utils";

const priorityConfig: Record<
  Exclude<RequestPriority, "low">,
  { label: string; containerClass: string; contentClass: string }
> = {
  high: {
    label: "High Priority",
    containerClass: "bg-bg-high-priority",
    contentClass: "text-high-priority",
  },
  medium: {
    label: "Medium Priority",
    containerClass: "bg-bg-orange",
    contentClass: "text-text-orange",
  },
};

type RequestCardProps = {
  req: GuestRequest;
};

export function RequestCard({ req }: RequestCardProps) {
  const p = req.priority as RequestPriority | undefined;
  const tags = [req.request_category, req.request_type].filter(Boolean);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-text-subtle bg-white px-4 py-6">
      {/* Priority badge + name */}
      <div className="flex items-center gap-2">
        {(p === "high" || p === "medium") && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-1",
              priorityConfig[p].containerClass,
            )}
          >
            <FlagIcon
              className={cn("size-4", priorityConfig[p].contentClass)}
              strokeWidth={2}
            />
            <span className={cn("text-xs", priorityConfig[p].contentClass)}>
              {priorityConfig[p].label}
            </span>
          </div>
        )}
        <span className="text-sm font-semibold text-text-default">
          {req.name}
        </span>
      </div>

      {/* Room + timestamp */}
      <div className="flex items-center gap-2 text-xs text-text-default">
        {req.room_number != null && <span>Suite {req.room_number}</span>}
        {req.created_at && (
          <div className="flex items-center gap-0.5">
            <Clock4 className="size-2.5" strokeWidth={1.5} />
            <span>
              {new Date(req.created_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Category/type tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded border border-primary bg-bg-selected px-2 py-1 text-xs text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {req.description && (
        <p className="text-sm text-text-subtle">{req.description}</p>
      )}
    </div>
  );
}
