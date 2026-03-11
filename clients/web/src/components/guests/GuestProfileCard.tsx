import { UserRound } from 'lucide-react'
import type { GuestProfile } from './guest-mocks'

type GuestProfileCardProps = {
  guest: GuestProfile
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[38%_1fr] items-center py-[1vh] text-[1vw]">
      <p className="text-[#b6bac3]">{label}</p>
      <p className="text-black">{value}</p>
    </div>
  )
}

export function GuestProfileCard({ guest }: GuestProfileCardProps) {
  return (
    <section className="border border-black bg-white px-[1vw] py-[2vh]">
      <div className="mb-[2vh] flex items-start gap-[1.1vw]">
        <div className="flex h-[3vw] w-[3vw] items-center justify-center rounded-full border-2 border-black">
          <UserRound className="h-[2vw] w-[2vw] text-black" />
        </div>
        <div>
          <p className="text-[2vw] font-medium leading-tight text-black">
            {guest.preferredName}
          </p>
          <p className="text-[1vw] text-black">{guest.pronouns}</p>
        </div>
      </div>

      <div className="border-b border-[#d3d8df] pb-[1vh]">
        <DetailRow label="Government Name" value={guest.governmentName} />
        <DetailRow label="Date of Birth" value={guest.dateOfBirth} />
      </div>

      <div className="pt-[1vh]">
        <DetailRow label="Room" value={guest.room} />
        <DetailRow label="Group Size" value={String(guest.groupSize)} />
        <DetailRow
          label="Arrival"
          value={`${guest.arrivalTime}  ${guest.arrivalDate}`}
        />
        <DetailRow
          label="Departure"
          value={`${guest.departureTime}  ${guest.departureDate}`}
        />
      </div>
    </section>
  )
}
