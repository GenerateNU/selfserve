import { formatDate } from "../../utils/dates";
import type { Stay } from "@shared";

type PreviousStaysCardProps = {
  stays: Array<Stay>;
};

export function PreviousStaysCard({ stays }: PreviousStaysCardProps) {
  return (
    <section className="border border-black bg-white px-[1vw] py-[2vh]">
      <h2 className="mb-[2vh] text-[2vw] font-medium text-black">
        Previous Stays
      </h2>
      <div className="flex flex-col gap-[1vh]">
        {stays.map((stay, index) => (
          <article
            key={`${stay.arrival_date}-${stay.room_number}-${index}`}
            className="rounded-[1vh] border border-black px-[1vw] py-[1vh]"
          >
            <p className="text-[1vw] text-black">
              {formatDate(stay.arrival_date)} - {formatDate(stay.departure_date)}
            </p>
            <p className="text-[1vw] text-black">Room {stay.room_number}</p>
          </article>
        ))}
        {stays.length === 0 && (
          <p className="text-[1vw] text-[#b6bac3]">No previous stays.</p>
        )}
      </div>
    </section>
  );
}
