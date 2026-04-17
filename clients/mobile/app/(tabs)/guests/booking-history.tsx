import { View, Text, Pressable, SectionList } from "react-native";
import { ChevronLeft, Users, Calendar, Clock } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { useGetGuestsStaysId } from "@shared/api/generated/endpoints/guests/guests";
import type { Stay } from "@shared";
import { formatDate, formatTime } from "@/utils/time";

export default function BookingHistoryScreen() {
  const { id } = useLocalSearchParams();
  const { data, isLoading } = useGetGuestsStaysId(id as string);

  const currentStays = data?.current_stays ?? [];
  const pastStays = data?.past_stays ?? [];

  const grouped = pastStays.reduce<Record<string, Stay[]>>((acc, stay) => {
    const year = new Date(stay.arrival_date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(stay);
    return acc;
  }, {});

  const pastSections = Object.entries(grouped)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, data]) => ({ title: year, data, active: false }));

  const sections = [
    ...(currentStays.length > 0
      ? [{ title: "Active", data: currentStays, active: true }]
      : []),
    ...pastSections,
  ];

  return (
    <View className="flex-1 bg-white pt-safe">
      <View className="flex-row items-center px-[4vw] py-[3vh] border-b border-stroke-subtle">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.light.text} />
        </Pressable>
        <Text className="flex-1 text-center text-[5vw] font-semibold text-black">
          All Bookings
        </Text>
        <View className="w-[6vw]" />
      </View>

      {isLoading ? (
        <Text className="text-center mt-[4vh] text-[3.5vw] text-text-subtle">
          Loading...
        </Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderSectionHeader={({ section }) => (
            <Text className="text-[3.5vw] font-semibold text-black mt-[2vh] mb-[1vh]">
              {section.title}
            </Text>
          )}
          renderItem={({ item, section }) =>
            section.active ? (
              <ActiveBookingCard stay={item} />
            ) : (
              <PastBookingCard stay={item} />
            )
          }
        />
      )}
    </View>
  );
}

function ActiveBookingCard({ stay }: { stay: Stay }) {
  return (
    <View className="bg-success-accent border border-success-stroke rounded-xl p-[4vw] gap-[1.5vh]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[5.5vw] font-bold text-primary">
          Suite {stay.room_number}
        </Text>
        <View className="flex-row items-center gap-[1.5vw]">
          <Users size={16} color={Colors.light.tabBarActive} />
          <Text className="text-[4vw] text-primary font-medium">
            {stay.group_size ?? 1}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-[2vw]">
        <Text className="text-[3.5vw] text-primary w-[22vw]">Arrival:</Text>
        <Calendar size={13} color={Colors.light.tabBarActive} />
        <Text className="text-[3.5vw] text-primary">
          {formatDate(stay.arrival_date)}
        </Text>
        <Clock size={13} color={Colors.light.tabBarActive} />
        <Text className="text-[3.5vw] text-primary">
          {formatTime(stay.arrival_date)}
        </Text>
      </View>

      <View className="flex-row items-center gap-[2vw]">
        <Text className="text-[3.5vw] text-primary w-[22vw]">Departure:</Text>
        <Calendar size={13} color={Colors.light.tabBarActive} />
        <Text className="text-[3.5vw] text-primary">
          {formatDate(stay.departure_date)}
        </Text>
        <Clock size={13} color={Colors.light.tabBarActive} />
        <Text className="text-[3.5vw] text-primary">
          {formatTime(stay.departure_date)}
        </Text>
      </View>
    </View>
  );
}

function PastBookingCard({ stay }: { stay: Stay }) {
  return (
    <View className="border border-stroke-subtle rounded-xl px-[4vw] py-[2.5vh] gap-[0.8vh]">
      <View className="flex-row items-center gap-[2vw]">
        <Text className="text-[3.8vw] font-medium text-black">
          Suite {stay.room_number}
        </Text>
        <Users size={13} color={Colors.light.icon} />
        <Text className="text-[3.5vw] text-text-subtle">
          {stay.group_size ?? 1}
        </Text>
      </View>
      <Text className="text-[3.2vw] text-text-subtle">
        {formatDate(stay.arrival_date)} - {formatDate(stay.departure_date)}
      </Text>
    </View>
  );
}
