import { Check } from "lucide-react";
import { RequestStatus } from "@shared";
import { cn } from "@/lib/utils";

type TaskStatusToggleProps = {
  status: RequestStatus;
  isPending?: boolean;
  onComplete: () => void;
  onMarkPending: () => void;
  onCelebrate?: (target: HTMLElement) => void;
  className?: string;
};

export function TaskStatusToggle({
  status,
  isPending = false,
  onComplete,
  onMarkPending,
  onCelebrate,
  className,
}: TaskStatusToggleProps) {
  const isCompleted = status === RequestStatus.completed;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();

        if (isCompleted) {
          onMarkPending();
          return;
        }

        onCelebrate?.(e.currentTarget);
        onComplete();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      className={cn(
        "absolute top-2 right-2 z-10 flex size-4 items-center justify-center rounded-full shadow-sm transition disabled:opacity-50",
        isCompleted
          ? "bg-primary text-white hover:bg-primary-hover"
          : "border border-stroke-subtle bg-transparent text-primary hover:bg-primary-container",
        className,
      )}
      aria-label={
        isCompleted ? "Mark task as pending" : "Mark task as completed"
      }
    >
      <Check
        className={cn(
          "size-2.5 transition-opacity duration-150",
          isCompleted ? "opacity-100" : "opacity-0",
        )}
        strokeWidth={3}
      />
    </button>
  );
}
