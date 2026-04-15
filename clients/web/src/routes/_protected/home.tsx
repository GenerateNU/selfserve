import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MakeRequestPriority, getConfig } from "@shared";
import type { Request } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { HomeToolbar } from "@/components/home/HomeToolbar";
import { HomeFilterBar } from "@/components/home/HomeFilterBar";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
import { ViewRequestDrawer } from "@/components/requests/ViewRequestDrawer";
import { KanbanColumn } from "@/components/requests/KanbanColumn";
import { RequestCardItem } from "@/components/requests/RequestCardItem";
import { useKanbanRequests } from "@/hooks/use-kanban-requests";

export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

const KANBAN_COLUMNS = [
  { title: "Pending", status: "pending" },
  { title: "Assigned", status: "assigned" },
  { title: "Completed", status: "completed" },
] as const;

function KanbanColumnData({
  hotelId,
  status,
  onCardClick,
}: {
  hotelId: string;
  status: string;
  onCardClick: (request: Request) => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useKanbanRequests(hotelId, status);

  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingRef = useRef(isFetchingNextPage);
  hasNextPageRef.current = hasNextPage;
  isFetchingRef.current = isFetchingNextPage;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingRef.current
        ) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage]);

  const requests = (data?.pages ?? []).flatMap((page) => page.requests);

  return (
    <>
      {requests.map((request: Request) => (
        <RequestCardItem key={request.id} request={request} onClick={() => onCardClick(request)} />
      ))}
      <div ref={sentinelRef} className="h-1 shrink-0" />
    </>
  );
}

type DrawerState =
  | { mode: "create"; data: { name?: string; description?: string; priority?: MakeRequestPriority; room_id?: string } }
  | { mode: "view"; request: Request }
  | null;

function HomePage() {
  const [drawer, setDrawer] = useState<DrawerState>(null);

  function handleCreateRequest() {
    setDrawer({ mode: "create", data: {} });
  }

  function handleRequestGenerated(request: Request) {
    const p = request.priority;
    setDrawer({
      mode: "create",
      data: {
        name: request.name,
        description: request.description,
        priority:
          p && p in MakeRequestPriority ? (p as MakeRequestPriority) : undefined,
        room_id: request.room_id,
      },
    });
  }

  function handleCardClick(request: Request) {
    setDrawer({ mode: "view", request });
  }

  const drawerNode =
    drawer?.mode === "create" ? (
      <CreateRequestDrawer
        initialData={drawer.data}
        onClose={() => setDrawer(null)}
      />
    ) : drawer?.mode === "view" ? (
      <ViewRequestDrawer
        request={drawer.request}
        onClose={() => setDrawer(null)}
      />
    ) : null;

  const hotelId = getConfig().hotelId;

  return (
    <PageShell
      header={{
        title: "Home",
        description: "Overview of all tasks currently at play",
      }}
      drawerOpen={drawer !== null}
      drawer={drawerNode}
      contentClassName="!px-0 h-full overflow-hidden relative"
    >
      <HomeToolbar className="mt-2" onCreateRequest={handleCreateRequest} />
      <HomeFilterBar />
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 flex items-stretch gap-6 overflow-x-auto overflow-y-hidden p-6 pb-0">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn key={col.status} title={col.title}>
              {hotelId && (
                <KanbanColumnData
                  hotelId={hotelId}
                  status={col.status}
                  onCardClick={handleCardClick}
                />
              )}
            </KanbanColumn>
          ))}
        </div>
      </div>
      {drawer === null && (
        <GlobalTaskInput onRequestGenerated={handleRequestGenerated} />
      )}
    </PageShell>
  );
}
