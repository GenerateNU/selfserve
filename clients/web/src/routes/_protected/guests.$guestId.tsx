import { ApiError, useGetGuestsStaysId, usePutGuestsId } from "@shared";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GuestNotesCard } from "../../components/guests/GuestNotesCard";
import { GuestPageShell } from "../../components/guests/GuestPageShell";
import { GuestProfileCard } from "../../components/guests/GuestProfileCard";
import { GuestProfilePageSkeleton } from "../../components/guests/GuestProfilePageSkeleton";
import { GuestSpecialNeedsCard } from "../../components/guests/GuestSpecialNeedsCard";
import { HousekeepingPreferencesCard } from "../../components/guests/HousekeepingPreferencesCard";
import { PreviousStaysCard } from "../../components/guests/PreviousStaysCard";

export const Route = createFileRoute("/_protected/guests/$guestId")({
  component: GuestProfilePage,
});

function GuestProfilePage() {
  const { guestId } = Route.useParams();
  const {
    data: guest,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetGuestsStaysId(guestId);
  const updateGuest = usePutGuestsId();

  const handleSaveNotes = async (notes: string) => {
    await updateGuest.mutateAsync({
      id: guestId,
      data: { notes },
    });

    await refetch();
  };

  const detailErrorMessage =
    error instanceof ApiError && error.status !== 404
      ? "Failed to load guest profile."
      : "Guest not found.";

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
          <p className="text-[1vw] text-black">{detailErrorMessage}</p>
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

  const specialNeeds = {
    dietaryRestrictions: guest.assistance?.dietary?.join(", ") ?? "",
    accessibilityNeeds: guest.assistance?.accessibility?.join(", ") ?? "",
    medicalConditions: guest.assistance?.medical?.join(", ") ?? "",
  };
  const housekeeping = {
    frequency: guest.housekeeping_cadence?.trim() || "-",
    doNotDisturb:
      guest.do_not_disturb_start && guest.do_not_disturb_end
        ? `${guest.do_not_disturb_start} - ${guest.do_not_disturb_end}`
        : "-",
  };

  return (
    <GuestPageShell title="Guests / Guest Profile">
      <div className="grid gap-[2vh] xl:grid-cols-[minmax(0,45vw)_minmax(0,32vw)]">
        <div className="flex flex-col gap-[2vh]">
          <GuestProfileCard guest={guest} />
          <GuestNotesCard notes={guest.notes} onSave={handleSaveNotes} />
        </div>
        <div className="flex flex-col gap-[2vh]">
          <GuestSpecialNeedsCard specialNeeds={specialNeeds} />
          <HousekeepingPreferencesCard housekeeping={housekeeping} />
          <PreviousStaysCard stays={guest.past_stays} />
        </div>
      </div>
    </GuestPageShell>
  );
}
