import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetRooms } from "@shared";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { PageShell } from "@/components/ui/PageShell";
import { RoomsHeader } from "@/components/rooms/RoomsHeader";
import { RoomsList } from "@/components/rooms/RoomsList";
import { RoomDetailsDrawer } from "@/components/rooms/RoomDetailsDrawer";

export const Route = createFileRoute("/_protected/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  const [selectedFloors, setSelectedFloors] = useState<Array<number>>([]);
  const [selectedRoom, setSelectedRoom] =
    useState<RoomWithOptionalGuestBooking | null>(null);

  const { data } = useGetRooms({
    floors: selectedFloors.length > 0 ? selectedFloors : undefined,
  });

  return (
    <PageShell
      header={
        <RoomsHeader
          selectedFloors={selectedFloors}
          onChangeSelectedFloors={setSelectedFloors}
        />
      }
      drawerOpen={selectedRoom !== null}
      drawer={
        <RoomDetailsDrawer
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      }
    >
      <RoomsList
        rooms={data?.items ?? []}
        onRoomSelect={setSelectedRoom}
        selectedRoomNumber={selectedRoom?.room_number ?? null}
      />
    </PageShell>
  );
}
