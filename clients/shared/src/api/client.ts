import { buildQueryString } from "../utils";
import { ApiError, HttpClient, RequestConfig } from "../types/api.types";
import { getAuthProvider } from "./auth-provider";

/**
 * Internal helper to make HTTP requests w/ error handling
 */
export const createRequest = (
  getToken: () => Promise<string | null>,
  baseUrl: string,
) => {
  return async <T>(config: RequestConfig): Promise<T> => {
    let fullUrl = `${baseUrl}${config.url}`;
    if (config.params && Object.keys(config.params).length > 0) {
      fullUrl += '?' + buildQueryString(config.params);
    }

    try {
      const token = await getToken();

      const response = await fetch(fullUrl, {
        method: config.method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...config.headers,
        },
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: config.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || "Request failed",
          response.status,
          errorData,
        );
      }

      const contentType = response.headers.get("content-type");
      let data: T;

      switch (true) {
        case contentType?.includes("application/json"):
          data = await response.json();
          break;
        case contentType?.includes("text/plain"):
          data = (await response.text()) as T;
          break;
        default:
          data = (await response.text()) as T;
          break;
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : "Network error",
        0,
        error,
      );
    }
  };
};

export const useAPIClient = (): HttpClient => {
  const { getToken } = getAuthProvider();
  const request = createRequest(getToken, getBaseUrl());

  return {
    get: <T>(endpoint: string, params?: Record<string, any>) =>
      request<T>({ url: endpoint, method: "GET", params }),
    post: <T>(endpoint: string, data: unknown) =>
      request<T>({ url: endpoint, method: "POST", data }),
    put: <T>(endpoint: string, data: unknown) =>
      request<T>({ url: endpoint, method: "PUT", data }),
    patch: <T>(endpoint: string, data: unknown) =>
      request<T>({ url: endpoint, method: "PATCH", data }),
    delete: <T>(endpoint: string) =>
      request<T>({ url: endpoint, method: "DELETE" }),
  };
};

export const getBaseUrl = (): string => {
  // @ts-ignore - Environment variable injected by bundler (Vite/Metro)
  const url = process.env.API_BASE_URL;

  if (!url) {
    throw new Error("API_BASE_URL is not configured. Check your .env file.");
  }

  return url;
};
