// API endpoint constants
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Hello endpoints
  HELLO: '/api/v1/hello',
  HELLO_NAME: (name: string) => `/api/v1/hello/${name}`,
  
  // Dev endpoints
  DEVS_MEMBER: (name: string) => `/api/v1/devs/${name}`,
  
  // Request endpoints
  REQUESTS_CREATE: '/api/v1/request',
} as const
