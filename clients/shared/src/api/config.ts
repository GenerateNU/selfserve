/**
 * App configuration
 * Each app (web/mobile) must call setConfig once at startup
 *
 * Used to centralize platform-specific config (env vars, auth) for shared code
 */

export type Config = {
  API_BASE_URL: string
  getToken: () => Promise<string | null>
}

let config: Config | null = null

export const setConfig = (c: Config) => {
  config = c
}

export const getConfig = (): Config => {
  if (!config) {
    throw new Error('Config not initialized. Call setConfig() at app startup.')
  }
  return config
}