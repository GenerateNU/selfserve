import { UserRound } from "lucide-react";
import type { GuestWithBooking } from "@shared";

type GuestQuickListTableProps = {
  guests: Array<GuestWithBooking>;
  floorOptions: Array<number>;
  groupSizeOptions: Array<number>;
  groupFilter: string;
  floorFilter: string;
  isLoading?: boolean;
  onGroupFilterChange: (value: string) => void;
  onFloorFilterChange: (value: string) => void;
  onGuestClick: (guestId: string) => void;
};

function avatarPill() {
  return (
    <div className="flex h-[2vw] w-[2vw] items-center justify-center rounded-full border border-black">
      <UserRound className="h-[2vh] w-[2vh] text-black" />
    </div>
  );
}

export function GuestQuickListTable({
  guests,
  floorOptions,
  groupSizeOptions,
  groupFilter,
  floorFilter,
  isLoading = false,
  onGroupFilterChange,
  onFloorFilterChange,
  onGuestClick,
}: GuestQuickListTableProps) {
  return (
    <section className="w-full">
      <div className="mb-[1vh] grid grid-cols-[5fr_5fr_2fr_2fr_2fr] items-center gap-[1vw] px-[1vw] text-[1vw] text-black">
        <p>Government Name</p>
        <p>Preferred Name</p>
        <select
          value={groupFilter}
          onChange={(event) => onGroupFilterChange(event.target.value)}
          className="h-[3vh] min-h-[3vh] border border-black bg-white px-[1vw] text-[1vw]"
          aria-label="Group filter"
        >
          <option value="all">Group</option>
          {groupSizeOptions.map((size) => (
            <option key={size} value={String(size)}>
              {size}
            </option>
          ))}
        </select>
        <select
          value={floorFilter}
          onChange={(event) => onFloorFilterChange(event.target.value)}
          className="h-[3vh] min-h-[3vh] border border-black bg-white px-[1vw] text-[1vw]"
          aria-label="Floor filter"
        >
          <option value="all">Floor</option>
          {floorOptions.map((floor) => (
            <option key={floor} value={String(floor)}>
              {floor}
            </option>
          ))}
        </select>
        <p>Room</p>
      </div>

      <div className="overflow-hidden border border-black bg-white">
        {guests.map((guest) => {
          const firstBooking = guest.active_bookings?.[0];

          return (
            <button
              key={guest.id}
              type="button"
              onClick={() => onGuestClick(guest.id ?? "")}
              className="grid w-full grid-cols-[auto_5fr_5fr_2fr_2fr_2fr] items-center gap-[1vw] border-b border-black px-[1vw] py-[1vh] text-left last:border-b-0 hover:bg-neutral-50"
            >
              {avatarPill()}
              <p className="truncate text-[1vw] text-black">
                {guest.first_name} {guest.last_name}
              </p>
              <p className="truncate text-[1vw] text-black">
                {guest.preferred_name}
              </p>
              <p className="text-[1vw] text-black">—</p>
              <p className="text-[1vw] text-black">{firstBooking?.floor ?? "—"}</p>
              <p className="text-[1vw] text-black">{firstBooking?.room_number ?? "—"}</p>
            </button>
          );
        })}
        {!isLoading && guests.length === 0 && (
          <div className="px-[1vw] py-[2vh] text-[1vw] text-neutral-600">
            No guests match your current filters.
          </div>
        )}
      </div>
    </section>
  );
}
