import { Link, createFileRoute } from '@tanstack/react-router'
import { GuestNotesCard } from '../../components/guests/GuestNotesCard'
import { GuestPageShell } from '../../components/guests/GuestPageShell'
import { GuestProfileCard } from '../../components/guests/GuestProfileCard'
import { GuestSpecialNeedsCard } from '../../components/guests/GuestSpecialNeedsCard'
import { HousekeepingPreferencesCard } from '../../components/guests/HousekeepingPreferencesCard'
import { PreviousStaysCard } from '../../components/guests/PreviousStaysCard'
import { guestProfilesById } from '../../components/guests/guest-mocks'

export const Route = createFileRoute('/_protected/guests/$guestId')({
  component: GuestProfilePage,
})

function GuestProfilePage() {
  const { guestId } = Route.useParams()
  const guestProfile = guestProfilesById[guestId]

  if (!guestProfile) {
    return (
      <GuestPageShell title="Guests / Guest Profile">
        <section className="border border-black bg-white px-[1vw] py-[2vh]">
          <p className="text-[1vw] text-black">Guest not found.</p>
          <Link
            to="/guests"
            className="mt-[1vh] inline-block text-[1vw] text-[#004fc5] underline"
          >
            Return to guest list
          </Link>
        </section>
      </GuestPageShell>
    )
  }

  return (
    <GuestPageShell title="Guests / Guest Profile">
      <div className="grid gap-[2vh] xl:grid-cols-[minmax(0,45vw)_minmax(0,32vw)]">
        <div className="flex flex-col gap-[2vh]">
          <GuestProfileCard guest={guestProfile} />
          <GuestNotesCard initialNotes={guestProfile.notes} />
        </div>
        <div className="flex flex-col gap-[2vh]">
          <GuestSpecialNeedsCard specialNeeds={guestProfile.specialNeeds} />
          <PreviousStaysCard stays={guestProfile.previousStays} />
          <HousekeepingPreferencesCard
            housekeeping={guestProfile.housekeeping}
          />
        </div>
      </div>
    </GuestPageShell>
  )
}
