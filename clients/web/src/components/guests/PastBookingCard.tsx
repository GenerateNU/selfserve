import { UsersRound } from "lucide-react";
import type { Stay } from "@shared";
import { formatDate } from "@/utils/dates";

type PastBookingCardProps = {
  stay: Stay;
};

export function PastBookingCard({ stay }: PastBookingCardProps) {
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
