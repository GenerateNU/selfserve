import { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Info, ChevronRight } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useGetGuestsStaysId } from "@shared/api/generated/endpoints/guests/guests";
import { useInfiniteRequestsByGuest } from "@shared";
import { GuestHeader, Tab } from "@/components/ui/guest-header";
import { GuestProfileTab } from "@/components/ui/guest-profile";
import { GuestRequestsTab } from "@/components/ui/guest-activity";
import { Colors } from "@/constants/theme";

export default function GuestProfileScreen() {
  const { id } = useLocalSearchParams();
  const guestId = id as string;

  const { data, isLoading } = useGetGuestsStaysId(guestId);

  const {
    data: requestPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteRequestsByGuest(guestId);

  const requests = useMemo(
    () => requestPages?.pages.flatMap((p) => p.items ?? []) ?? [],
    [requestPages],
  );

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const hasUrgent = requests.some((r) => r.priority === "high");

  if (isLoading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );

  if (!data)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Guest not found</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <GuestHeader
        name={data.first_name}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasUrgent={hasUrgent}
      />

      {requests.length > 0 && (
        <Pressable
          onPress={() => setActiveTab("requests")}
          className="flex-row items-center justify-between px-[4vw] py-[1.5vh] bg-primary"
        >
          <View className="flex-row items-center gap-[2vw]">
            <Info size={16} color={Colors.light.background} />
            <Text className="text-white text-[3.5vw]">
              {data.first_name} is waiting on requests
            </Text>
          </View>
          <ChevronRight size={16} color={Colors.light.background} />
        </Pressable>
      )}

      {activeTab === "profile" ? (
        <ScrollView className="flex-1">
          <GuestProfileTab
            guestId={guestId}
            firstName={data.first_name}
            lastName={data.last_name}
            pronouns={data.pronouns}
            doNotDisturbStart={data.do_not_disturb_start}
            doNotDisturbEnd={data.do_not_disturb_end}
            housekeepingCadence={data.housekeeping_cadence}
            notes={data.notes}
            assistance={data.assistance}
            currentStays={data.current_stays ?? []}
            onViewAllBookings={() =>
              router.push(`/guests/booking-history?id=${guestId}`)
            }
          />
        </ScrollView>
      ) : (
        <GuestRequestsTab
          requests={requests}
          onLoadMore={hasNextPage ? fetchNextPage : undefined}
          isFetchingMore={isFetchingNextPage}
        />
      )}
    </View>
  );
}
