import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Clock4,
  CalendarSync,
  MapPin,
  House,
  ChevronRight,
  Search,
} from "lucide-react-native";
import { useAPIClient } from "@shared/api/client";
import { getConfig } from "@shared/api/config";
import { useGetRoomsFloorsHook } from "@shared/api/generated/endpoints/rooms/rooms";
import type { MakeRequest, MakeRequestPriority } from "@shared";
import { PriorityPicker } from "@/components/tasks/priority-picker";

const colors = {
  textSubtle: "#747474",
  borderDefault: "#aeaeae",
  borderLight: "#e5e9ed",
  white: "#ffffff",
} as const;

type TaskFieldRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
};

function TaskFieldRow({ icon, label, value, onPress }: TaskFieldRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between h-6"
    >
      <View className="flex-row items-center gap-1">
        {icon}
        <Text className="text-[15px] text-text-subtle tracking-tight">
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Text
          className={`text-[15px] tracking-tight ${value ? "text-text-default" : "text-text-subtle"}`}
        >
          {value ?? "Select..."}
        </Text>
        <ChevronRight size={14} color={colors.textSubtle} />
      </View>
    </Pressable>
  );
}

export default function CreateTaskManualScreen() {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MakeRequestPriority | undefined>(
    undefined,
  );
  const [floor, setFloor] = useState<number | undefined>(undefined);
  const [floorExpanded, setFloorExpanded] = useState(false);
  const [floorSearch, setFloorSearch] = useState("");
  const floorInputRef = useRef<TextInput>(null);

  const api = useAPIClient();
  const queryClient = useQueryClient();
  const getFloors = useGetRoomsFloorsHook();

  const { data: floors = [] } = useQuery({
    queryKey: ["/rooms/floors"],
    queryFn: () => getFloors(),
    enabled: floorExpanded,
  });

  const filteredFloors = floors.filter((f) =>
    floorSearch ? String(f).includes(floorSearch) : true,
  );

  const saveMutation = useMutation({
    mutationFn: (task: MakeRequest) => api.post<unknown>("/request", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/request/cursor"] });
      queryClient.invalidateQueries({ queryKey: ["requests", "kanban"] });
      router.back();
    },
  });

  const handleSave = () => {
    if (!taskName.trim() || saveMutation.isPending) return;
    const { hotelId } = getConfig();
    saveMutation.mutate({
      hotel_id: hotelId,
      name: taskName.trim(),
      description: description.trim() || undefined,
      priority,
      status: "pending",
      request_type: "general",
    });
  };

  function handleFloorToggle() {
    const next = !floorExpanded;
    setFloorExpanded(next);
    setFloorSearch("");
    if (next) {
      setTimeout(() => floorInputRef.current?.focus(), 50);
    }
  }

  function handleFloorSelect(f: number) {
    setFloor(f);
    setFloorExpanded(false);
    setFloorSearch("");
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-[22px] py-3 border-b border-stroke-disabled h-14">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={20} color="black" />
        </Pressable>
        <Text className="text-2xl font-medium text-text-default tracking-tight">
          Tasks
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Task Name Input */}
          <View className="border border-stroke-subtle rounded p-2">
            <TextInput
              className="text-2xl font-bold text-text-default tracking-tight"
              placeholder="Task Name"
              placeholderTextColor={colors.textSubtle}
              value={taskName}
              onChangeText={setTaskName}
              returnKeyType="done"
            />
          </View>

          {/* Task Fields */}
          <View className="gap-4">
            <PriorityPicker value={priority} onChange={setPriority} />

            <TaskFieldRow
              icon={<Clock4 size={16} color={colors.textSubtle} />}
              label="Deadline"
            />
            <TaskFieldRow
              icon={<CalendarSync size={16} color={colors.textSubtle} />}
              label="Reoccurring"
            />

            {/* Floor */}
            <View className="gap-2">
              <Pressable
                onPress={handleFloorToggle}
                className="flex-row items-center justify-between h-6"
              >
                <View className="flex-row items-center gap-1">
                  <MapPin size={16} color={colors.textSubtle} />
                  <Text className="text-[15px] text-text-subtle tracking-tight">
                    Floor
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text
                    className={`text-[15px] tracking-tight ${floor !== undefined ? "text-text-default" : "text-text-subtle"}`}
                  >
                    {floor !== undefined ? `Floor ${floor}` : "Select..."}
                  </Text>
                  <ChevronRight size={14} color={colors.textSubtle} />
                </View>
              </Pressable>

              {floorExpanded && (
                <View
                  className="rounded"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.borderDefault,
                  }}
                >
                  {/* Search input */}
                  <View
                    className="flex-row items-center gap-2.5 px-2 py-2"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderLight,
                    }}
                  >
                    <Search size={17} color={colors.textSubtle} />
                    <View className="flex-row items-center flex-1">
                      <Text className="text-[12px] font-bold text-text-default tracking-tight">
                        Floor:{" "}
                      </Text>
                      <TextInput
                        ref={floorInputRef}
                        className="flex-1 text-[12px] text-text-default tracking-tight"
                        value={floorSearch}
                        onChangeText={setFloorSearch}
                        keyboardType="numeric"
                        returnKeyType="search"
                        placeholderTextColor={colors.textSubtle}
                      />
                    </View>
                  </View>

                  {/* Floor list */}
                  {filteredFloors.length === 0 ? (
                    <View className="px-4 py-3">
                      <Text className="text-[12px] text-text-subtle tracking-tight">
                        No floors found
                      </Text>
                    </View>
                  ) : (
                    filteredFloors.map((f) => (
                      <Pressable
                        key={f}
                        onPress={() => handleFloorSelect(f)}
                        className="px-4 py-2"
                        style={
                          floor === f
                            ? { backgroundColor: "#f5f5f5" }
                            : undefined
                        }
                      >
                        <Text className="text-[12px] text-text-default tracking-tight">
                          Floor {f}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}
            </View>

            <TaskFieldRow
              icon={<House size={16} color={colors.textSubtle} />}
              label="Department"
            />

            {/* Description */}
            <View className="gap-1">
              <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                Description
              </Text>
              <TextInput
                className="text-[15px] text-text-default tracking-tight leading-[1.25]"
                placeholder="Empty"
                placeholderTextColor={colors.textSubtle}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Actions */}
          <View className="gap-4">
            <Pressable
              onPress={handleSave}
              disabled={!taskName.trim() || saveMutation.isPending}
              className="bg-primary rounded h-[39px] items-center justify-center"
            >
              {saveMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text className="text-[15px] text-white tracking-tight">
                  Save Task
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              className="border border-primary rounded h-[39px] items-center justify-center"
            >
              <Text className="text-[15px] text-primary tracking-tight">
                Cancel
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
