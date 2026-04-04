import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { usePostRoomsHook } from "@shared/api/generated/endpoints/rooms/rooms";
import { useQuery } from "@tanstack/react-query";
import { MakeRequestPriority } from "@shared";
import type { Request, RoomWithOptionalGuestBooking } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { RoomsToolbar } from "@/components/rooms/RoomsToolbar";
import { RoomsList } from "@/components/rooms/RoomsList";
import { RoomDetailsDrawer } from "@/components/rooms/RoomDetailsDrawer";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
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
  const [generatedData, setGeneratedData] = useState<{
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
  } | null>(null);

  const postRooms = usePostRoomsHook();

  const { data: rooms } = useQuery({
    queryKey: ["rooms", selectedFloors],
    queryFn: () =>
      postRooms({
        floors: selectedFloors.length > 0 ? selectedFloors : undefined,
        limit: 10,
      }),
  });

  const drawerContent =
    generatedData !== null ? (
      <CreateRequestDrawer
        initialData={generatedData}
        onClose={() => setGeneratedData(null)}
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
      drawerOpen={generatedData !== null || selectedRoom !== null}
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
            setGeneratedData(null);
            setSelectedRoom(room);
          }}
          selectedRoomNumber={selectedRoom?.room_number ?? null}
        />
        <RoomsOverview rooms={rooms?.items ?? []} />
      </div>
      <GlobalTaskInput
        onRequestGenerated={(r: Request) => {
          const p = r.priority;
          setSelectedRoom(null);
          setGeneratedData({
            name: r.name,
            description: r.description,
            priority: p && p in MakeRequestPriority ? (p as MakeRequestPriority) : undefined,
          });
        }}
      />
    </PageShell>
  );
}
