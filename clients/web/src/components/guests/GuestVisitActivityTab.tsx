import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { ActiveBookingCard } from "./ActiveBookingCard";
import { GuestBookingHistoryView } from "./GuestBookingHistoryView";
import { PastBookingCard } from "./PastBookingCard";
import { RequestCard } from "./RequestCard";
import type { GuestRequest, Stay } from "@shared";

type GuestVisitActivityTabProps = {
  currentStays: Array<Stay>;
  pastStays: Array<Stay>;
  requests: Array<GuestRequest>;
};

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
                <ActiveBookingCard key={stay.room_number} stay={stay} compact />
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
          {requests.length > 0 ? `Requests (${requests.length})` : "Requests"}
        </h3>
        {requests.length > 0 ? (
          <div className="flex flex-col gap-4">
            {requests.map((req) => (
              <RequestCard key={req.id ?? req.name} req={req} />
            ))}
          </div>
        ) : (
          <p className="text-base text-text-secondary">You're all caught up!</p>
        )}
      </section>
    </div>
  );
}
