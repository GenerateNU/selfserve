import { useState } from "react";
import {
  FlagIcon,
  UsersRound,
  CalendarDays,
  Clock4,
  ChevronRight,
} from "lucide-react";
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
    containerClass: "bg-[#ffeded]",
    contentClass: "text-[#a21313]",
  },
  medium: {
    label: "Medium Priority",
    containerClass: "bg-bg-orange",
    contentClass: "text-text-orange",
  },
};

function ActiveBookingCard({ stay, compact }: { stay: Stay; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-primary bg-bg-selected p-4",
        compact && "w-[231px] shrink-0",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xl font-bold text-primary">
          Suite {stay.room_number}
        </span>
        {stay.group_size != null && (
          <div className="flex items-center gap-1 text-primary">
            <UsersRound className="size-[19px]" strokeWidth={1.5} />
            <span className="text-xl font-bold">{stay.group_size}</span>
          </div>
        )}
      </div>
      {compact ? (
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-primary">Arrival:</span>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CalendarDays className="size-3 shrink-0" strokeWidth={1.5} />
              <span>{formatDate(stay.arrival_date)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-primary">Departure:</span>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CalendarDays className="size-3 shrink-0" strokeWidth={1.5} />
              <span>{formatDate(stay.departure_date)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-[72px]">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-primary">Arrival:</span>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CalendarDays className="size-3 shrink-0" strokeWidth={1.5} />
              <span>{formatDate(stay.arrival_date)}</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-primary">Departure:</span>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CalendarDays className="size-3 shrink-0" strokeWidth={1.5} />
              <span>{formatDate(stay.departure_date)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PastBookingCard({ stay }: { stay: Stay }) {
  return (
    <div className="flex items-center rounded-lg border border-text-subtle bg-bg-container p-4">
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-subtle">
            Suite {stay.room_number}
          </span>
          {stay.group_size != null && (
            <div className="flex items-center gap-0.5 text-text-subtle">
              <UsersRound className="size-3" strokeWidth={1.5} />
              <span className="text-sm font-medium">{stay.group_size}</span>
            </div>
          )}
        </div>
        <span className="text-sm text-text-subtle">
          {formatDate(stay.arrival_date)} - {formatDate(stay.departure_date)}
        </span>
      </div>
    </div>
  );
}

function RequestCard({ req }: { req: GuestRequest }) {
  const p = req.priority as Priority | undefined;
  const tags = [req.request_category, req.request_type].filter(Boolean);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-text-subtle bg-white px-4 py-6">
      {/* Priority badge + name */}
      <div className="flex items-center gap-2">
        {(p === "high" || p === "medium") && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-1",
              priorityConfig[p].containerClass,
            )}
          >
            <FlagIcon
              className={cn("size-4", priorityConfig[p].contentClass)}
              strokeWidth={2}
            />
            <span className={cn("text-xs", priorityConfig[p].contentClass)}>
              {priorityConfig[p].label}
            </span>
          </div>
        )}
        <span className="text-sm font-semibold text-text-default">
          {req.name}
        </span>
      </div>

      {/* Room + timestamp */}
      <div className="flex items-center gap-2 text-xs text-text-default">
        {req.room_number != null && <span>Suite {req.room_number}</span>}
        {req.created_at && (
          <div className="flex items-center gap-0.5">
            <Clock4 className="size-2.5" strokeWidth={1.5} />
            <span>
              {new Date(req.created_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Category/type tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded border border-primary bg-bg-selected px-2 py-1 text-xs text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {req.description && (
        <p className="text-sm text-text-subtle">{req.description}</p>
      )}

      {/* Mark in Progress button */}
      <button
        type="button"
        className="mt-1 w-full rounded bg-primary px-6 py-2 text-sm text-white hover:bg-primary-hover"
      >
        Mark in Progress
      </button>
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

  const hasActiveBookings = currentStays.length > 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Active Bookings or Previous Bookings */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-text-default">
            {hasActiveBookings
              ? `Active Bookings (${currentStays.length})`
              : "Previous Bookings"}
          </h3>
          <button
            type="button"
            aria-label="View all bookings"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 text-base text-text-default hover:underline"
          >
            View All Bookings
            <ChevronRight className="size-3.5" strokeWidth={2} />
          </button>
        </div>

        {hasActiveBookings ? (
          currentStays.length === 1 ? (
            <ActiveBookingCard stay={currentStays[0]} />
          ) : (
            <div className="flex gap-5">
              {currentStays.slice(0, 2).map((stay) => (
                <ActiveBookingCard
                  key={stay.room_number}
                  stay={stay}
                  compact
                />
              ))}
            </div>
          )
        ) : pastStays.length > 0 ? (
          <div className="flex flex-col gap-2">
            {pastStays.slice(0, 3).map((stay, i) => (
              <PastBookingCard key={`past-${i}`} stay={stay} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-subtle">No bookings.</p>
        )}
      </section>

      {/* Requests */}
      <section className="flex flex-col gap-4">
        <h3 className="text-base font-medium text-text-default">
          {requests.length > 0
            ? `Requests (${requests.length})`
            : "Requests"}
        </h3>
        {requests.length > 0 ? (
          <div className="flex flex-col gap-4">
            {requests.map((req) => (
              <RequestCard key={req.id ?? req.name} req={req} />
            ))}
          </div>
        ) : (
          <p className="text-base text-text-secondary">
            You're all caught up!
          </p>
        )}
      </section>
    </div>
  );
}
