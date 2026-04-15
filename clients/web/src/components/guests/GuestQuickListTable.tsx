import { Flag } from "lucide-react";
import type { GuestWithBooking } from "@shared";

type GuestQuickListTableProps = {
  guests: Array<GuestWithBooking>;
  isLoading?: boolean;
  onGuestClick: (guestId: string) => void;
};

const COL_CLASSES =
  "grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,5fr)_minmax(5rem,1fr)]";

export function GuestQuickListTable({
  guests,
  isLoading = false,
  onGuestClick,
}: GuestQuickListTableProps) {
  return (
    <section className="w-full">
      <div
        className={`mb-2 grid ${COL_CLASSES} items-center gap-4 px-4 py-2 text-sm font-medium text-primary`}
      >
        <p>Guest</p>
        <p>Specific Needs</p>
        <p>Active Bookings</p>
        <p>Requests</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-subtle bg-white">
        {guests.map((guest) => {
          const hasAccessibility = !!guest.assistance?.accessibility?.length;
          const hasDietary = !!guest.assistance?.dietary?.length;
          const hasMedical = !!guest.assistance?.medical?.length;
          const hasNeeds = hasAccessibility || hasDietary || hasMedical;

          return (
            <button
              key={guest.id}
              type="button"
              onClick={() => onGuestClick(guest.id ?? "")}
              className={`grid w-full ${COL_CLASSES} items-center gap-4 border-b border-stroke-subtle px-4 py-4 text-left last:border-b-0 hover:bg-bg-container`}
            >
              <p className="truncate text-sm font-medium text-primary">
                {guest.first_name} {guest.last_name}
              </p>

              <div className="flex min-w-0 flex-wrap gap-1">
                {hasNeeds ? (
                  <>
                    {hasAccessibility && (
                      <span className="inline-flex items-center rounded border border-[#a21313] bg-[#ffeded] px-1.5 py-0.5 text-xs text-[#a21313]">
                        Accessibility
                      </span>
                    )}
                    {hasDietary && (
                      <span className="inline-flex items-center rounded border border-[#a21313] bg-[#ffeded] px-1.5 py-0.5 text-xs text-[#a21313]">
                        Dietary
                      </span>
                    )}
                    {hasMedical && (
                      <span className="inline-flex items-center rounded border border-[#a21313] bg-[#ffeded] px-1.5 py-0.5 text-xs text-[#a21313]">
                        Medical
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-text-subtle">—</span>
                )}
              </div>

              <div className="flex min-w-0 flex-wrap gap-1.5">
                {(guest.active_bookings?.length ?? 0) > 0 ? (
                  guest.active_bookings!.map((booking, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded bg-bg-selected px-2 py-1 text-xs text-primary"
                    >
                      Floor {booking.floor}, Suite {booking.room_number}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-subtle">None</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {guest.has_urgent && (
                  <Flag className="size-3.5 text-[#a21313]" strokeWidth={2} />
                )}
                <span className="text-sm text-primary">
                  {guest.request_count ?? 0}
                </span>
              </div>
            </button>
          );
        })}

        {!isLoading && guests.length === 0 && (
          <div className="px-4 py-6 text-sm text-text-subtle">
            No guests match your current filters.
          </div>
        )}
      </div>
    </section>
  );
}
