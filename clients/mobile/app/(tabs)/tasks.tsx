import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ActiveFilterChips,
  type ActiveFilterChip,
} from "@/components/tasks/active-filter-chips";
import { TabBar } from "@/components/tasks/tab-bar";
import { TaskCompletionModal } from "@/components/tasks/task-completion-modal";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskFilterSheet } from "@/components/tasks/task-filter-sheet";
import { TaskList } from "@/components/tasks/task-list";
import { TasksHeader } from "@/components/tasks/tasks-header";
import {
  TAB,
  TASK_ASSIGNMENT_STATE,
  TASK_FILTER_DEPARTMENTS,
  TASK_FILTER_PRIORITIES,
  TASK_FILTER_STATUS_MY,
  TASK_FILTER_STATUS_UNASSIGNED,
  type TabName,
} from "@/constants/tasks";
import { useTaskMutations, useTasksFeed } from "@/hooks/use-tasks-feed";
import type { Task, TasksFilterState } from "@/types/tasks";

function filterChips(
  tab: TabName,
  filters: TasksFilterState,
): ActiveFilterChip[] {
  const out: ActiveFilterChip[] = [];
  if (filters.department) {
    const d = TASK_FILTER_DEPARTMENTS.find(
      (x) => x.value === filters.department,
    );
    out.push({
      field: "department",
      label: `Dept: ${d?.label ?? filters.department}`,
    });
  }
  if (filters.priority) {
    const p = TASK_FILTER_PRIORITIES.find((x) => x.value === filters.priority);
    out.push({
      field: "priority",
      label: `Priority: ${p?.label ?? filters.priority}`,
    });
  }
  if (filters.status) {
    const pool =
      tab === TAB.MY_TASKS
        ? TASK_FILTER_STATUS_MY
        : TASK_FILTER_STATUS_UNASSIGNED;
    const s = pool.find((x) => x.value === filters.status);
    out.push({
      field: "status",
      label: `Status: ${s?.label ?? filters.status}`,
    });
  }
  return out;
}

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<TabName>(TAB.MY_TASKS);
  const [filters, setFilters] = useState<TasksFilterState>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Task | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);

  const filterSheetRef = useRef<BottomSheetModal>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);

  const {
    flatTasks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isRefetching,
    error,
    refetch,
  } = useTasksFeed(activeTab, filters);

  const { patchStatus, claimTask, dropTask } = useTaskMutations();
  const mutating =
    patchStatus.isPending || claimTask.isPending || dropTask.isPending;

  const displayed = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return flatTasks;
    return flatTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false),
    );
  }, [flatTasks, searchQuery]);

  const variant =
    activeTab === TAB.MY_TASKS
      ? TASK_ASSIGNMENT_STATE.ASSIGNED
      : TASK_ASSIGNMENT_STATE.UNASSIGNED;

  const chips = useMemo(
    () => filterChips(activeTab, filters),
    [activeTab, filters],
  );

  const openDetail = useCallback((t: Task) => {
    setSelected(t);
    detailSheetRef.current?.present();
  }, []);

  const handleStart = useCallback(
    async (id: string) => {
      await patchStatus.mutateAsync({ id, status: "in progress" });
      detailSheetRef.current?.dismiss();
    },
    [patchStatus],
  );

  const handleComplete = useCallback(
    async (id: string) => {
      await patchStatus.mutateAsync({ id, status: "completed" });
      detailSheetRef.current?.dismiss();
      setCompleteOpen(true);
    },
    [patchStatus],
  );

  const handleClaim = useCallback(
    async (id: string) => {
      await claimTask.mutateAsync(id);
      detailSheetRef.current?.dismiss();
    },
    [claimTask],
  );

  const handleDrop = useCallback(
    async (id: string) => {
      await dropTask.mutateAsync(id);
      detailSheetRef.current?.dismiss();
    },
    [dropTask],
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <TasksHeader
        searchOpen={searchOpen}
        onToggleSearch={() => setSearchOpen((v) => !v)}
        searchQuery={searchQuery}
        onSearchQuery={setSearchQuery}
        onOpenFilters={() => filterSheetRef.current?.present()}
      />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {chips.length > 0 ? (
        <ActiveFilterChips
          filters={chips}
          onRemoveFilter={(field) =>
            setFilters((f) => ({ ...f, [field]: undefined }))
          }
          onClearAll={() => setFilters({})}
        />
      ) : null}
      <View className="flex-1">
        {error ? (
          <Text className="text-red-600 px-5 py-2">
            {(error as Error).message || "Failed to load tasks"}
          </Text>
        ) : null}
        {isPending && !flatTasks.length ? (
          <Text className="text-gray-500 px-5 py-4">Loading…</Text>
        ) : (
          <TaskList
            tasks={displayed}
            variant={variant}
            onOpenDetail={openDetail}
            onStart={handleStart}
            onComplete={handleComplete}
            onClaim={handleClaim}
            isMutating={mutating}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
            }}
            listFooter={isFetchingNextPage}
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
          />
        )}
      </View>

      <TaskFilterSheet
        sheetRef={filterSheetRef}
        activeTab={activeTab}
        applied={filters}
        onApply={setFilters}
      />
      <TaskDetailSheet
        sheetRef={detailSheetRef}
        task={selected}
        variant={variant}
        onStart={handleStart}
        onComplete={handleComplete}
        onClaim={handleClaim}
        onDrop={handleDrop}
        busy={mutating}
      />
      <TaskCompletionModal
        visible={completeOpen}
        onClose={() => setCompleteOpen(false)}
      />
    </SafeAreaView>
  );
}
