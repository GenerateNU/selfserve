import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { Flag, Clock } from "lucide-react-native";
import { Colors } from "@/constants/theme";
import type { GuestRequest } from "@shared";
import { formatTime, timeAgo } from "@/utils/time";

interface GuestRequestsTabProps {
  requests: GuestRequest[];
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
}

export function GuestRequestsTab({
  requests,
  onLoadMore,
  isFetchingMore,
}: GuestRequestsTabProps) {
  if (requests.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-[8vh]">
        <Text className="text-[3.5vw] text-text-subtle">
          No requests on record
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(r, i) => r.id ?? String(i)}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => <RequestCard request={item} />}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isFetchingMore ? <ActivityIndicator className="py-4" /> : null
      }
    />
  );
}

function RequestCard({ request }: { request: GuestRequest }) {
  const isHighPriority = request.priority === "high";

  return (
    <View
      className={`rounded-xl border p-[4vw] gap-[1vh] ${
        isHighPriority
          ? "border-danger bg-danger-accent"
          : "border-stroke-subtle bg-white"
      }`}
    >
      {isHighPriority && (
        <View className="flex-row items-center gap-[1.5vw]">
          <Flag size={12} color={Colors.light.danger} />
          <Text className="text-[3vw] text-danger font-medium">
            High Priority
          </Text>
        </View>
      )}

      <Text
        className={`text-[4vw] ${
          isHighPriority
            ? "font-bold text-black"
            : "font-semibold text-text-subtle"
        }`}
      >
        {request.name}
      </Text>

      <View className="flex-row items-center gap-[1.5vw]">
        {request.room_number != null && (
          <Text className="text-[3vw] text-text-subtle">
            Suite {request.room_number}
          </Text>
        )}
        <Clock size={11} color={Colors.light.icon} />
        <Text className="text-[3vw] text-text-subtle">
          {timeAgo(request.created_at)} at {formatTime(request.created_at)}
        </Text>
      </View>

      {request.description && (
        <Text className="text-[3.2vw] text-text-subtle" numberOfLines={2}>
          {request.description}
        </Text>
      )}
    </View>
  );
}
