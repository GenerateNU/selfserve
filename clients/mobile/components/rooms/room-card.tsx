import { Pressable, View, Text } from "react-native";
import { Flag, Accessibility, User, AlertCircle } from "lucide-react-native";
import { Colors } from "@/constants/theme";

export type RoomStatus =
  | { type: "occupied"; guestName: string }
  | { type: "out-of-order" }
  | { type: "vacant"; isAvailable?: boolean };

type RoomCardProps = {
  roomNumber: string | number;
  roomType: string;
  status: RoomStatus;
  hasHighPriority?: boolean;
  isAccessible?: boolean;
  extraTagCount?: number;
  onPress?: () => void;
};

function StatusTag({ status }: { status: RoomStatus }) {
  if (status.type === "occupied") {
    return (
      <View className="flex-row items-center gap-2 bg-bg-input h-6 px-2 rounded self-start">
        <User size={12} color={Colors.light.iconMuted} />
        <Text className="text-xs text-text-secondary">
          Occupied: {status.guestName}
        </Text>
      </View>
    );
  }
  if (status.type === "out-of-order") {
    return (
      <View className="flex-row items-center gap-2 bg-priority-high-bg h-6 px-2 rounded self-start">
        <AlertCircle size={12} color={Colors.light.danger} />
        <Text className="text-xs text-priority-high">Out of Order</Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row items-center gap-2 bg-bg-input h-6 px-2 rounded">
        <User size={12} color={Colors.light.iconMuted} />
        <Text className="text-xs text-text-secondary">Vacant</Text>
      </View>
      {status.isAvailable && (
        <View className="flex-row items-center gap-2 bg-bg-selected h-6 px-2 rounded">
          <Text className="text-xs text-primary">Available</Text>
        </View>
      )}
    </View>
  );
}

export function RoomCard({
  roomNumber,
  roomType,
  status,
  hasHighPriority,
  isAccessible,
  extraTagCount,
  onPress,
}: RoomCardProps) {
  const isVacantAvailable = status.type === "vacant" && status.isAvailable;
  const hasFeatureTags =
    hasHighPriority ||
    isAccessible ||
    (extraTagCount != null && extraTagCount > 0);

  return (
    <Pressable
      onPress={onPress}
      className="px-6 py-4 border-b border-stroke-subtle bg-white"
    >
      <View className="flex-row gap-2 items-start">
        {/* Room number badge */}
        <View className="bg-card rounded-lg items-center justify-center w-[86px] h-[86px]">
          <Text className="text-xs text-primary">Room</Text>
          <Text className="text-2xl font-medium text-primary leading-tight">
            {roomNumber}
          </Text>
        </View>

        {/* Info column */}
        <View className="flex-1 gap-2">
          {isVacantAvailable && <StatusTag status={status} />}

          <Text className="text-[15px] text-text-default">{roomType}</Text>

          {!isVacantAvailable && <StatusTag status={status} />}

          {hasFeatureTags && (
            <View className="flex-row flex-wrap gap-1 items-center">
              {hasHighPriority && (
                <View className="flex-row items-center gap-1 bg-priority-high-bg px-2 py-1 rounded">
                  <Flag size={12} color={Colors.light.danger} />
                  <Text className="text-xs text-priority-high">
                    High Priority
                  </Text>
                </View>
              )}
              {isAccessible && (
                <View className="flex-row items-center gap-2 bg-bg-input h-6 px-2 rounded">
                  <Accessibility size={12} color={Colors.light.iconMuted} />
                  <Text className="text-xs text-text-secondary">
                    Accessible
                  </Text>
                </View>
              )}
              {extraTagCount != null && extraTagCount > 0 && (
                <View className="bg-bg-input px-2 py-1 rounded">
                  <Text className="text-xs text-text-secondary">
                    +{extraTagCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
