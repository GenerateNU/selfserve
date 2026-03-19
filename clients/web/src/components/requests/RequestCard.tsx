import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RequestStatus = "pending" | "completed";

type RequestCardProps = {
  status: RequestStatus;
  children: ReactNode;
  className?: string;
};

const accentClass: Record<RequestStatus, string> = {
  pending: "bg-request-pending",
  completed: "bg-request-completed",
};

export function RequestCard({ status, children, className }: RequestCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border border-stroke-disabled bg-white pt-3 pb-4 pl-4 shadow-sm overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-2 rounded-l-xl",
          accentClass[status],
        )}
      />
      {children}
    </div>
  );
}
