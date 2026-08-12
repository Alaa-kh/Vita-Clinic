/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_WS_URL: string
  readonly VITE_MAPBOX_TOKEN: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_MAP_TILE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
