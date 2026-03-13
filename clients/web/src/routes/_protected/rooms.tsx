import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetRooms } from "@shared";
import { PageShell } from "@/components/ui/PageShell";
import { RoomsHeader } from "@/components/rooms/RoomsHeader";

export const Route = createFileRoute("/_protected/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  const [open, setOpen] = useState(false);
  const [selectedFloors, setSelectedFloors] = useState<Array<number>>([]);

  const { data } = useGetRooms({
    floors: selectedFloors.length > 0 ? selectedFloors : undefined,
  });

  return (
    <PageShell
      header={
        <RoomsHeader
          onOpenDrawer={() => setOpen((o) => !o)}
          selectedFloors={selectedFloors}
          onChangeSelectedFloors={setSelectedFloors}
        />
      }
      drawerOpen={open}
      drawer={
        <div>
          <p>Drawer content</p>
        </div>
      }
    >
      <div>
        <ul>
          {data?.items?.map((room) => (
            <li key={room.room_number}>
              Room {room.room_number} — Floor {room.floor}
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
