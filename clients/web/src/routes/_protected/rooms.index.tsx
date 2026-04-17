import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetRooms } from "@shared/api/rooms";
import type { Request, RequestPriority, RoomWithOptionalGuestBooking } from "@shared";
import type { RoomSortOption } from "@/components/rooms/OrderByDropdown";
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
  const [sortOption, setSortOption] = useState<RoomSortOption>("ascending");
  const [generatedData, setGeneratedData] = useState<{
    name?: string;
    description?: string;
    priority?: RequestPriority;
    room_id?: string;
    guest_id?: string;
    user_id?: string;
  } | null>(null);

  const { data: roomsData } = useGetRooms({
    floors: filters.floors.length > 0 ? filters.floors : undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    attributes: filters.attributes.length > 0 ? filters.attributes : undefined,
    advanced: filters.advanced.length > 0 ? filters.advanced : undefined,
    sort: sortOption,
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
      <div className="flex min-h-0 flex-1 flex-row gap-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <RoomsToolbar
            searchTerm={searchTerm}
            onChangeSearchTerm={setSearchTerm}
            filters={filters}
            onChangeFloors={setFloors}
            onApplyFilters={applyFilters}
            onRemoveStatus={removeStatus}
            onRemoveAttribute={removeAttribute}
            onRemoveAdvanced={removeAdvanced}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
          <RoomsList
            rooms={roomsData?.items ?? []}
            onRoomSelect={(room) => {
              setGeneratedData(null);
              setSelectedRoom(room);
            }}
            selectedRoomNumber={selectedRoom?.room_number ?? null}
          />
        </div>
        <RoomsOverview rooms={roomsData?.items ?? []} />
      </div>
      {generatedData === null && selectedRoom === null && (
        <GlobalTaskInput
          onRequestGenerated={(r: Request) => {
            setSelectedRoom(null);
            setGeneratedData({
              name: r.name,
              description: r.description,
              priority: r.priority,
              room_id: r.room_id,
              guest_id: r.guest_id,
              user_id: r.user_id,
            });
          }}
        />
      )}
    </PageShell>
  );
}
