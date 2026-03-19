import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type RequestStatus = "pending" | "completed";

type RequestCardProps = {
  status: RequestStatus;
  children: ReactNode;
  className?: string;
};

const accentColor: Record<RequestStatus, string> = {
  pending: "#F25118",
  completed: "#067A0C",
};

export function RequestCard({ status, children, className }: RequestCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-4 pl-7 shadow-sm overflow-hidden",
        className
      )}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[5px] rounded-l-xl"
        style={{ backgroundColor: accentColor[status] }}
      />
      {children}
    </div>
  );
}
