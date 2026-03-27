import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { Request } from "@shared";
import { PageShell } from "@/components/ui/PageShell";
import { GuestQuickListTable } from "../../components/guests/GuestQuickListTable";
import { GuestSearchBar } from "../../components/guests/GuestSearchBar";
import { guestListItems } from "../../components/guests/guest-mocks";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { GeneratedRequestDrawer } from "@/components/requests/GeneratedRequestDrawer";

export const Route = createFileRoute("/_protected/guests/")({
  component: GuestsQuickListPage,
});

function GuestsQuickListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [generatedRequest, setGeneratedRequest] = useState<Request | null>(null);

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
      header={
        <div className="px-6 py-5 border-b border-stroke-subtle">
          <h1 className="text-2xl font-semibold text-text-default">Guests</h1>
        </div>
      }
      drawerOpen={generatedRequest !== null}
      drawer={
        <GeneratedRequestDrawer
          request={generatedRequest}
          onClose={() => setGeneratedRequest(null)}
        />
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
      {generatedRequest === null && <GlobalTaskInput onRequestGenerated={setGeneratedRequest} />}
    </PageShell>
  );
}
