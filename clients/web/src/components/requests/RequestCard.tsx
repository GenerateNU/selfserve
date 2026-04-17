import type { ReactNode } from "react";
import type { RequestStatus } from "@shared";
import { cn } from "@/lib/utils";

type RequestCardProps = {
  status: RequestStatus;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

const accentClass: Record<RequestStatus, string> = {
  pending: "bg-request-pending",
  "in progress": "bg-request-assigned",
  completed: "bg-request-completed",
  archived: "bg-bg-disabled",
};

export function RequestCard({
  status,
  children,
  className,
  onClick,
}: RequestCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col rounded-xl border border-stroke-disabled bg-white pt-3 pb-4 pl-4 pr-4 shadow-sm overflow-hidden",
        onClick && "cursor-pointer",
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
