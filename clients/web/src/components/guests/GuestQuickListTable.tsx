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
        {guests.map((guest) => (
          <button
            key={guest.id}
            type="button"
            onClick={() => onGuestClick(guest.id)}
            className={`grid w-full ${COL_CLASSES} items-center gap-4 border-b border-stroke-subtle px-4 py-4 text-left last:border-b-0 hover:bg-bg-container`}
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="truncate text-sm font-medium text-primary">
                {guest.first_name} {guest.last_name}
              </p>
              {guest.preferred_name &&
                guest.preferred_name !== guest.first_name && (
                  <p className="truncate text-sm text-text-subtle">
                    ({guest.preferred_name})
                  </p>
                )}
            </div>

            <p className="text-sm text-text-subtle">—</p>

            <div className="flex min-w-0 flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded px-2 py-1 text-xs bg-bg-selected text-primary">
                Floor {guest.floor}, Suite {guest.room_number}
              </span>
            </div>

            <p className="text-sm text-primary">—</p>
          </button>
        ))}

        {!isLoading && guests.length === 0 && (
          <div className="px-4 py-6 text-sm text-text-subtle">
            No guests match your current filters.
          </div>
        )}
      </div>
    </section>
  );
}
