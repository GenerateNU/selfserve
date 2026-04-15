import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MakeRequestPriority } from "@shared";
import type { Request } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { HomeToolbar } from "@/components/home/HomeToolbar";
import { HomeFilterBar } from "@/components/home/HomeFilterBar";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
import { KanbanColumn } from "@/components/requests/KanbanColumn";
import { RequestCardItem } from "@/components/requests/RequestCardItem";
import { useGetRequestsFeed, type RequestFeedSort } from "@shared/api/requests";

export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

const KANBAN_COLUMNS = [
  { title: "Pending", status: "pending" },
  { title: "Assigned", status: "assigned" },
  { title: "Completed", status: "completed" },
] as const;

function KanbanColumnData({
  status,
  sort,
}: {
  status: string;
  sort: RequestFeedSort | undefined;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetRequestsFeed({ status, sort });

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

  const requests = (data?.pages ?? []).flatMap((page) => page.items ?? []);

  return (
    <>
      {requests.map((request) => (
        <RequestCardItem key={request.id} request={request} />
      ))}
      <div ref={sentinelRef} className="h-1 shrink-0" />
    </>
  );
}

function HomePage() {
  const [sort, setSort] = useState<RequestFeedSort | undefined>("priority");

  const [drawerData, setDrawerData] = useState<{
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
    room_id?: string;
  } | null>(null);

  function handleCreateRequest() {
    setDrawerData({});
  }

  function handleRequestGenerated(request: Request) {
    const p = request.priority;
    setDrawerData({
      name: request.name,
      description: request.description,
      priority:
        p && p in MakeRequestPriority ? (p as MakeRequestPriority) : undefined,
      room_id: request.room_id,
    });
  }

  const drawer =
    drawerData !== null ? (
      <CreateRequestDrawer
        initialData={drawerData}
        onClose={() => setDrawerData(null)}
      />
    ) : null;

  return (
    <PageShell
      header={{
        title: "Home",
        description: "Overview of all tasks currently at play",
      }}
      headerBorder={false}
      drawerOpen={drawerData !== null}
      drawer={drawer}
      contentClassName="!px-0 h-full overflow-hidden relative"
    >
      <HomeToolbar className="mt-2" onCreateRequest={handleCreateRequest} />
      <HomeFilterBar sort={sort} onSortChange={setSort} />
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 flex items-stretch gap-6 overflow-x-auto overflow-y-hidden p-6 pb-0">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn key={col.status} title={col.title}>
              <KanbanColumnData status={col.status} sort={sort} />
            </KanbanColumn>
          ))}
        </div>
      </div>
      {drawerData === null && (
        <GlobalTaskInput onRequestGenerated={handleRequestGenerated} />
      )}
    </PageShell>
  );
}
