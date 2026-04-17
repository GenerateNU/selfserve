import { Home, MapPin, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useQuery } from "@tanstack/react-query";
import {
  useCompleteTask,
  useDeleteTask,
  useGetUsersIdHook,
  useMarkTaskPending,
} from "@shared";
import { useDraggable } from "@dnd-kit/core";
import { TaskStatusToggle } from "./TaskStatusToggle";
import type { RequestFeedItem } from "@shared";
import { RequestCard } from "@/components/requests/RequestCard";
import { RequestCardTimestamp } from "@/components/requests/RequestCardTimestamp";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

export function formatRequestTime(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const today = new Date();
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${timeStr}`;
  }
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    `, ${timeStr}`
  );
}

type RequestCardItemProps = {
  onClick?: () => void;
  request: RequestFeedItem;
};

export function RequestCardItem({ request, onClick }: RequestCardItemProps) {
  const status = request.status;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: request.id,
    data: { request },
  });

  const getUserById = useGetUsersIdHook();
  const { data: assignee } = useQuery({
    queryKey: ["user", request.user_id],
    queryFn: () => getUserById(request.user_id!),
    enabled: !!request.user_id,
  });

  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: completeTask, isPending: isCompleting } = useCompleteTask();
  const { mutate: markTaskPending, isPending: isMarkingPending } =
    useMarkTaskPending();

  const assigneeName = assignee
    ? `${assignee.first_name ?? ""} ${assignee.last_name ?? ""}`.trim()
    : null;

  const roomLabel =
    request.room_number != null
      ? request.floor != null
        ? `Floor ${request.floor}, Room ${request.room_number}`
        : `Room ${request.room_number}`
      : null;

  const tags = [assigneeName].filter(Boolean) as Array<string>;
  const hasBottomRow = roomLabel || request.department_name;

  const launchGreenConfetti = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ["#22c55e", "#16a34a", "#86efac"],
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          className={cn(
            "relative touch-none cursor-grab active:cursor-grabbing",
            isDragging && "opacity-30",
          )}
          {...attributes}
          {...listeners}
          onPointerDown={(e) => {
            if (e.button !== 0 || !listeners) return;
            listeners.onPointerDown(e);
          }}
        >
          <TaskStatusToggle
            status={request.status}
            isPending={isCompleting || isMarkingPending}
            onComplete={() => completeTask(request.id)}
            onMarkPending={() => markTaskPending(request.id)}
            onCelebrate={launchGreenConfetti}
          />
          <RequestCard
            priority={request.priority}
            className="w-full"
            onClick={isDragging ? undefined : onClick}
          >
            <RequestCardTimestamp
              priority={request.priority}
              time={formatRequestTime(request.created_at)}
            />

            <div className="mt-3 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-base font-medium leading-snug text-text-default">
                  {request.name}
                </span>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded px-2 py-1 text-[11px] tracking-[-0.11px] text-text-secondary bg-stroke-disabled"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {hasBottomRow && (
                <div className="flex items-center gap-3">
                  {roomLabel && (
                    <span className="flex items-center gap-1 text-xs text-text-subtle">
                      <MapPin className="size-3 shrink-0" />
                      {roomLabel}
                    </span>
                  )}
                  {request.department_name && (
                    <span className="flex items-center gap-1 text-xs text-text-subtle">
                      <Home className="size-3 shrink-0" />
                      {request.department_name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </RequestCard>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          variant="destructive"
          onSelect={() => deleteTask(request.id)}
        >
          <Trash2 />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
