import type { PreviousStay } from './guest-mocks'

type PreviousStaysCardProps = {
  stays: Array<PreviousStay>
}

export function PreviousStaysCard({ stays }: PreviousStaysCardProps) {
  return (
    <section className="border border-black bg-white px-[1vw] py-[2vh]">
      <h2 className="mb-[2vh] text-[2vw] font-medium text-black">
        Previous Stays
      </h2>
      <div className="flex flex-col gap-[1vh]">
        {stays.map((stay) => (
          <article
            key={stay.id}
            className="rounded-[1vh] border border-black px-[1vw] py-[1vh]"
          >
            <p className="text-[1vw] text-black">
              {stay.startDate} - {stay.endDate}
            </p>
            <p className="text-[1vw] text-black">
              {stay.room} | Group size: {stay.groupSize}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
