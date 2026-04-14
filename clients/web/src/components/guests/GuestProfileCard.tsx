import { UserRound } from "lucide-react";
import { formatDate } from "../../utils/dates";
import type { GuestWithStays } from "@shared";

type GuestProfileCardProps = {
  guest: GuestWithStays;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[38%_1fr] items-center py-[1vh] text-[1vw]">
      <p className="text-text-subtle">{label}</p>
      <p className="text-black">{value}</p>
    </div>
  );
}

export function GuestProfileCard({ guest }: GuestProfileCardProps) {
  const hasCurrentStay = guest.current_stays.length > 0;
  const currentStay = guest.current_stays[0];
  const phone = guest.phone?.trim() || "-";
  const email = guest.email?.trim() || "-";
  const pronouns = guest.pronouns?.trim() || "-";

  return (
    <section className="border border-black bg-white px-[1vw] py-[2vh]">
      <div className="mb-[2vh] flex items-start gap-[1.1vw]">
        <div className="flex h-[3vw] w-[3vw] items-center justify-center rounded-full border-2 border-black">
          <UserRound className="h-[2vw] w-[2vw] text-black" />
        </div>
        <div>
          <p className="text-[2vw] font-medium leading-tight text-black">
            {guest.first_name} {guest.last_name}
          </p>
        </div>
      </div>

      <div className="pt-[1vh]">
        <DetailRow label="Phone" value={phone} />
        <DetailRow label="Email" value={email} />
        <DetailRow label="Pronouns" value={pronouns} />
        {hasCurrentStay ? (
          <>
            <DetailRow label="Room" value={String(currentStay.room_number)} />
            <DetailRow
              label="Group Size"
              value={
                currentStay.group_size != null
                  ? String(currentStay.group_size)
                  : "-"
              }
            />
            <DetailRow
              label="Arrival"
              value={formatDate(currentStay.arrival_date)}
            />
            <DetailRow
              label="Departure"
              value={formatDate(currentStay.departure_date)}
            />
          </>
        ) : (
          <p className="text-[1vw] text-text-subtle">No active stay.</p>
        )}
      </div>
    </section>
  );
}
