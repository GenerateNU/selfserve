/**
 * useAuth configuration
 * Each app (web/mobile) must call setAuthProvider once at startup
 *
 * Used to centralize auth client logic for orval generation with different auth providers
 * for different platforms
 */

export type AuthProvider = {
  getToken: () => Promise<string | null>;
};

let authProvider: AuthProvider | null = null;

export const setAuthProvider = (provider: AuthProvider) => {
  authProvider = provider;
};

export const getAuthProvider = (): AuthProvider => {
  if (!authProvider) {
    throw new Error(
      "Auth provider not configured. Call setAuthProvider() at app startup.",
    );
  }
  return authProvider;
};
