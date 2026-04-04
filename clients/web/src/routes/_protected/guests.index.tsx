import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GuestQuickListTable } from "../../components/guests/GuestQuickListTable";
import { GuestSearchBar } from "../../components/guests/GuestSearchBar";
import { guestListItems } from "../../components/guests/guest-mocks";
import { MakeRequestPriority } from "@shared";
import type { Request } from "@shared";
import { PageShell } from "@/components/ui/PageShell";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";

export const Route = createFileRoute("/_protected/guests/")({
  component: GuestsQuickListPage,
});

function GuestsQuickListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [generatedData, setGeneratedData] = useState<{
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
  } | null>(null);

  const filteredGuests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return guestListItems.filter((guest) => {
      const matchesSearch =
        query.length === 0 ||
        guest.governmentName.toLowerCase().includes(query) ||
        guest.preferredName.toLowerCase().includes(query) ||
        guest.room.toLowerCase().includes(query);

      const matchesGroup =
        groupFilter === "all" ||
        (groupFilter === "1-2" && guest.groupSize <= 2) ||
        (groupFilter === "3-4" &&
          guest.groupSize >= 3 &&
          guest.groupSize <= 4) ||
        (groupFilter === "5+" && guest.groupSize >= 5);

      const matchesFloor =
        floorFilter === "all" || guest.floor === Number(floorFilter);

      return matchesSearch && matchesGroup && matchesFloor;
    });
  }, [floorFilter, groupFilter, searchTerm]);

  return (
    <PageShell
      header={{
        title: "Guests",
        description: "Description blah blah fries -> bag",
      }}
      drawerOpen={generatedData !== null}
      drawer={
        generatedData !== null ? (
          <CreateRequestDrawer
            initialData={generatedData}
            onClose={() => setGeneratedData(null)}
          />
        ) : null
      }
    >
      <GuestSearchBar value={searchTerm} onChange={setSearchTerm} />
      <GuestQuickListTable
        guests={filteredGuests}
        groupFilter={groupFilter}
        floorFilter={floorFilter}
        onGroupFilterChange={setGroupFilter}
        onFloorFilterChange={setFloorFilter}
        onGuestClick={(guestId) =>
          navigate({ to: "/guests/$guestId", params: { guestId } })
        }
      />
      {generatedData === null && (
        <GlobalTaskInput
          onRequestGenerated={(r: Request) => {
            const p = r.priority;
            setGeneratedData({
              name: r.name,
              description: r.description,
              priority: p && p in MakeRequestPriority ? (p as MakeRequestPriority) : undefined,
            });
          }}
        />
      )}
    </PageShell>
  );
}
