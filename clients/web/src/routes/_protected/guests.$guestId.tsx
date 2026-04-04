import { useGetApiV1GuestsStaysId } from "@shared/api/generated/endpoints/guests/guests";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GuestNotesCard } from "../../components/guests/GuestNotesCard";
import { GuestPageShell } from "../../components/guests/GuestPageShell";
import { GuestProfileCard } from "../../components/guests/GuestProfileCard";
import { GuestProfilePageSkeleton } from "../../components/guests/GuestProfilePageSkeleton";
import { PreviousStaysCard } from "../../components/guests/PreviousStaysCard";

export const Route = createFileRoute("/_protected/guests/$guestId")({
  component: GuestProfilePage,
});

function GuestProfilePage() {
  const { guestId } = Route.useParams();
  const { data: guest, isLoading, isError } = useGetApiV1GuestsStaysId(guestId);

  if (isLoading) {
    return (
      <GuestPageShell title="Guests / Guest Profile">
        <GuestProfilePageSkeleton />
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
            className="mt-[1vh] inline-block text-[1vw] text-primary underline"
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
          <GuestNotesCard initialNotes={guest.notes} />
        </div>
        <div className="flex flex-col gap-[2vh]">
          <PreviousStaysCard stays={guest.past_stays} />
        </div>
      </div>
    </GuestPageShell>
  );
}
