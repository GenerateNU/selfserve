import { UserRound } from 'lucide-react'
import type { GuestListItem } from './guest-mocks'

type GuestQuickListTableProps = {
  guests: Array<GuestListItem>
  groupFilter: string
  floorFilter: string
  onGroupFilterChange: (value: string) => void
  onFloorFilterChange: (value: string) => void
  onGuestClick: (guestId: string) => void
}

function avatarPill() {
  return (
    <div className="flex h-[2vw] w-[2vw] items-center justify-center rounded-full border border-black">
      <UserRound className="h-[2vh] w-[2vh] text-black" />
    </div>
  )
}

export function GuestQuickListTable({
  guests,
  groupFilter,
  floorFilter,
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
          <option value="1-2">1-2</option>
          <option value="3-4">3-4</option>
          <option value="5+">5+</option>
        </select>
        <select
          value={floorFilter}
          onChange={(event) => onFloorFilterChange(event.target.value)}
          className="h-[3vh] min-h-[3vh] border border-black bg-white px-[1vw] text-[1vw]"
          aria-label="Floor filter"
        >
          <option value="all">Floor</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <p>Room</p>
      </div>

      <div className="overflow-hidden border border-black bg-white">
        {guests.map((guest) => (
          <button
            key={guest.id}
            type="button"
            onClick={() => onGuestClick(guest.id)}
            className="grid w-full grid-cols-[auto_5fr_5fr_2fr_2fr_2fr] items-center gap-[1vw] border-b border-black px-[1vw] py-[1vh] text-left last:border-b-0 hover:bg-neutral-50"
          >
            {avatarPill()}
            <p className="truncate text-[1vw] text-black">
              {guest.governmentName}
            </p>
            <p className="truncate text-[1vw] text-black">
              {guest.preferredName}
            </p>
            <p className="text-[1vw] text-black">{guest.groupSize}</p>
            <p className="text-[1vw] text-black">{guest.floor}</p>
            <p className="text-[1vw] text-black">{guest.room}</p>
          </button>
        ))}
        {guests.length === 0 && (
          <div className="px-[1vw] py-[2vh] text-[1vw] text-neutral-600">
            No guests match your current filters.
          </div>
        )}
      </div>
    </section>
  )
}
