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
  useGetDepartments,
  useGetRequestById,
  useGetRequestsFeed,
  useGetUsersIdHook,
  useGetViews,
  useUpdateView,
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

const DEFAULT_FILTERS: RequestsWebFilters = {
  sort: "priority",
  priorities: [],
  departments: [],
  floors: [],
};

function toViewFilters(
  filters: RequestsWebFilters,
  user: User | undefined,
): RequestsWebFilters {
  return {
    ...filters,
    userId: user?.id,
    userName: user
      ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
      : undefined,
  };
}

function HomePage() {
  const [filters, setFilters] = useState<RequestsWebFilters>(DEFAULT_FILTERS);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
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
    const viewFilters = view.filters as RequestsWebFilters;
    setFilters(viewFilters);
    if (viewFilters.userId) {
      const [firstName = "", ...rest] = (viewFilters.userName ?? "").split(" ");
      setSelectedUser({
        id: viewFilters.userId,
        first_name: firstName,
        last_name: rest.join(" "),
      } as User);
    } else {
      setSelectedUser(undefined);
    }
    setActiveViewId(view.id);
  }

  function handleFilterChange(
    update: Partial<RequestsWebFilters>,
    user?: User | null,
  ) {
    const newFilters = { ...filters, ...update };
    const newUser = user !== undefined ? (user ?? undefined) : selectedUser;
    setFilters(newFilters);
    if (user !== undefined) setSelectedUser(newUser);
    if (activeViewId)
      updateView({
        id: activeViewId,
        filters: toViewFilters(newFilters, newUser),
      });
  }

  function handleSaveView(name: string) {
    createView({
      slug: REQUESTS_WEB_SLUG,
      display_name: name,
      filters: toViewFilters(filters, selectedUser),
    });
  }

  function handleClearAll() {
    setFilters(DEFAULT_FILTERS);
    setSelectedUser(undefined);
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
    (filters.priorities?.length ?? 0) > 0 ||
    (filters.departments?.length ?? 0) > 0 ||
    (filters.floors?.length ?? 0) > 0 ||
    filters.sort !== "priority";

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
                sort={filters.sort}
                onSortChange={(s) => handleFilterChange({ sort: s })}
                selectedUser={selectedUser}
                onUserChange={(u) => handleFilterChange({}, u ?? null)}
                selectedPriorities={filters.priorities ?? []}
                onPrioritiesChange={(p) =>
                  handleFilterChange({ priorities: p })
                }
                selectedDepartments={filters.departments ?? []}
                onDepartmentsChange={(d) =>
                  handleFilterChange({ departments: d })
                }
                selectedFloors={filters.floors ?? []}
                onFloorsChange={(f) => handleFilterChange({ floors: f })}
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
            {((filters.departments?.length ?? 0) > 0
              ? (departments ?? []).filter((d) =>
                  filters.departments!.includes(d.name),
                )
              : (departments ?? [])
            ).map((dep) => (
              <KanbanColumnData
                key={dep.id}
                title={dep.name}
                department={dep.id}
                sort={filters.sort}
                userId={selectedUser?.id}
                onCardClick={handleCardClick}
                onCreateRequest={handleCreateRequestForDepartment}
                priorities={filters.priorities ?? []}
                floors={filters.floors ?? []}
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
