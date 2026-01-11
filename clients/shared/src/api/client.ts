// base HTTP client (fetch or axios wrapper)
const API_BASE_URL = "http://localhost:8080";

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  },
  post: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  },
};
