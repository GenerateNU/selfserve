// API error type
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// API configuration
export interface ApiConfig {
  baseUrl: string;
}

export interface HttpClient {
  get: <T>(endpoint: string) => Promise<T>;
  post: <T>(endpoint: string, data: unknown) => Promise<T>;
  put: <T>(endpoint: string, data: unknown) => Promise<T>;
  patch: <T>(endpoint: string, data: unknown) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
}

export type AuthClient = {
  getToken: () => Promise<string | null>;
};
