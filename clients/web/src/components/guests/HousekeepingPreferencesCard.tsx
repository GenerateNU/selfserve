import type { GuestProfile } from './guest-mocks'

type HousekeepingPreferencesCardProps = {
  housekeeping: GuestProfile['housekeeping']
}

function PreferenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[42%_1fr] py-[1vh] text-[1vw]">
      <p className="text-[#b6bac3]">{label}</p>
      <p className="text-black">{value}</p>
    </div>
  )
}

export function HousekeepingPreferencesCard({
  housekeeping,
}: HousekeepingPreferencesCardProps) {
  return (
    <section className="border border-black bg-white px-[1vw] py-[2vh]">
      <h2 className="mb-[1vh] text-[2vw] font-medium text-black">
        Housekeeping Preferences
      </h2>
      <PreferenceRow label="Frequency" value={housekeeping.frequency} />
      <PreferenceRow label="Do Not Disturb" value={housekeeping.doNotDisturb} />
    </section>
  )
}
