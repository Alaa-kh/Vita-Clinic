import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { config } from '@/shared/config/env'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { mapApiError } from '@/shared/errors/mapApiError'

type TokenGetter = () => string | null
type TokenSetter = (accessToken: string, refreshToken: string) => void
type AuthClearer = () => void

let getAccessToken: TokenGetter = () => localStorage.getItem(STORAGE_KEYS.accessToken)
let getRefreshToken: TokenGetter = () => localStorage.getItem(STORAGE_KEYS.refreshToken)
let setTokens: TokenSetter = (accessToken, refreshToken) => {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
}
let clearAuth: AuthClearer = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
}

export function bindAuthTokenHandlers(handlers: {
  getAccessToken: TokenGetter
  getRefreshToken: TokenGetter
  setTokens: TokenSetter
  clearAuth: AuthClearer
}): void {
  getAccessToken = handlers.getAccessToken
  getRefreshToken = handlers.getRefreshToken
  setTokens = handlers.setTokens
  clearAuth = handlers.clearAuth
}

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((requestConfig: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`
  }
  return requestConfig
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearAuth()
    return null
  }

  try {
    const { data } = await axios.post<{
      accessToken: string
      refreshToken: string
    }>(`${config.apiBaseUrl}/auth/refresh`, { refreshToken })

    setTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  } catch {
    clearAuth()
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })

      const newToken = await refreshPromise
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      }
    }

    return Promise.reject(mapApiError(error))
  },
)
