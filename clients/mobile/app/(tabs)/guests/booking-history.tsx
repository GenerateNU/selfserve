import { View, Text, Pressable, SectionList } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { useGetGuestsStaysId } from "@shared/api/generated/endpoints/guests/guests";
import type { Stay } from "@shared/api/generated/models";

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
    <View className="flex-1 bg-white">
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
        <Text className="text-center mt-[4vh] text-[3.5vw] text-shadow-strong">
          Loading...
        </Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderSectionHeader={({ section }) => (
            <Text className="text-[3.5vw] font-semibold text-shadow-strong mt-[2vh] mb-[1vh]">
              {section.title}
            </Text>
          )}
          renderItem={({ item, section }) => (
            <BookingCard stay={item} isActive={section.active} />
          )}
        />
      )}
    </View>
  );
}

function BookingCard({ stay, isActive }: { stay: Stay; isActive: boolean }) {
  const fmt = (d: string | Date) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

  return (
    <View
      className={`rounded-xl p-[4vw] mb-[2vw] border ${
        isActive
          ? "bg-success-accent border-success-stroke"
          : "bg-white border-stroke-subtle"
      }`}
    >
      <View className="flex-row items-center justify-between mb-[1vh]">
        <Text
          className={`text-[4vw] font-semibold ${isActive ? "text-primary" : "text-black"}`}
        >
          Room {stay.room_number}
        </Text>
        <Text
          className={`text-[3.5vw] ${isActive ? "text-primary" : "text-shadow-strong"}`}
        >
          {stay.status}
        </Text>
      </View>
      <Text
        className={`text-[3vw] ${isActive ? "text-primary" : "text-shadow-strong"}`}
      >
        {fmt(stay.arrival_date)} - {fmt(stay.departure_date)}
      </Text>
    </View>
  );
}
