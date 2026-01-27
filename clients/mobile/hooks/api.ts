import { useAuth } from '@clerk/clerk-expo';
import { getAPIClient } from '@shared/api/client';

export const useAPIClient = () => {
  const authClient = useAuth();
  return getAPIClient(authClient, process.env.EXPO_PUBLIC_API_URL!);
};