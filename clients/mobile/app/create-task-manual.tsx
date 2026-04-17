import { useState } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react-native";
import { Colors } from "@/constants/theme";
import { useAPIClient } from "@shared/api/client";
import { getConfig } from "@shared/api/config";
import { REQUESTS_FEED_QUERY_KEY } from "@shared/api/requests";
import type {
  MakeRequest,
  MakeRequestPriority,
  Department,
  User,
  RoomWithOptionalGuestBooking,
} from "@shared";
import { PriorityPicker } from "@/components/tasks/priority-picker";
import { DepartmentPicker } from "@/components/tasks/department-picker";
import { DeadlinePicker } from "@/components/tasks/deadline-picker";
import { AssigneePicker } from "@/components/tasks/assignee-picker";
import { RoomPicker } from "@/components/tasks/room-picker";

export default function CreateTaskManualScreen() {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MakeRequestPriority>("medium");
  const [department, setDepartment] = useState<Department | undefined>(
    undefined,
  );
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [assignee, setAssignee] = useState<User | undefined>(undefined);
  const [room, setRoom] = useState<RoomWithOptionalGuestBooking | undefined>(
    undefined,
  );

  const api = useAPIClient();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (task: MakeRequest) => api.post<unknown>("/request", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
      router.navigate("/(tabs)/tasks");
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
      department: department?.id,
      user_id: assignee?.id,
      room_id: room?.id,
      scheduled_time: deadline?.toISOString(),
      status: "pending",
      request_type: "general",
    });
  };

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
              placeholderTextColor={Colors.light.textSubtle}
              value={taskName}
              onChangeText={setTaskName}
              returnKeyType="done"
            />
          </View>

          {/* Task Fields */}
          <View className="gap-4">
            <PriorityPicker
              value={priority}
              onChange={(v) => setPriority(v ?? "medium")}
            />

            <DeadlinePicker value={deadline} onChange={setDeadline} />

            <AssigneePicker value={assignee} onChange={setAssignee} />

            <RoomPicker value={room} onChange={setRoom} />

            <DepartmentPicker
              hotelId={getConfig().hotelId}
              value={department}
              onChange={setDepartment}
            />

            {/* Description */}
            <View className="gap-1">
              <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                Description
              </Text>
              <TextInput
                className="text-[15px] text-text-default tracking-tight leading-[1.25]"
                placeholder="Empty"
                placeholderTextColor={Colors.light.textSubtle}
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
              className={`bg-primary rounded h-[39px] items-center justify-center ${!taskName.trim() ? "opacity-50" : ""}`}
            >
              {saveMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.light.white} />
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
