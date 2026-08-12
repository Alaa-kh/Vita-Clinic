interface AppConfig {
  apiBaseUrl: string
  appName: string
  apiTimeoutMs: number
}

function readEnv(key: keyof ImportMetaEnv): string | undefined {
  return import.meta.env[key]
}

export const config: AppConfig = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL') || '/api',
  appName: readEnv('VITE_APP_NAME') || 'Vita',
  apiTimeoutMs: 15_000,
}
