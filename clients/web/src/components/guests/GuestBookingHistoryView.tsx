import { CalendarDays, ChevronRight, UsersRound } from "lucide-react";
import type { Stay } from "@shared";
import { formatDate } from "@/utils/dates";

type GuestBookingHistoryViewProps = {
  currentStays: Array<Stay>;
  pastStays: Array<Stay>;
  onBack: () => void;
};

function ActiveBookingCard({ stay }: { stay: Stay }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary bg-bg-selected p-4">
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
    </div>
  );
}

function PastStayRow({ stay }: { stay: Stay }) {
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
                <PastStayRow key={`${year}-${i}`} stay={stay} />
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
