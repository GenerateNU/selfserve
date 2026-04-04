import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users";
import { MakeRequestPriority } from "@shared";
import type { Request } from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { HomeToolbar } from "@/components/home/HomeToolbar";
import { HomeFilterBar } from "@/components/home/HomeFilterBar";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
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
}: {
  hotelId: string;
  status: string;
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
        <RequestCardItem key={request.id} request={request} />
      ))}
      <div ref={sentinelRef} className="h-1 shrink-0" />
    </>
  );
}

function HomePage() {
  const [drawerData, setDrawerData] = useState<{
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
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
    });
  }

  const drawer =
    drawerData !== null ? (
      <CreateRequestDrawer
        initialData={drawerData}
        onClose={() => setDrawerData(null)}
      />
    ) : null;

  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();

  const { data: backendUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const hotelId = backendUser?.hotel_id;

  return (
    <PageShell
      header={{
        title: "Home",
        description: "Overview of all tasks currently at play",
      }}
      drawerOpen={drawerData !== null}
      drawer={drawer}
      contentClassName="!px-0 h-full overflow-hidden relative"
    >
      <HomeToolbar className="mt-2" onCreateRequest={handleCreateRequest} />
      <HomeFilterBar />
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 flex items-stretch gap-6 overflow-x-auto overflow-y-hidden p-6 pb-0">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn key={col.status} title={col.title}>
              {hotelId && (
                <KanbanColumnData hotelId={hotelId} status={col.status} />
              )}
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
