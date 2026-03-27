import { useGetApiV1GuestsStaysId } from "@shared/api/generated/endpoints/guests/guests";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GuestNotesCard } from "../../components/guests/GuestNotesCard";
import { GuestPageShell } from "../../components/guests/GuestPageShell";
import { GuestProfileCard } from "../../components/guests/GuestProfileCard";
import { GuestSpecialNeedsCard } from "../../components/guests/GuestSpecialNeedsCard";
import { HousekeepingPreferencesCard } from "../../components/guests/HousekeepingPreferencesCard";
import { PreviousStaysCard } from "../../components/guests/PreviousStaysCard";

export const Route = createFileRoute("/_protected/guests/$guestId")({
  component: GuestProfilePage,
});

const emptySpecialNeeds = {
  dietaryRestrictions: "",
  accessibilityNeeds: "",
  sensorySensitivities: "",
  medicalConditions: "",
};

const emptyHousekeeping = {
  frequency: "",
  doNotDisturb: "",
};

function GuestProfilePage() {
  const { guestId } = Route.useParams();
  const { data: guest, isLoading, isError } = useGetApiV1GuestsStaysId(guestId);

  if (isLoading) {
    return (
      <GuestPageShell title="Guests / Guest Profile">
        <div className="border border-black bg-white px-[1vw] py-[2vh] text-[1vw] text-neutral-600">
          Loading guest profile...
        </div>
      </GuestPageShell>
    );
  }

  if (isError || !guest) {
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
    );
  }

  return (
    <GuestPageShell title="Guests / Guest Profile">
      <div className="grid gap-[2vh] xl:grid-cols-[minmax(0,45vw)_minmax(0,32vw)]">
        <div className="flex flex-col gap-[2vh]">
          <GuestProfileCard guest={guest} />
          <GuestNotesCard initialNotes={guest.notes ?? undefined} />
        </div>
        <div className="flex flex-col gap-[2vh]">
          <GuestSpecialNeedsCard specialNeeds={emptySpecialNeeds} />
          <PreviousStaysCard stays={guest.past_stays ?? []} />
          <HousekeepingPreferencesCard housekeeping={emptyHousekeeping} />
        </div>
      </div>
    </GuestPageShell>
  );
}
