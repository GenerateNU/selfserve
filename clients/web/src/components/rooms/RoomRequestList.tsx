import type { RoomRequestCardData } from "@/components/rooms/RoomRequestCard";
import { cn } from "@/lib/utils";
import { RoomRequestCard } from "@/components/rooms/RoomRequestCard";

export type RoomRequestItem = RoomRequestCardData & { id: string };

type RoomRequestListProps = {
  title?: string;
  requests: Array<RoomRequestItem>;
  onAssignToSelf?: (id: string) => void;
  onExpand?: (id: string) => void;
  className?: string;
};

export function RoomRequestList({
  title,
  requests,
  onAssignToSelf,
  onExpand,
  className = "",
}: RoomRequestListProps) {
  const showHeader = title != null && title !== "";

  return (
    <section className={cn("flex w-full min-w-0 flex-col", className)}>
      {showHeader ? (
        <>
          <h2 className="my-2 shrink-0 text-sm font-medium leading-tight text-neutral-400">
            {title} ({requests.length})
          </h2>
          <div className="h-0.5 w-full shrink-0 bg-stroke-subtle" />
        </>
      ) : null}

      <div className={cn("flex flex-col gap-2", showHeader && "mt-3")}>
        {requests.map(({ id, ...request }) => (
          <RoomRequestCard
            key={id}
            {...request}
            onAssignToSelf={
              onAssignToSelf ? () => onAssignToSelf(id) : undefined
            }
            onExpand={onExpand ? () => onExpand(id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
