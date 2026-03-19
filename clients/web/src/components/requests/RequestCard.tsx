import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

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
        "relative flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-4 pl-7 shadow-sm overflow-hidden",
        className
      )}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-[5px] rounded-l-xl", accentClass[status])} />
      {children}
    </div>
  );
}
