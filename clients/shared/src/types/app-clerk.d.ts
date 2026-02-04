declare module "@app/clerk" {
  export function useAuth(): {
    getToken: () => Promise<string | null>;
  };
}