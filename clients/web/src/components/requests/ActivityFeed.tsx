import { useEffect, useRef } from "react";
import { useGetRequestActivity, useGetUser } from "@shared";
import type { RequestActivityItem } from "@shared";
import {
  cn,
  formatFullDate,
  formatTimeAgo,
  getInitials,
  hashNameToColor,
} from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ActivityRowProps = {
  item: RequestActivityItem;
};

function ActivityRow({ item }: ActivityRowProps) {
  const { data: actor } = useGetUser(item.changed_by ?? undefined);
  const { data: target } = useGetUser(
    item.type === "assigned" && item.new_value ? item.new_value : undefined,
  );

  const actorName = actor
    ? [actor.first_name, actor.last_name].filter(Boolean).join(" ")
    : "Member";
  const colorSeed = actorName;
  const targetName = target?.first_name;

  const description = buildDescription(item, actorName, targetName);
  const detail = buildDetail(item);

  return (
    <div className="flex gap-3">
      {actor?.profile_picture ? (
        <img
          src={actor.profile_picture}
          alt={actorName}
          className="size-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            hashNameToColor(colorSeed),
          )}
        >
          {getInitials(actorName)}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-text-default">{description}</p>
        {detail && <p className="text-sm text-text-subtle">{detail}</p>}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="w-fit text-xs text-text-subtle cursor-default">
                {formatTimeAgo(item.timestamp)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{formatFullDate(item.timestamp)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function buildDescription(
  item: RequestActivityItem,
  actorName: string,
  targetName: string | undefined,
): React.ReactNode {
  switch (item.type) {
    case "created":
      return (
        <>
          <strong>{actorName}</strong> created request
        </>
      );
    case "status_changed":
      return (
        <>
          <strong>{actorName}</strong> changed status
        </>
      );
    case "priority_changed":
      return (
        <>
          <strong>{actorName}</strong> changed priority
        </>
      );
    case "assigned":
      return (
        <>
          <strong>{actorName}</strong> assigned request
          {targetName ? (
            <>
              {" "}
              to <strong>{targetName}</strong>
            </>
          ) : null}
        </>
      );
    case "unassigned":
      return (
        <>
          <strong>{actorName}</strong> unassigned from request
        </>
      );
    case "name_changed":
      return (
        <>
          <strong>{actorName}</strong> renamed request
        </>
      );
    default:
      return (
        <>
          <strong>{actorName}</strong> updated request
        </>
      );
  }
}

function buildDetail(item: RequestActivityItem): string | null {
  if (
    (item.type === "status_changed" ||
      item.type === "priority_changed" ||
      item.type === "name_changed") &&
    item.old_value &&
    item.new_value
  ) {
    return `${capitalize(item.old_value)} → ${capitalize(item.new_value)}`;
  }
  return null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type ActivityFeedProps = {
  requestId: string;
};

export function ActivityFeed({ requestId }: ActivityFeedProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useGetRequestActivity(requestId);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isPending) {
    return <p className="text-sm text-text-subtle py-2">Loading...</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-text-subtle py-2">No activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {items.map((item, i) => (
        <ActivityRow key={`${item.type}-${item.timestamp}-${i}`} item={item} />
      ))}
      {isFetchingNextPage && (
        <p className="text-xs text-text-subtle">Loading more...</p>
      )}
      <div ref={sentinelRef} className="h-1 shrink-0" />
    </div>
  );
}
