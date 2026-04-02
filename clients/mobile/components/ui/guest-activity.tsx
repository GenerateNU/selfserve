import { View, Text, Pressable } from "react-native";
import { ChevronRight, Calendar, Clock, Users } from "lucide-react-native";
import { Colors } from "@/constants/theme";
import type { Stay } from "@shared/api/generated/models";

interface GuestActivityTabProps {
  currentStays: Stay[];
  pastStays: Stay[];
  onViewAllBookings: () => void;
}

export function GuestActivityTab({ currentStays, pastStays, onViewAllBookings }: GuestActivityTabProps) {
  const currentStay = currentStays?.[0] ?? null;

  return (
    <View className="px-[4vw] py-[3vh] gap-[3vh]">
      <BookingsSection currentStay={currentStay} onViewAll={onViewAllBookings} />
      <RequestsSection />
    </View>
  );
}

function BookingsSection({ currentStay, onViewAll }: { currentStay: Stay | null; onViewAll: () => void }) {
  return (
    <View>
      <Text className="text-[4vw] font-semibold text-black mb-[2vh]">Bookings</Text>
      {currentStay ? (
        <ActiveBookingCard stay={currentStay} />
      ) : (
        <Text className="text-[3.5vw] text-shadow-strong">No active bookings</Text>
      )}
      <Pressable
        onPress={onViewAll}
        className="flex-row items-center justify-end mt-[1.5vh]"
      >
        <Text className="text-[3.5vw] text-primary">View All</Text>
        <ChevronRight size={14} color={Colors.light.tabBarActive} />
      </Pressable>
    </View>
  );
}

function ActiveBookingCard({ stay }: { stay: Stay }) {
  const fmt = (d: string | Date) => new Date(d).toLocaleDateString("en-US", {
    month: "2-digit", day: "2-digit", year: "numeric"
  });
  const fmtTime = (d: string | Date) => new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <View className="bg-success-accent border border-success-stroke rounded-xl p-[4vw] gap-[1.5vh]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[4.5vw] font-semibold text-primary">Room {stay.room_number}</Text>
        <View className="flex-row items-center gap-[1vw]">
          <Users size={14} color={Colors.light.tabBarActive} />
          <Text className="text-[3.5vw] text-primary font-medium">{stay.status}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-[2vw]">
        <Text className="text-[3.5vw] text-primary w-[20vw]">Arrival:</Text>
        <View className="flex-row items-center gap-[1vw]">
          <Calendar size={12} color={Colors.light.tabBarActive} />
          <Text className="text-[3.5vw] text-primary">{fmt(stay.arrival_date)}</Text>
        </View>
        <View className="flex-row items-center gap-[1vw]">
          <Clock size={12} color={Colors.light.tabBarActive} />
          <Text className="text-[3.5vw] text-primary">{fmtTime(stay.arrival_date)}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-[2vw]">
        <Text className="text-[3.5vw] text-primary w-[20vw]">Departure:</Text>
        <View className="flex-row items-center gap-[1vw]">
          <Calendar size={12} color={Colors.light.tabBarActive} />
          <Text className="text-[3.5vw] text-primary">{fmt(stay.departure_date)}</Text>
        </View>
        <View className="flex-row items-center gap-[1vw]">
          <Clock size={12} color={Colors.light.tabBarActive} />
          <Text className="text-[3.5vw] text-primary">{fmtTime(stay.departure_date)}</Text>
        </View>
      </View>
    </View>
  );
}

function RequestsSection() {
  return (
    <View>
      <Text className="text-[4vw] font-semibold text-black mb-[2vh]">Requests (0)</Text>
      <Text className="text-[3.5vw] text-shadow-strong">No requests on record</Text>
    </View>
  );
}