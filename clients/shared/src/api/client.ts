// base HTTP client (fetch or axios wrapper)

// use the clerk frontend sdk for react or expo to get this client: use the getAuth() method
type AuthClient = {
  getToken: () => Promise<string | null>
}

interface HttpClient {
  get: <T>(path: string) => Promise<APIResponse<T>>,
  post: <T>(path: string, body: unknown) => Promise<APIResponse<T>>,
  put: <T>(path: string, body: unknown) => Promise<APIResponse<T>>,
  patch: <T>(path: string, body: unknown) => Promise<APIResponse<T>>,
  delete: <T>(path: string) => Promise<APIResponse<T>>,
}

type APIResponse<T> = { data: T; error: null } | { data: null; error: string }

// returns a struct whose fields are functions that represent http calls like get, post
export const getAPIClient = (authClient: AuthClient, baseUrl: string): HttpClient => {
    const request = 
    async <T>(path: string, options: RequestInit = {}) => {
        try {
        const token = await authClient.getToken()

        const res = await fetch(`${baseUrl}${path}`, {
            ...options,
            headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
            },
        })

        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            return { data: null, error: body.message || `Error: ${res.status}` }
        }

        const data = await res.json()
        return { data, error: null }
        } catch (err) {
        return { data: null, error: 'Network error' }
        }
    }

    return {
        get: <T>(path: string) => request<T>(path, { method: 'GET' }),
        post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body)}),
        put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
        delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
        patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body)}),  
    }
}