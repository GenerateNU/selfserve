import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { MakeRequestPriority } from "@shared";
import { useGetRequestById, useGetRequestsFeed } from "@shared/api/requests";
import { useGetDepartments } from "@shared/api/departments";
import { useCreateView, useGetViews } from "@shared/api/views";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import type { RequestFeedItem, RequestFeedSort } from "@shared/api/requests";
import type { Request, User } from "@shared";
import type { View } from "@shared/types/views";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { HomeToolbar } from "@/components/home/HomeToolbar";
import { HomeFilterBar } from "@/components/home/HomeFilterBar";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
import { ViewRequestDrawer } from "@/components/requests/ViewRequestDrawer";
import { KanbanColumn } from "@/components/requests/KanbanColumn";
import { RequestCardItem } from "@/components/requests/RequestCardItem";

const REQUESTS_WEB_SLUG = "requests_web";

type RequestsWebFilters = {
  sort?: RequestFeedSort;
  priorities?: Array<string>;
  departments?: Array<string>;
  floors?: Array<number>;
  userId?: string;
  userName?: string;
};

export const Route = createFileRoute("/_protected/home")({
  component: HomePage,
});

function KanbanColumnData({
  department,
  onCardClick,
  sort,
  userId,
  priorities,
  floors,
}: {
  department: string;
  onCardClick: (requestId: string) => void;
  sort: RequestFeedSort | undefined;
  userId?: string;
  priorities?: Array<string>;
  floors?: Array<number>;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetRequestsFeed({
      departments: [department],
      sort,
      userId,
      priorities,
      floors,
    });

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
      {requests.map((request: RequestFeedItem) => (
        <RequestCardItem
          key={request.id}
          request={request}
          onClick={() => onCardClick(request.id)}
        />
      ))}
      <div ref={sentinelRef} className="h-1 shrink-0" />
    </>
  );
}

function HomePage() {
  const [sort, setSort] = useState<RequestFeedSort | undefined>("priority");
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [selectedPriorities, setSelectedPriorities] = useState<Array<string>>(
    [],
  );
  const [selectedDepartments, setSelectedDepartments] = useState<Array<string>>(
    [],
  );
  const [selectedFloors, setSelectedFloors] = useState<Array<number>>([]);
  const [activeViewId, setActiveViewId] = useState<string | undefined>(
    undefined,
  );
  const [viewIsPending, setViewIsPending] = useState(false);

  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();
  const { data: backendUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const { data: departments } = useGetDepartments(backendUser?.hotel_id);
  const { data: views = [] } = useGetViews(REQUESTS_WEB_SLUG);
  const { mutate: createView } = useCreateView(REQUESTS_WEB_SLUG);

  const [drawerData, setDrawerData] = useState<{
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
    room_id?: string;
    guest_id?: string;
    user_id?: string;
  } | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const { data: selectedRequest } = useGetRequestById(selectedRequestId);

  function handleApplyView(view: View) {
    const filters = view.filters as RequestsWebFilters;
    setSort(filters.sort ?? "priority");
    setSelectedPriorities(filters.priorities ?? []);
    setSelectedDepartments(filters.departments ?? []);
    setSelectedFloors(filters.floors ?? []);
    if (filters.userId) {
      const [firstName = "", ...rest] = (filters.userName ?? "").split(" ");
      setSelectedUser({
        id: filters.userId,
        first_name: firstName,
        last_name: rest.join(" "),
      } as User);
    } else {
      setSelectedUser(undefined);
    }
    setActiveViewId(view.id);
    setViewIsPending(false);
  }

  function handleSaveView(name: string) {
    const filters: RequestsWebFilters = {
      sort,
      priorities: selectedPriorities,
      departments: selectedDepartments,
      floors: selectedFloors,
      userId: selectedUser?.id,
      userName: selectedUser
        ? `${selectedUser.first_name ?? ""} ${selectedUser.last_name ?? ""}`.trim()
        : undefined,
    };
    createView({ slug: REQUESTS_WEB_SLUG, display_name: name, filters });
  }

  function handleClearAll() {
    setSort("priority");
    setSelectedUser(undefined);
    setSelectedPriorities([]);
    setSelectedDepartments([]);
    setSelectedFloors([]);
    setActiveViewId(undefined);
    setViewIsPending(false);
  }

  function handleCreateRequest() {
    setSelectedRequestId(null);
    setDrawerData({});
  }

  function handleRequestGenerated(request: Request) {
    const p = request.priority;
    setSelectedRequestId(null);
    setDrawerData({
      name: request.name,
      description: request.description,
      priority:
        p && p in MakeRequestPriority ? (p as MakeRequestPriority) : undefined,
      room_id: request.room_id,
      guest_id: request.guest_id,
      user_id: request.user_id,
    });
  }

  function handleCardClick(requestId: string) {
    setDrawerData(null);
    setSelectedRequestId(requestId);
  }

  const drawer =
    drawerData !== null ? (
      <CreateRequestDrawer
        initialData={drawerData}
        onClose={() => setDrawerData(null)}
      />
    ) : selectedRequestId !== null ? (
      <ViewRequestDrawer
        request={selectedRequest ?? null}
        onClose={() => setSelectedRequestId(null)}
      />
    ) : null;

  const drawerOpen = drawerData !== null || selectedRequestId !== null;

  return (
    <PageShell
      header={{
        title: "Home",
        description: "Overview of all tasks currently at play",
      }}
      headerBorder={false}
      subHeader={
        <>
          <HomeToolbar
            onCreateRequest={handleCreateRequest}
            views={views}
            activeViewId={activeViewId}
            activeViewPending={viewIsPending}
            onSelectView={(view) =>
              view ? handleApplyView(view) : handleClearAll()
            }
          />
          <HomeFilterBar
            sort={sort}
            onSortChange={(s) => { setSort(s); if (activeViewId) setViewIsPending(true); }}
            selectedUser={selectedUser}
            onUserChange={(u) => { setSelectedUser(u); if (activeViewId) setViewIsPending(true); }}
            selectedPriorities={selectedPriorities}
            onPrioritiesChange={(p) => { setSelectedPriorities(p); if (activeViewId) setViewIsPending(true); }}
            selectedDepartments={selectedDepartments}
            onDepartmentsChange={(d) => { setSelectedDepartments(d); if (activeViewId) setViewIsPending(true); }}
            selectedFloors={selectedFloors}
            onFloorsChange={(f) => { setSelectedFloors(f); if (activeViewId) setViewIsPending(true); }}
            hotelId={backendUser?.hotel_id}
            currentUserId={backendUser?.id}
            onClearAll={handleClearAll}
            onSaveView={handleSaveView}
          />
        </>
      }
      drawerOpen={drawerOpen}
      drawer={drawer}
      contentClassName="!px-0 h-full overflow-hidden relative"
    >
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 flex items-stretch gap-6 overflow-x-auto overflow-y-hidden p-6 pb-0">
          {(selectedDepartments.length > 0
            ? (departments ?? []).filter((d) =>
                selectedDepartments.includes(d.name),
              )
            : (departments ?? [])
          ).map((dep) => (
            <KanbanColumn key={dep.id} title={dep.name}>
              <KanbanColumnData
                department={dep.id}
                sort={sort}
                userId={selectedUser?.id}
                onCardClick={handleCardClick}
                priorities={selectedPriorities}
                floors={selectedFloors}
              />
            </KanbanColumn>
          ))}
        </div>
      </div>
      {!drawerOpen && (
        <GlobalTaskInput onRequestGenerated={handleRequestGenerated} />
      )}
    </PageShell>
  );
}
