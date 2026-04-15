import { CalendarDays, UsersRound } from "lucide-react";
import type { Stay } from "@shared";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/dates";

type ActiveBookingCardProps = {
  stay: Stay;
  compact?: boolean;
};

export function ActiveBookingCard({ stay, compact }: ActiveBookingCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-primary bg-bg-selected p-4",
        compact && "w-[231px] shrink-0",
      )}
    >
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
      {compact ? (
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-primary">Arrival:</span>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CalendarDays className="size-3 shrink-0" strokeWidth={1.5} />
              <span>{formatDate(stay.arrival_date)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-primary">Departure:</span>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CalendarDays className="size-3 shrink-0" strokeWidth={1.5} />
              <span>{formatDate(stay.departure_date)}</span>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
