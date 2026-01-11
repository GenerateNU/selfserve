// API endpoint constants
export const ENDPOINTS = {
  HEALTH: '/health',
  DEVS: '/devs',
  DEV_BY_NAME: (name: string) => `/devs/${name}`,
} as const;
