import { ChevronLeft } from "lucide-react";
import type { Stay } from "@shared";
import { formatDate } from "@/utils/dates";

type GuestBookingHistoryViewProps = {
  currentStays: Stay[];
  pastStays: Stay[];
  onBack: () => void;
};

function StayRow({ stay }: { stay: Stay }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-stroke-subtle bg-white px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text-default">
          Suite {stay.room_number}
        </span>
        <span className="text-xs text-text-subtle">
          {formatDate(stay.arrival_date)} – {formatDate(stay.departure_date)}
        </span>
      </div>
      {stay.group_size != null && (
        <span className="text-sm text-text-subtle">
          {stay.group_size} {stay.group_size === 1 ? "guest" : "guests"}
        </span>
      )}
    </div>
  );
}

export function GuestBookingHistoryView({
  currentStays,
  pastStays,
  onBack,
}: GuestBookingHistoryViewProps) {
  const byYear = pastStays.reduce<Record<string, Stay[]>>((acc, stay) => {
    const year = stay.arrival_date.slice(0, 4);
    (acc[year] ??= []).push(stay);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back button */}
      <button
        type="button"
        aria-label="Visit Activity"
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft className="size-4" />
        Visit Activity
      </button>

      {/* Active / current stays */}
      {currentStays.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-subtle">
            Active Bookings
          </h3>
          <div className="flex flex-col gap-2">
            {currentStays.map((stay) => (
              <StayRow key={`active-${stay.room_number}`} stay={stay} />
            ))}
          </div>
        </section>
      )}

      {/* Past stays by year */}
      {years.length > 0 ? (
        years.map((year) => (
          <section key={year} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-text-subtle">{year}</h3>
            <div className="flex flex-col gap-2">
              {byYear[year].map((stay, i) => (
                <StayRow key={`${year}-${i}`} stay={stay} />
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
