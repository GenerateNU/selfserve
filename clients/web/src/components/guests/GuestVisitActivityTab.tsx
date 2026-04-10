import { useState } from "react";
import { FlagIcon, StoreIcon } from "lucide-react";
import type { Stay, GuestRequest } from "@shared";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/dates";
import { GuestBookingHistoryView } from "./GuestBookingHistoryView";

type GuestVisitActivityTabProps = {
  currentStays: Stay[];
  pastStays: Stay[];
  requests: GuestRequest[];
};

type Priority = "high" | "medium" | "low";

const priorityConfig: Record<
  Exclude<Priority, "low">,
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

function ActiveBookingCard({ stay }: { stay: Stay }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-stroke-subtle bg-bg-selected/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-primary">
          Suite {stay.room_number}
        </span>
        {stay.group_size != null && (
          <span className="text-sm text-text-subtle">
            {stay.group_size} {stay.group_size === 1 ? "guest" : "guests"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-sm text-text-subtle">
        <span>{formatDate(stay.arrival_date)}</span>
        <span>–</span>
        <span>{formatDate(stay.departure_date)}</span>
      </div>
    </div>
  );
}

function RequestCard({ req }: { req: GuestRequest }) {
  const p = req.priority as Priority | undefined;
  const department = req.request_category ?? req.request_type;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-stroke-subtle bg-white p-4">
      <p className="text-sm font-medium text-text-default">{req.name}</p>

      {req.description && (
        <p className="text-sm text-text-subtle">{req.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {(p === "high" || p === "medium") && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-1",
              priorityConfig[p].containerClass,
            )}
          >
            <FlagIcon
              className={cn("size-3.5", priorityConfig[p].contentClass)}
              strokeWidth={2}
            />
            <span className={cn("text-xs", priorityConfig[p].contentClass)}>
              {priorityConfig[p].label}
            </span>
          </div>
        )}
        {department && (
          <div className="inline-flex items-center gap-1.5 rounded border border-stroke-subtle bg-white px-2 py-1">
            <StoreIcon
              className="size-3 shrink-0 text-text-default"
              strokeWidth={1.5}
            />
            <span className="text-xs text-text-default">{department}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function GuestVisitActivityTab({
  currentStays,
  pastStays,
  requests,
}: GuestVisitActivityTabProps) {
  const [showHistory, setShowHistory] = useState(false);

  if (showHistory) {
    return (
      <GuestBookingHistoryView
        currentStays={currentStays}
        pastStays={pastStays}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Active Bookings */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-subtle">
            Active Bookings
          </h3>
          <button
            type="button"
            aria-label="View all bookings"
            onClick={() => setShowHistory(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            View All Bookings
          </button>
        </div>
        {currentStays.length > 0 ? (
          <div className="flex flex-col gap-3">
            {currentStays.map((stay) => (
              <ActiveBookingCard key={stay.room_number} stay={stay} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-subtle">No active bookings.</p>
        )}
      </section>

      {/* Requests */}
      {requests.length > 0 && (
        <>
          <div className="border-t border-stroke-subtle" />
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-subtle">
              Requests
            </h3>
            <div className="flex flex-col gap-3">
              {requests.map((req) => (
                <RequestCard key={req.id ?? req.name} req={req} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
