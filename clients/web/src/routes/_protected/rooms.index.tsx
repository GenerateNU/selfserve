import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { usePostRoomsHook } from "@shared/api/generated/endpoints/rooms/rooms";
import { useQuery } from "@tanstack/react-query";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { SortByContainer } from "@/components/rooms/SortByContainer";
import { PageShell } from "@/components/ui/PageShell";
import { RoomsHeader } from "@/components/rooms/RoomsHeader";
import { RoomsList } from "@/components/rooms/RoomsList";
import { RoomDetailsDrawer } from "@/components/rooms/RoomDetailsDrawer";

export const Route = createFileRoute("/_protected/rooms/")({
  component: RoomsPage,
});

function RoomsPage() {
  const [selectedFloors, setSelectedFloors] = useState<Array<number>>([]);
  const [selectedRoom, setSelectedRoom] =
    useState<RoomWithOptionalGuestBooking | null>(null);
  const [ascending, setAscending] = useState(true);

  const postRooms = usePostRoomsHook();

  const { data: rooms } = useQuery({
    queryKey: ["rooms", selectedFloors],
    queryFn: () =>
      postRooms({
        floors: selectedFloors.length > 0 ? selectedFloors : undefined,
        limit: 10,
      }),
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
      <SortByContainer ascending={ascending} setAscending={setAscending} />

      <RoomsList
        rooms={rooms?.items ?? []}
        ascending={ascending}
        onRoomSelect={setSelectedRoom}
        selectedRoomNumber={selectedRoom?.room_number ?? null}
      />
      <GlobalTaskInput />
    </PageShell>
  );
}
