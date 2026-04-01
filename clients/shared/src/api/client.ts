import { ApiError, HttpClient, RequestConfig } from "../types/api.types";
import { getConfig } from "./config";

/**
 * Internal helper to make HTTP requests w/ error handling
 */
export const createRequest = (
  getToken: () => Promise<string | null>,
  baseUrl: string,
  devClerkUserId?: string,
) => {
  // TODO(production): Remove hardcoded tenant ID. Derive hotel/tenant context from
  // authenticated user claims (or a server-issued context token), not client constants.
  const hardCodedHotelId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
  return async <T>(config: RequestConfig): Promise<T> => {
    let fullUrl = `${baseUrl}${config.url}`;
    if (config.params && Object.keys(config.params).length > 0) {
      const searchParams = new URLSearchParams(config.params);
      fullUrl += '?' + searchParams.toString();
    }

    try {
      const token = await getToken();

      const response = await fetch(fullUrl, {
        method: config.method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          // TODO(production): Do not trust client-sent X-Hotel-ID for tenancy isolation.
          // Backend should resolve tenant from auth context and ignore/validate this header.
          "X-Hotel-ID": hardCodedHotelId,
          ...(devClerkUserId?.trim() && {
            // TODO(production): Remove dev auth bypass header usage after auth middleware
            // is fully enforced in all environments.
            "X-Dev-User-Id": devClerkUserId.trim(),
          }),
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
  // Lazily resolve config at request time so that setConfig()
  // can be called during app startup (e.g. in a useEffect)
  // before any API calls are executed.
  const request = async <T>(config: RequestConfig): Promise<T> => {
    const { getToken, devClerkUserId } = getConfig();
    const baseUrl = getBaseUrl();
    const doRequest = createRequest(getToken, baseUrl, devClerkUserId);
    return doRequest<T>(config);
  };

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
  const url = getConfig().API_BASE_URL;
  if (!url) {
    throw new Error("API_BASE_URL is not configured. Check your .env file.");
  }

  return url;
};