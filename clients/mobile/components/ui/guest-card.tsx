import { Pressable, View, Text } from "react-native";
import {
  Accessibility,
  BriefcaseMedical,
  Utensils,
  Flag,
} from "lucide-react-native";
import type { ActiveBooking, Assistance } from "@shared";
import { Colors } from "@/constants/theme";

const MAX_VISIBLE_BOOKINGS = 3;

interface GuestCardProps {
  firstName: string;
  lastName: string;
  activeBookings: ActiveBooking[];
  requestCount: number;
  hasUrgent: boolean;
  assistance?: Assistance;
  onPress: () => void;
}

export function GuestCard({
  firstName,
  lastName,
  activeBookings,
  requestCount,
  hasUrgent,
  assistance,
  onPress,
}: GuestCardProps) {
  const needsAccessibility = !!assistance?.accessibility?.length;
  const needsMedical = !!assistance?.medical?.length;
  const needsDietary = !!assistance?.dietary?.length;

  const visibleBookings = activeBookings.slice(0, MAX_VISIBLE_BOOKINGS);
  const overflow = Math.max(0, activeBookings.length - MAX_VISIBLE_BOOKINGS);

  return (
    <Pressable
      onPress={onPress}
      className="px-[4vw] py-[2vh] border-b border-stroke-subtle bg-white"
    >
      {/* Row 1: name + assistance icons */}
      <View className="flex-row items-center justify-between mb-[0.8vh]">
        <Text className="text-[5vw] font-bold text-text-default">
          {firstName} {lastName.charAt(0)}.
        </Text>
        <View className="flex-row gap-[3vw]">
          <Accessibility
            size={20}
            color={needsAccessibility ? Colors.light.text : Colors.light.icon}
          />
          <BriefcaseMedical
            size={20}
            color={needsMedical ? Colors.light.text : Colors.light.icon}
          />
          <Utensils
            size={20}
            color={needsDietary ? Colors.light.text : Colors.light.icon}
          />
        </View>
      </View>

      {/* Row 2: priority badge + request count */}
      <View className="flex-row items-center gap-[2vw] mb-[0.8vh]">
        {hasUrgent && (
          <View className="flex-row items-center gap-1 bg-danger-accent rounded-md px-[2vw] py-[0.3vh]">
            <Flag size={11} color={Colors.light.danger} />
            <Text className="text-danger text-[3vw] font-medium">
              High Priority
            </Text>
          </View>
        )}
        <Text className="text-[3.2vw] text-text-subtle">
          Requests: {requestCount}
        </Text>
      </View>

      {/* Row 3: active bookings */}
      <View className="flex-row items-center gap-[1.5vw] flex-wrap">
        <Text className="text-[3.2vw] text-text-subtle">Active Bookings:</Text>
        {activeBookings.length === 0 ? (
          <Text className="text-[3.2vw] text-text-subtle">None</Text>
        ) : (
          <>
            {visibleBookings.map((b, i) => (
              <View key={i} className="bg-card rounded-md px-[2vw] py-[0.3vh]">
                <Text className="text-primary text-[3vw] font-medium">
                  Floor {b.floor}, Suite {b.room_number}
                </Text>
              </View>
            ))}
            {overflow > 0 && (
              <Text className="text-[3vw] text-text-subtle">
                + {overflow} more
              </Text>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}
