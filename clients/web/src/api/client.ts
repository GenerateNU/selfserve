import { getAPIClient } from '@shared/api/client';
import { useAuth } from '@clerk/clerk-react';

export const useAPIClient = () => {
  const auth = useAuth();
  return getAPIClient(auth, import.meta.env.VITE_API_URL);
};