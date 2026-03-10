import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import GuestProfile from '@/components/ui/guest-profile';
import { useGetApiV1GuestsStaysId } from '@shared/api/generated/endpoints/guests/guests';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();

  const query = useGetApiV1GuestsStaysId(id as string)
  
  if (!query) {
    return <Text>Guest not found</Text>;
  }
  
  return <GuestProfile
    firstName={query.data?.first_name}
    lastName={query.data?.last_name}
    room={query.data?.room_number}
    arrival={query.data?.arrival_date}
    departure={query.data?.departure_date}
    notes={query.data?.notes}
    preferences={query.data?.preferences}
    previousStays={query.data?.stays ?? []}
/>;
}
