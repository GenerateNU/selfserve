import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MakeRequestPriority } from "@shared";
import { useGetRooms } from "@shared/api/rooms";
import type { Request, RoomWithOptionalGuestBooking } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { RoomsToolbar } from "@/components/rooms/RoomsToolbar";
import { useRoomsFilters } from "@/hooks/use-rooms-filters";
import { RoomsList } from "@/components/rooms/RoomsList";
import { RoomDetailsDrawer } from "@/components/rooms/RoomDetailsDrawer";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
import { RoomsOverview } from "@/components/rooms/RoomsOverview";

export const Route = createFileRoute("/_protected/rooms/")({
  component: RoomsPage,
});

function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    filters,
    setFloors,
    applyFilters,
    removeStatus,
    removeAttribute,
    removeAdvanced,
  } = useRoomsFilters({
    floors: [],
    status: [],
    attributes: [],
    advanced: [],
  });
  const [selectedRoom, setSelectedRoom] =
    useState<RoomWithOptionalGuestBooking | null>(null);
  const [ascending, setAscending] = useState(true);
  const [generatedData, setGeneratedData] = useState<{
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
    room_id?: string;
    guest_id?: string;
    user_id?: string;
  } | null>(null);

  const { data: rooms } = useGetRooms({
    floors: filters.floors.length > 0 ? filters.floors : undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    attributes: filters.attributes.length > 0 ? filters.attributes : undefined,
    advanced: filters.advanced.length > 0 ? filters.advanced : undefined,
    limit: 200,
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
      bottomBar={
        generatedData === null && selectedRoom === null ? (
          <GlobalTaskInput
            onRequestGenerated={(r: Request) => {
              const p = r.priority;
              setSelectedRoom(null);
              setGeneratedData({
                name: r.name,
                description: r.description,
                priority:
                  p && p in MakeRequestPriority
                    ? (p as MakeRequestPriority)
                    : undefined,
                room_id: r.room_id,
                guest_id: r.guest_id,
                user_id: r.user_id,
              });
            }}
          />
        ) : undefined
      }
    >
      <div className="flex h-full min-h-0 flex-row">
        <div className="flex flex-1 min-h-0 min-w-0 flex-col">
          <RoomsToolbar
            searchTerm={searchTerm}
            onChangeSearchTerm={setSearchTerm}
            filters={filters}
            onChangeFloors={setFloors}
            onApplyFilters={applyFilters}
            onRemoveStatus={removeStatus}
            onRemoveAttribute={removeAttribute}
            onRemoveAdvanced={removeAdvanced}
            ascending={ascending}
            setAscending={setAscending}
          />
          <RoomsList
            rooms={rooms?.items ?? []}
            ascending={ascending}
            onRoomSelect={(room) => {
              setGeneratedData(null);
              setSelectedRoom(room);
            }}
            selectedRoomNumber={selectedRoom?.room_number ?? null}
          />
        </div>
        <RoomsOverview rooms={rooms?.items ?? []} />
      </div>
    </PageShell>
  );
}
