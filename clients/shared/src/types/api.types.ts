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
  get: <T>(endpoint: string, params?: Record<string, any>) => Promise<T>;
  post: <T>(endpoint: string, data: unknown) => Promise<T>;
  put: <T>(endpoint: string, data: unknown) => Promise<T>;
  patch: <T>(endpoint: string, data: unknown) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export type RequestConfig = {
  url: string;
  method: string;
  params?: Record<string, any>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};
