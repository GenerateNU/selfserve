import { getAuthProvider } from "./config";
import { createRequest, getBaseUrl } from "./client";
import { RequestConfig } from "../types/api.types";

/**
 * Custom mutator for Orval to use our existing fetch-based client
 * This function will be called by all generated API functions
 * Returns data of response
 */
export const useCustomInstance = <T>(): ((
  config: RequestConfig,
) => Promise<T>) => {
  const { getToken } = getAuthProvider();
  const request = createRequest(getToken, getBaseUrl());

  return async (config: RequestConfig): Promise<T> => {
    const response = await request<T>(config);
    return response;
  };
};

export default useCustomInstance;
