import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import GuestProfile from '@/components/ui/guest-profile';
import { guestData } from '@/test-data/guests';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  
  const guest = guestData.find(g => g.id === Number(id));
  
  if (!guest) {
    return <Text>Guest not found</Text>;
  }
  
  return <GuestProfile {...guest} />;
}
