interface AppConfig {
  apiBaseUrl: string
  appName: string
  apiTimeoutMs: number
  wsUrl: string
  mapboxToken: string
  stripePublishableKey: string
  mapTileUrl: string
}

function readEnv(key: keyof ImportMetaEnv): string | undefined {
  return import.meta.env[key]
}

export const config: AppConfig = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL') ?? '/api',
  appName: readEnv('VITE_APP_NAME') ?? 'BARQ',
  apiTimeoutMs: 15_000,
  wsUrl: readEnv('VITE_WS_URL') ?? '',
  mapboxToken: readEnv('VITE_MAPBOX_TOKEN') ?? '',
  stripePublishableKey: readEnv('VITE_STRIPE_PUBLISHABLE_KEY') ?? '',
  mapTileUrl:
    readEnv('VITE_MAP_TILE_URL') ??
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}
