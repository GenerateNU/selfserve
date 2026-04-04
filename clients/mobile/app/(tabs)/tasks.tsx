import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActiveFilterChips, type TaskFilterChip } from "@/components/tasks/active-filter-chips";
import { TabBar } from "@/components/tasks/tab-bar";
import { TaskCompletionModal } from "@/components/tasks/task-completion-modal";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskFilterSheet } from "@/components/tasks/task-filter-sheet";
import { TaskList } from "@/components/tasks/task-list";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { SearchBar } from "@/components/ui/search-bar";
import {
  TAB,
  type TabName,
  TASK_ASSIGNMENT_STATE,
  TASK_FILTER_DEPARTMENTS,
  TASK_FILTER_PRIORITIES,
  TASK_FILTER_STATUS_MY,
  TASK_FILTER_STATUS_UNASSIGNED,
  type TaskViewMode,
} from "@/constants/tasks";
import { useTasksFeed } from "@/hooks/use-tasks-feed";
import { useAPIClient } from "@shared/api/client";
import { API_ENDPOINTS } from "@shared/api/endpoints";
import { ApiError } from "@shared";
import type { Task, TasksFilterState } from "@/types/tasks";

const tabConfigs: Record<
  TabName,
  { variant: (typeof TASK_ASSIGNMENT_STATE)[keyof typeof TASK_ASSIGNMENT_STATE] }
> = {
  [TAB.MY_TASKS]: { variant: TASK_ASSIGNMENT_STATE.ASSIGNED },
  [TAB.UNASSIGNED]: { variant: TASK_ASSIGNMENT_STATE.UNASSIGNED },
};

function labelForDepartment(value: string) {
  return TASK_FILTER_DEPARTMENTS.find((d) => d.value === value)?.label ?? value;
}

function labelForPriority(value: string) {
  return TASK_FILTER_PRIORITIES.find((p) => p.value === value)?.label ?? value;
}

function labelForStatus(value: string, tab: TabName) {
  const list =
    tab === TAB.MY_TASKS ? TASK_FILTER_STATUS_MY : TASK_FILTER_STATUS_UNASSIGNED;
  return list.find((s) => s.value === value)?.label ?? value;
}

function buildChips(filters: TasksFilterState, tab: TabName): TaskFilterChip[] {
  const chips: TaskFilterChip[] = [];
  if (filters.department) {
    chips.push({
      id: `department:${filters.department}`,
      label: `Department: ${labelForDepartment(filters.department)}`,
    });
  }
  if (filters.priority) {
    chips.push({
      id: `priority:${filters.priority}`,
      label: `Priority: ${labelForPriority(filters.priority)}`,
    });
  }
  if (filters.status) {
    chips.push({
      id: `status:${filters.status}`,
      label: `Status: ${labelForStatus(filters.status, tab)}`,
    });
  }
  return chips;
}

function removeChipId(filters: TasksFilterState, chipId: string): TasksFilterState {
  const next = { ...filters };
  if (chipId.startsWith("department:")) next.department = undefined;
  if (chipId.startsWith("priority:")) next.priority = undefined;
  if (chipId.startsWith("status:")) next.status = undefined;
  return next;
}

export default function TasksScreen() {
  const api = useAPIClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  const filterSheetRef = useRef<BottomSheetModal>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);

  const [activeTab, setActiveTab] = useState<TabName>(TAB.MY_TASKS);

  const [myTasksFilters, setMyTasksFilters] = useState<TasksFilterState>({});
  const [unassignedFilters, setUnassignedFilters] = useState<TasksFilterState>({});
  const [myViewMode, setMyViewMode] = useState<TaskViewMode>("default");
  const [unassignedViewMode, setUnassignedViewMode] =
    useState<TaskViewMode>("default");

  const [sheetDraft, setSheetDraft] = useState<TasksFilterState>({});

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [completionOpen, setCompletionOpen] = useState(false);
  const [completedTitle, setCompletedTitle] = useState("");
  const [managerNote, setManagerNote] = useState("");

  const activeFilters =
    activeTab === TAB.MY_TASKS ? myTasksFilters : unassignedFilters;
  const setActiveFilters =
    activeTab === TAB.MY_TASKS ? setMyTasksFilters : setUnassignedFilters;

  const activeViewMode =
    activeTab === TAB.MY_TASKS ? myViewMode : unassignedViewMode;
  const setActiveViewMode =
    activeTab === TAB.MY_TASKS ? setMyViewMode : setUnassignedViewMode;

  const {
    data,
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasksFeed(activeTab, activeFilters);

  const tasks = data?.pages.flatMap((page) => page.items) ?? [];

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => {
      const blob = [
        t.title,
        t.description ?? "",
        t.department,
        t.location,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [tasks, searchQuery]);

  const chips = useMemo(
    () => buildChips(activeFilters, activeTab),
    [activeFilters, activeTab],
  );

  const patchStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch<unknown>(API_ENDPOINTS.task(id), { status });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks-feed"] });
    },
  });

  const claimTask = useMutation({
    mutationFn: async (id: string) => {
      await api.post<unknown>(API_ENDPOINTS.taskClaim(id), {});
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks-feed"] });
      detailSheetRef.current?.dismiss();
    },
  });

  const dropTask = useMutation({
    mutationFn: async (id: string) => {
      await api.post<unknown>(API_ENDPOINTS.taskDrop(id), {});
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks-feed"] });
      detailSheetRef.current?.dismiss();
    },
  });

  const openFilters = useCallback(() => {
    setSheetDraft(activeFilters);
    filterSheetRef.current?.present();
  }, [activeFilters]);

  const applyFilters = useCallback(() => {
    setActiveFilters(sheetDraft);
    filterSheetRef.current?.dismiss();
  }, [sheetDraft, setActiveFilters]);

  const openDetail = useCallback((task: Task) => {
    setSelectedTask(task);
    requestAnimationFrame(() => detailSheetRef.current?.present());
  }, []);

  const handleStart = useCallback(
    (task: Task) => {
      patchStatus.mutate(
        { id: task.id, status: "in progress" },
        {
          onSuccess: () => detailSheetRef.current?.dismiss(),
          onError: (e) => {
            const msg =
              e instanceof ApiError ? e.message : "Could not start task";
            Alert.alert("Error", msg);
          },
        },
      );
    },
    [patchStatus],
  );

  const handleMarkDone = useCallback(
    (task: Task) => {
      patchStatus.mutate(
        { id: task.id, status: "completed" },
        {
          onSuccess: () => {
            detailSheetRef.current?.dismiss();
            setCompletedTitle(task.title);
            setManagerNote("");
            setCompletionOpen(true);
          },
          onError: (e) => {
            const msg =
              e instanceof ApiError ? e.message : "Could not complete task";
            Alert.alert("Error", msg);
          },
        },
      );
    },
    [patchStatus],
  );

  const handleClaim = useCallback(
    (task: Task) => {
      claimTask.mutate(task.id, {
        onError: (e) => {
          const msg =
            e instanceof ApiError ? e.message : "Could not claim task";
          Alert.alert("Error", msg);
        },
      });
    },
    [claimTask],
  );

  const handleDrop = useCallback(
    (task: Task) => {
      Alert.alert("Drop task?", "This returns the task to the unassigned list.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Drop",
          style: "destructive",
          onPress: () =>
            dropTask.mutate(task.id, {
              onError: (e) => {
                const msg =
                  e instanceof ApiError ? e.message : "Could not drop task";
                Alert.alert("Error", msg);
              },
            }),
        },
      ]);
    },
    [dropTask],
  );

  const errorMessage = (() => {
    if (!isError) return "";
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return "Sign in with Clerk to load tasks.";
      }
      if (error.status === 400) return error.message;
      if (error.status === 0)
        return "Cannot reach the server. Check EXPO_PUBLIC_API_BASE_URL (use your machine IP on device).";
      if (__DEV__) return `${error.message} (HTTP ${error.status})`;
    }
    return "We could not load tasks right now.";
  })();

  const currentTab = tabConfigs[activeTab];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <TasksHeader
        onOpenFilters={openFilters}
        onToggleSearch={() => setSearchOpen((o) => !o)}
        onOpenNotifications={() =>
          (router.push as (href: string) => void)("/notifications")
        }
        searchActive={searchOpen}
      />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {searchOpen ? (
        <View className="px-5 pb-2 pt-4">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tasks"
          />
        </View>
      ) : null}
      <ActiveFilterChips
        chips={chips}
        onRemove={(id) => setActiveFilters((f) => removeChipId(f, id))}
        onClearAll={() => setActiveFilters({})}
      />

      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#004FC5" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-gray-600">{errorMessage}</Text>
          </View>
        ) : (
          <TaskList
            tasks={filteredTasks}
            variant={currentTab.variant}
            compact={activeViewMode === "compact"}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
              }
            }}
            isFetchingNextPage={isFetchingNextPage}
            onPressTask={openDetail}
            onStart={handleStart}
            onClaim={handleClaim}
            onMarkDone={handleMarkDone}
          />
        )}
      </View>

      <TaskFilterSheet
        ref={filterSheetRef}
        tab={activeTab}
        draft={sheetDraft}
        setDraft={setSheetDraft}
        viewMode={activeViewMode}
        setViewMode={setActiveViewMode}
        onApply={applyFilters}
      />

      <TaskDetailSheet
        ref={detailSheetRef}
        task={selectedTask}
        listVariant={currentTab.variant}
        onDismiss={() => setSelectedTask(null)}
        onStart={handleStart}
        onClaim={handleClaim}
        onMarkDone={handleMarkDone}
        onDrop={handleDrop}
        onFindCover={() =>
          Alert.alert(
            "Find a Cover",
            "Reassigning to another teammate will be available when the backend supports it.",
          )
        }
      />

      <TaskCompletionModal
        visible={completionOpen}
        taskTitle={completedTitle}
        managerNote={managerNote}
        onChangeNote={setManagerNote}
        onClose={() => setCompletionOpen(false)}
      />
    </SafeAreaView>
  );
}
