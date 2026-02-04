import { ApiError, AuthClient, HttpClient } from "../types/api.types";

/**
 * Internal helper to make HTTP requests w/ error handling
 */
const createRequest = (authClient: AuthClient, baseUrl: string) => {
  return async <T>(endpoint: string, options: RequestInit): Promise<T> => {
    try {
      const token = await authClient.getToken();

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
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
      if (contentType && contentType.includes("text/plain")) {
        return (await response.text()) as T;
      }

      return response.json();
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

export const getAPIClient = (
  authClient: AuthClient,
  baseUrl: string,
): HttpClient => {
  const request = createRequest(authClient, baseUrl);

  return {
    get: <T>(endpoint: string): Promise<T> => {
      return request<T>(endpoint, { method: "GET" });
    },

    post: <T>(endpoint: string, data: unknown): Promise<T> => {
      return request<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    put: <T>(endpoint: string, data: unknown): Promise<T> => {
      return request<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    patch: <T>(endpoint: string, data: unknown): Promise<T> => {
      return request<T>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    delete: <T>(endpoint: string): Promise<T> => {
      return request<T>(endpoint, { method: "DELETE" });
    },
  };
};
