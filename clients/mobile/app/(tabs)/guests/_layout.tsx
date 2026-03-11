import { Stack } from 'expo-router';

export default function GuestsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Guests' 
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Guest Profile',
        }} 
      />
    </Stack>
  );
}