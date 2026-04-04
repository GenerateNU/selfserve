import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { usePostRoomsHook } from "@shared/api/generated/endpoints/rooms/rooms";
import { useQuery } from "@tanstack/react-query";
import type { Request, RoomWithOptionalGuestBooking } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { RoomsToolbar } from "@/components/rooms/RoomsToolbar";
import { RoomsList } from "@/components/rooms/RoomsList";
import { RoomDetailsDrawer } from "@/components/rooms/RoomDetailsDrawer";
import { GeneratedRequestDrawer } from "@/components/requests/GeneratedRequestDrawer";
import { RoomsOverview } from "@/components/rooms/RoomsOverview";

export const Route = createFileRoute("/_protected/rooms/")({
  component: RoomsPage,
});

function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFloors, setSelectedFloors] = useState<Array<number>>([]);
  const [selectedRoom, setSelectedRoom] =
    useState<RoomWithOptionalGuestBooking | null>(null);
  const [ascending, setAscending] = useState(true);
  const [generatedRequest, setGeneratedRequest] = useState<Request | null>(
    null,
  );

  const postRooms = usePostRoomsHook();

  const { data: rooms } = useQuery({
    queryKey: ["rooms", selectedFloors],
    queryFn: () =>
      postRooms({
        floors: selectedFloors.length > 0 ? selectedFloors : undefined,
        limit: 10,
      }),
  });

  const drawerContent = generatedRequest ? (
    <GeneratedRequestDrawer
      request={generatedRequest}
      onClose={() => setGeneratedRequest(null)}
    />
  ) : (
    <RoomDetailsDrawer
      room={selectedRoom}
      onClose={() => setSelectedRoom(null)}
    />
  );

  return (
    <PageShell
      header={{
        title: "Rooms",
        description:
          "Find any room and access essential details like availability, occupancy, and status at a glance.",
      }}
      drawerOpen={generatedRequest !== null || selectedRoom !== null}
      drawer={drawerContent}
      bodyClassName="overflow-hidden"
      contentClassName={"h-full"}
    >
      <RoomsToolbar
        searchTerm={searchTerm}
        onChangeSearchTerm={setSearchTerm}
        selectedFloors={selectedFloors}
        onChangeSelectedFloors={setSelectedFloors}
        ascending={ascending}
        setAscending={setAscending}
      />
      <div className="flex min-h-0 flex-row">
        <RoomsList
          rooms={rooms?.items ?? []}
          ascending={ascending}
          onRoomSelect={(room) => {
            setGeneratedRequest(null);
            setSelectedRoom(room);
          }}
          selectedRoomNumber={selectedRoom?.room_number ?? null}
        />
        <RoomsOverview rooms={rooms?.items ?? []} />
      </div>
      <GlobalTaskInput
        onRequestGenerated={(r) => {
          setSelectedRoom(null);
          setGeneratedRequest(r);
        }}
      />
    </PageShell>
  );
}
