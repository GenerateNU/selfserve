import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Info, ChevronRight } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useGetGuestsStaysId } from "@shared/api/generated/endpoints/guests/guests";
import { GuestHeader, Tab } from "@/components/ui/guest-header";
import { GuestProfileTab } from "@/components/ui/guest-profile";
import { GuestActivityTab } from "@/components/ui/guest-activity";
import { Colors } from "@/constants/theme";

export default function GuestProfileScreen() {
  const { id } = useLocalSearchParams();
  const { data, isLoading } = useGetGuestsStaysId(id as string);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (isLoading) return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator />
    </View>
  );

  if (!data) return (
    <View className="flex-1 items-center justify-center">
      <Text>Guest not found</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <GuestHeader
        name={`${data.first_name} ${data.last_name}`}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <WaitingRequestsBanner name={data.first_name} />
      <ScrollView className="flex-1">
        {activeTab === "profile" ? (
          <GuestProfileTab
            firstName={data.first_name}
            lastName={data.last_name}
            phone={data.phone}
            email={data.email}
            notes={data.notes}
            preferences={data.preferences}
            specificAssistance={[]}
          />
        ) : (
          <GuestActivityTab
            currentStays={data.current_stays ?? []}
            pastStays={data.past_stays ?? []}
            onViewAllBookings={() => router.push(`/guests/booking-history?id=${id}`)}
          />
        )}
      </ScrollView>
    </View>
  );
}

function WaitingRequestsBanner({ name }: { name: string }) {
  return (
    <Pressable className="flex-row items-center justify-between px-[4vw] py-[1.5vh] bg-primary">
      <View className="flex-row items-center gap-[2vw]">
        <Info size={16} color={Colors.light.background} />
        <Text className="text-white text-[3.5vw]">{name} is waiting on requests</Text>
      </View>
      <ChevronRight size={16} color={Colors.light.background} />
    </Pressable>
  );
}