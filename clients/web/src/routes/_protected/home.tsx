import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useUpdateRequestDepartment } from "@shared/api/requests";
import {
  MakeRequestPriority,
  useCreateView,
  useDeleteView,
  useUpdateView,
  useGetDepartments,
  useGetRequestById,
  useGetRequestsFeed,
  useGetUsersIdHook,
  useGetViews,
} from "@shared";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type {
  Request,
  RequestFeedItem,
  RequestFeedSort,
  User,
  View,
} from "@shared";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { HomeToolbar } from "@/components/home/HomeToolbar";
import { HomeFilterBar } from "@/components/home/HomeFilterBar";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
import { KanbanColumn } from "@/components/requests/KanbanColumn";
import {
  RequestCardItem,
  formatRequestTime,
} from "@/components/requests/RequestCardItem";
import { RequestCard } from "@/components/requests/RequestCard";
import { RequestCardTimestamp } from "@/components/requests/RequestCardTimestamp";
import { DeleteViewModal } from "@/components/home/DeleteViewModal";

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
  title,
  department,
  onCardClick,
  onCreateRequest,
  sort,
  userId,
  priorities,
  floors,
  search,
}: {
  title: string;
  department: string;
  onCardClick: (requestId: string) => void;
  onCreateRequest: (departmentId: string) => void;
  sort: RequestFeedSort | undefined;
  userId?: string;
  priorities?: Array<string>;
  floors?: Array<number>;
  search?: string;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useGetRequestsFeed({
      departments: [department],
      sort,
      userId,
      priorities,
      floors,
      search,
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

  if (!isPending && requests.length === 0) return null;

  return (
    <KanbanColumn
      title={title}
      droppableId={department}
      onCreateRequest={() => onCreateRequest(department)}
    >
      {requests.map((request: RequestFeedItem) => (
        <RequestCardItem
          key={request.id}
          request={request}
          onClick={() => onCardClick(request.id)}
        />
      ))}
      <div ref={sentinelRef} className="h-1 shrink-0" />
    </KanbanColumn>
  );
}

function DragOverlayCard({ request }: { request: RequestFeedItem }) {
  return (
    <RequestCard
      status={request.status}
      className="w-[22rem] shadow-xl rotate-1 opacity-95"
    >
      <RequestCardTimestamp
        status={request.status}
        time={formatRequestTime(request.created_at)}
      />
      <div className="mt-3">
        <span className="text-base font-medium leading-snug text-text-default line-clamp-2">
          {request.name}
        </span>
      </div>
    </RequestCard>
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<RequestFeedItem | null>(
    null,
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchValue]);

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
  const { mutate: updateView } = useUpdateView(REQUESTS_WEB_SLUG);
  const { mutate: deleteView, isPending: isDeletingView } =
    useDeleteView(REQUESTS_WEB_SLUG);
  const [viewToDelete, setViewToDelete] = useState<View | null>(null);
  const { mutate: updateRequestDepartment } = useUpdateRequestDepartment();

  const [drawerData, setDrawerData] = useState<{
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
    room_id?: string;
    guest_id?: string;
    user_id?: string;
    department_id?: string;
  } | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const { data: selectedRequest } = useGetRequestById(selectedRequestId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDragItem(event.active.data.current?.request ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over) return;

    const request = active.data.current?.request as RequestFeedItem | undefined;
    const targetDeptId = over.id as string;

    if (!request || request.department_id === targetDeptId) return;

    const targetDept = (departments ?? []).find((d) => d.id === targetDeptId);
    if (!targetDept) return;

    updateRequestDepartment({
      requestId: request.id,
      departmentId: targetDeptId,
      sourceDepartmentId: request.department_id ?? "",
      updatedItem: {
        ...request,
        department_id: targetDeptId,
        department_name: targetDept.name,
      },
    });
  }

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
  }

  function buildFilters(
    overrideSort?: RequestFeedSort,
    overrideUser?: User | null,
    overridePriorities?: Array<string>,
    overrideDepartments?: Array<string>,
    overrideFloors?: Array<number>,
  ): RequestsWebFilters {
    const resolvedSort = overrideSort !== undefined ? overrideSort : sort;
    const resolvedUser = overrideUser !== undefined ? overrideUser ?? undefined : selectedUser;
    const resolvedPriorities = overridePriorities ?? selectedPriorities;
    const resolvedDepartments = overrideDepartments ?? selectedDepartments;
    const resolvedFloors = overrideFloors ?? selectedFloors;
    return {
      sort: resolvedSort,
      priorities: resolvedPriorities,
      departments: resolvedDepartments,
      floors: resolvedFloors,
      userId: resolvedUser?.id,
      userName: resolvedUser ? `${resolvedUser.first_name ?? ""} ${resolvedUser.last_name ?? ""}`.trim() : undefined,
    };
  }

  function autoSaveView(filters: RequestsWebFilters) {
    if (!activeViewId) return;
    updateView({ id: activeViewId, filters });
  }

  function handleSaveView(name: string) {
    createView({ slug: REQUESTS_WEB_SLUG, display_name: name, filters: buildFilters() });
  }

  function handleClearAll() {
    setSort("priority");
    setSelectedUser(undefined);
    setSelectedPriorities([]);
    setSelectedDepartments([]);
    setSelectedFloors([]);
    setActiveViewId(undefined);
  }

  function handleCreateRequest() {
    setSelectedRequestId(null);
    setDrawerData({});
  }

  function handleCreateRequestForDepartment(departmentId: string) {
    setSelectedRequestId(null);
    setDrawerData({ department_id: departmentId });
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
        key="create"
        initialData={drawerData}
        onClose={() => setDrawerData(null)}
      />
    ) : selectedRequestId !== null ? (
      selectedRequest ? (
        <CreateRequestDrawer
          key={selectedRequestId}
          existingRequest={selectedRequest}
          onClose={() => setSelectedRequestId(null)}
        />
      ) : (
        <div className="flex h-full w-full flex-col gap-4 p-10 pt-14">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-7 animate-pulse rounded-md bg-bg-disabled"
            />
          ))}
        </div>
      )
    ) : null;

  const drawerOpen = drawerData !== null || selectedRequestId !== null;
  const filtersActive =
    !!selectedUser ||
    selectedPriorities.length > 0 ||
    selectedDepartments.length > 0 ||
    selectedFloors.length > 0 ||
    sort !== "priority";

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
            filtersOpen={filtersOpen}
            filtersActive={filtersActive}
            onToggleFilters={() => setFiltersOpen((o) => !o)}
            onSelectView={(view) =>
              view ? handleApplyView(view) : handleClearAll()
            }
            onDeleteView={(view) => setViewToDelete(view)}
            searchOpen={searchOpen}
            searchValue={searchValue}
            onSearchOpenChange={setSearchOpen}
            onSearchChange={setSearchValue}
          />
          <div
            className={`grid transition-all duration-200 ease-out ${filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="overflow-hidden">
              <HomeFilterBar
                sort={sort}
                onSortChange={(s) => {
                  setSort(s);
                  autoSaveView(buildFilters(s));
                }}
                selectedUser={selectedUser}
                onUserChange={(u) => {
                  setSelectedUser(u);
                  autoSaveView(buildFilters(undefined, u ?? null));
                }}
                selectedPriorities={selectedPriorities}
                onPrioritiesChange={(p) => {
                  setSelectedPriorities(p);
                  autoSaveView(buildFilters(undefined, undefined, p));
                }}
                selectedDepartments={selectedDepartments}
                onDepartmentsChange={(d) => {
                  setSelectedDepartments(d);
                  autoSaveView(buildFilters(undefined, undefined, undefined, d));
                }}
                selectedFloors={selectedFloors}
                onFloorsChange={(f) => {
                  setSelectedFloors(f);
                  autoSaveView(buildFilters(undefined, undefined, undefined, undefined, f));
                }}
                hotelId={backendUser?.hotel_id}
                currentUserId={backendUser?.id}
                onClearAll={handleClearAll}
                onSaveView={handleSaveView}
              />
            </div>
          </div>
        </>
      }
      drawerOpen={drawerOpen}
      drawer={drawer}
      contentClassName="!px-0 h-full overflow-hidden relative"
      bottomBar={
        !drawerOpen ? (
          <GlobalTaskInput onRequestGenerated={handleRequestGenerated} />
        ) : undefined
      }
    >
      <div className="relative flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="absolute inset-0 flex items-stretch gap-6 overflow-x-auto overflow-y-hidden p-6 pb-0">
            {(selectedDepartments.length > 0
              ? (departments ?? []).filter((d) =>
                  selectedDepartments.includes(d.name),
                )
              : (departments ?? [])
            ).map((dep) => (
              <KanbanColumnData
                key={dep.id}
                title={dep.name}
                department={dep.id}
                sort={sort}
                userId={selectedUser?.id}
                onCardClick={handleCardClick}
                onCreateRequest={handleCreateRequestForDepartment}
                priorities={selectedPriorities}
                floors={selectedFloors}
                search={debouncedSearch}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeDragItem && <DragOverlayCard request={activeDragItem} />}
          </DragOverlay>
        </DndContext>
      </div>
      <DeleteViewModal
        view={viewToDelete}
        isPending={isDeletingView}
        onConfirm={() =>
          deleteView(viewToDelete!.id, {
            onSuccess: () => {
              if (activeViewId === viewToDelete!.id) handleClearAll();
              setViewToDelete(null);
            },
          })
        }
        onCancel={() => setViewToDelete(null)}
      />
    </PageShell>
  );
}
