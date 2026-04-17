import Feather from "@expo/vector-icons/Feather";
import { Pressable, ScrollView, Text, View } from "react-native";

import { PriorityTag } from "@/components/tasks/priority-tag";
import { Colors } from "@/constants/theme";
import {
  useAssignRequestToSelf,
  useGetRequestsFeed,
  type RequestFeedItem,
} from "@shared/api/requests";
import { useGetRoomsForFloor } from "@shared/api/rooms";

type UnassignedTaskCardProps = {
  task: RequestFeedItem;
  onAssignToSelf: (taskId: string) => void;
  isAssigning: boolean;
};

function UnassignedTaskCard({
  task,
  onAssignToSelf,
  isAssigning,
}: UnassignedTaskCardProps) {
  const location = [
    task.floor != null ? `Floor ${task.floor}` : null,
    task.room_number != null ? `Room ${task.room_number}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <View
      className="bg-white rounded gap-3 px-3 py-4"
      style={{ borderWidth: 0.5, borderColor: "#e9e9e9" }}
    >
      <View className="gap-2">
        <View className="flex-row flex-wrap items-center gap-3">
          <PriorityTag priority={task.priority} />
          {task.department_name ? (
            <View className="border border-stroke-subtle flex-row items-center gap-2 h-6 px-2 rounded">
              <Feather name="home" size={12} color={Colors.light.iconMuted} />
              <Text className="text-xs text-text-default" numberOfLines={1}>
                {task.department_name}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          className="text-[15px] font-medium text-text-default"
          numberOfLines={2}
        >
          {task.name}
        </Text>
        {location ? (
          <View className="flex-row items-center gap-1">
            <Feather name="map-pin" size={10} color={Colors.light.iconSubtle} />
            <Text className="text-xs text-text-secondary">{location}</Text>
          </View>
        ) : null}
      </View>
      <Pressable
        onPress={() => onAssignToSelf(task.id)}
        disabled={isAssigning}
        className="bg-primary items-center justify-center px-6 py-[10px] rounded"
        style={{ opacity: isAssigning ? 0.6 : 1 }}
      >
        <Text className="text-sm text-white">Assign to Self</Text>
      </Pressable>
    </View>
  );
}

type OverviewTabProps = {
  floorId: number;
};

export function OverviewTab({ floorId }: OverviewTabProps) {
  const { data: requestsData } = useGetRequestsFeed({
    unassigned: true,
    floors: [floorId],
  });
  const { data: roomsData } = useGetRoomsForFloor([floorId]);
  const {
    mutate: assignToSelf,
    isPending: isAssigning,
    variables: assigningTaskId,
  } = useAssignRequestToSelf();

  const unassignedTasks =
    requestsData?.pages.flatMap((p) => p.items ?? []) ?? [];

  const rooms = roomsData?.items ?? [];
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(
    (r) => r.booking_status === "active",
  ).length;
  const vacantRooms = totalRooms - occupiedRooms;
  const cleaningRooms = rooms.filter(
    (r) => r.room_status === "cleaning",
  ).length;
  const occupiedAndCleaningRooms = rooms.filter(
    (r) => r.booking_status === "active" && r.room_status === "cleaning",
  ).length;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
    >
      {/* Stats section */}
      <View>
        <View className="border-b border-stroke-subtle py-3">
          <Text className="text-[15px] font-medium text-text-subtle">
            Overview
          </Text>
        </View>

        {/* Row 1: Urgent · Unassigned · Pending */}
        <View className="flex-row">
          <View className="flex-1 p-4 gap-1">
            <View className="flex-row items-center gap-1">
              <Feather
                name="alert-circle"
                size={16}
                color={Colors.light.textDefault}
              />
              <Text className="text-[15px] text-text-default">Urgent</Text>
            </View>
            <Text className="text-[32px] font-medium text-text-default leading-tight">
              0
            </Text>
            <Text className="text-[15px] text-text-subtle">Tasks</Text>
          </View>
          <View className="flex-1 p-4 gap-1">
            <Text className="text-[15px] text-text-default">Unassigned</Text>
            <Text className="text-[32px] font-medium text-text-default leading-tight">
              {unassignedTasks.length}
            </Text>
            <Text className="text-[15px] text-text-subtle">Tasks</Text>
          </View>
          <View className="flex-1 p-4 gap-1">
            <Text className="text-[15px] text-text-default">Pending</Text>
            <Text className="text-[32px] font-medium text-text-default leading-tight">
              {cleaningRooms}
            </Text>
            <Text className="text-[15px] text-text-subtle">Tasks</Text>
          </View>
        </View>

        {/* Row 2: Floor Occupancy · Expected Arrivals · Expected Departures */}
        <View className="flex-row">
          <View className="flex-1 p-4 gap-1">
            <Text className="text-[15px] text-text-default">{`Floor\nOccupancy`}</Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-[32px] font-medium text-text-default leading-tight">
                {occupiedRooms}
              </Text>
              <Text className="text-xs text-text-subtle">/</Text>
              <Text className="text-xs text-text-subtle">{totalRooms}</Text>
            </View>
            <Text className="text-[15px] text-text-subtle">Rooms occupied</Text>
          </View>
          <View className="flex-1 p-4 gap-1">
            <Text className="text-[15px] text-text-default">{`Expected\nArrivals`}</Text>
            <Text className="text-[32px] font-medium text-text-default leading-tight">
              {vacantRooms}
            </Text>
            <Text className="text-[15px] text-text-subtle">Guests</Text>
          </View>
          <View className="flex-1 p-4 gap-1">
            <Text className="text-[15px] text-text-default">{`Expected\nDepartures`}</Text>
            <Text className="text-[32px] font-medium text-text-default leading-tight">
              {occupiedAndCleaningRooms}
            </Text>
            <Text className="text-[15px] text-text-subtle">Guests</Text>
          </View>
        </View>
      </View>

      {/* Unassigned tasks section */}
      <View className="gap-3">
        <View className="border-b border-stroke-subtle py-3">
          <Text className="text-[15px] font-medium text-text-subtle">
            Unassigned Tasks ({unassignedTasks.length})
          </Text>
        </View>
        {unassignedTasks.map((task) => (
          <UnassignedTaskCard
            key={task.id}
            task={task}
            onAssignToSelf={assignToSelf}
            isAssigning={isAssigning && assigningTaskId === task.id}
          />
        ))}
      </View>
    </ScrollView>
  );
}
