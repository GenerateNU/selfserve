import { cn } from "@/lib/utils";
import { RoomTaskCard } from "@/components/rooms/RoomTaskCard";
import type { RoomTaskCardData } from "@/components/rooms/RoomTaskCard";

export type RoomTaskItem = RoomTaskCardData & { id: string };

type RoomTaskListProps = {
  title: string;
  tasks: RoomTaskItem[];
  onAssignToSelf?: (id: string) => void;
  onExpand?: (id: string) => void;
  className?: string;
};

export function RoomTaskList({
  title,
  tasks,
  onAssignToSelf,
  onExpand,
  className = "",
}: RoomTaskListProps) {
  return (
    <section className={cn("flex w-full min-w-0 flex-col", className)}>
      <h2 className="my-2 shrink-0 text-sm font-medium leading-tight text-neutral-400">
        {title} ({tasks.length})
      </h2>

      <div className="h-0.5 w-full shrink-0 bg-stroke-subtle" />

      <div className="mt-3 flex flex-col gap-2">
        {tasks.map(({ id, ...task }) => (
          <RoomTaskCard
            key={id}
            {...task}
            onAssignToSelf={onAssignToSelf ? () => onAssignToSelf(id) : undefined}
            onExpand={onExpand ? () => onExpand(id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
