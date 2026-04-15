import { ChevronRight } from "lucide-react";
import { ActiveBookingCard } from "./ActiveBookingCard";
import { PastBookingCard } from "./PastBookingCard";
import type { Stay } from "@shared";

type GuestBookingHistoryViewProps = {
  currentStays: Array<Stay>;
  pastStays: Array<Stay>;
  onBack: () => void;
};

export function GuestBookingHistoryView({
  currentStays,
  pastStays,
  onBack,
}: GuestBookingHistoryViewProps) {
  const byYear = pastStays.reduce<Record<string, Array<Stay>>>((acc, stay) => {
    const year = stay.arrival_date.slice(0, 4);
    (acc[year] ??= []).push(stay);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-base">
        <button
          type="button"
          aria-label="Visit Activity"
          onClick={onBack}
          className="text-text-default hover:underline"
        >
          Visit Activity
        </button>
        <ChevronRight className="size-3.5 text-text-default" strokeWidth={2} />
        <span className="text-text-default">Booking History</span>
      </div>

      {/* Active stays */}
      {currentStays.length > 0 && (
        <section className="flex flex-col gap-4">
          <h3 className="text-base font-medium text-text-default">
            Active Bookings ({currentStays.length})
          </h3>
          <div className="flex flex-col gap-3">
            {currentStays.map((stay) => (
              <ActiveBookingCard
                key={`active-${stay.room_number}`}
                stay={stay}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past stays by year */}
      {years.length > 0 ? (
        years.map((year) => (
          <section key={year} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-text-default">{year}</h3>
            <div className="flex flex-col gap-2">
              {byYear[year].map((stay, i) => (
                <PastBookingCard key={`${year}-${i}`} stay={stay} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="text-sm text-text-subtle">No booking history.</p>
      )}
    </div>
  );
}
