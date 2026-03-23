import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import GuestProfile from "@/components/ui/guest-profile";
import { useGetApiV1GuestsStaysId } from "@shared/api/generated/endpoints/guests/guests";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();

  const query = useGetApiV1GuestsStaysId(id as string);

  if (!query || !query.data) {
    return <Text>Guest not found</Text>;
  }

  return (
    <GuestProfile
      firstName={query.data.first_name}
      lastName={query.data.last_name}
      phone={query.data.phone}
      email={query.data.email}
      notes={query.data.notes}
      preferences={query.data.preferences}
      currentStays={query.data.current_stays}
      previousStays={query.data.past_stays}
    />
  );
}
