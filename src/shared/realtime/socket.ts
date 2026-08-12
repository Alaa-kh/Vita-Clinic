import { io, type Socket } from 'socket.io-client'
import { config } from '@/shared/config/env'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

let socket: Socket | null = null

function socketBaseUrl(): string {
  if (config.wsUrl) return config.wsUrl
  try {
    const api = new URL(config.apiBaseUrl, window.location.origin)
    return api.origin
  } catch {
    return window.location.origin
  }
}

export function getSocket(): Socket {
  if (socket) return socket

  const token = localStorage.getItem(STORAGE_KEYS.accessToken)
  socket = io(socketBaseUrl(), {
    path: '/socket.io',
    autoConnect: true,
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  return socket
}

export function reconnectSocketWithAuth(): void {
  const current = getSocket()
  current.auth = { token: localStorage.getItem(STORAGE_KEYS.accessToken) }
  if (!current.connected) current.connect()
  else {
    current.disconnect()
    current.connect()
  }
}
