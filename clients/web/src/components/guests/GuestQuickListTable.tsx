import type { GuestWithBooking } from "@shared";

type GuestQuickListTableProps = {
  guests: Array<GuestWithBooking>;
  isLoading?: boolean;
  onGuestClick: (guestId: string) => void;
};

export function GuestQuickListTable({
  guests,
  isLoading = false,
  onGuestClick,
}: GuestQuickListTableProps) {
  return (
    <section className="w-full">
      <div className="mb-2 grid grid-cols-[minmax(0,4.2fr)_minmax(0,2.7fr)_minmax(5rem,0.75fr)_minmax(8rem,1fr)] items-center gap-4 px-3 text-sm font-medium text-primary">
        <p className="whitespace-nowrap">Guest</p>
        <p className="whitespace-nowrap">Active Bookings</p>
        <p className="whitespace-nowrap text-center">Group Size</p>
        <p className="whitespace-nowrap text-center">Specific Assistance</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-subtle bg-white">
        {guests.map((guest) => (
          <button
            key={guest.id}
            type="button"
            onClick={() => onGuestClick(guest.id)}
            className="grid w-full grid-cols-[minmax(0,4.2fr)_minmax(0,2.7fr)_minmax(5rem,0.75fr)_minmax(8rem,1fr)] items-center gap-4 border-b border-stroke-subtle px-4 py-3 text-left last:border-b-0 hover:bg-bg-container"
          >
            <div className="flex min-w-0 items-center gap-2 text-sm text-primary">
              <p className="truncate">
                {guest.first_name} {guest.last_name}
              </p>
              <p className="shrink-0 truncate text-text-subtle">
                ({guest.preferred_name || guest.first_name})
              </p>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm text-primary">
              <p className="truncate">Suite {guest.room_number}</p>
              <p className="shrink-0 text-text-subtle">Floor {guest.floor}</p>
            </div>
            <p className="text-center text-sm text-primary">
              {guest.group_size ?? "—"}
            </p>
            <p className="text-center text-sm text-primary">—</p>
          </button>
        ))}
        {!isLoading && guests.length === 0 && (
          <div className="px-4 py-5 text-sm text-text-subtle">
            No guests match your current filters.
          </div>
        )}
      </div>
    </section>
  );
}
