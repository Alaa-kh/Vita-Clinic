import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/features/auth/types/user'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  status: 'idle' | 'hydrating' | 'authenticated' | 'anonymous'
  bootstrapped: boolean
}

function readStoredToken(key: string): string | null {
  return localStorage.getItem(key)
}

const initialState: AuthState = {
  user: null,
  accessToken: readStoredToken(STORAGE_KEYS.accessToken),
  refreshToken: readStoredToken(STORAGE_KEYS.refreshToken),
  status: 'idle',
  bootstrapped: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setHydrating(state) {
      state.status = 'hydrating'
    },
    setSession(
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>,
    ) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.status = 'authenticated'
      state.bootstrapped = true
      localStorage.setItem(STORAGE_KEYS.accessToken, action.payload.accessToken)
      localStorage.setItem(STORAGE_KEYS.refreshToken, action.payload.refreshToken)
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.status = 'authenticated'
      state.bootstrapped = true
    },
    updateTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      localStorage.setItem(STORAGE_KEYS.accessToken, action.payload.accessToken)
      localStorage.setItem(STORAGE_KEYS.refreshToken, action.payload.refreshToken)
    },
    clearSession(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.status = 'anonymous'
      state.bootstrapped = true
      localStorage.removeItem(STORAGE_KEYS.accessToken)
      localStorage.removeItem(STORAGE_KEYS.refreshToken)
    },
    markBootstrapped(state) {
      state.bootstrapped = true
      if (!state.accessToken) {
        state.status = 'anonymous'
      }
    },
  },
})

export const {
  setHydrating,
  setSession,
  setUser,
  updateTokens,
  clearSession,
  markBootstrapped,
} = authSlice.actions
export const authReducer = authSlice.reducer
