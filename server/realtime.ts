import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { randomUUID } from 'node:crypto'
import { getDb } from './data/db.js'
import { verifyToken } from './middleware/auth.js'

interface PresenceUser {
  id: string
  name: string
  socketId: string
}

const presence = new Map<string, PresenceUser>()

export function attachRealtime(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
    path: '/socket.io',
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) {
      next()
      return
    }
    try {
      const payload = verifyToken(token)
      socket.data.userId = payload.sub
      socket.data.email = payload.email
      socket.data.role = payload.role
      next()
    } catch {
      next()
    }
  })

  io.on('connection', (socket) => {
    const userId = (socket.data.userId as string | undefined) ?? `guest-${socket.id}`
    const name = (socket.data.email as string | undefined) ?? 'Guest'

    presence.set(socket.id, { id: userId, name, socketId: socket.id })
    io.emit('presence:update', [...presence.values()])

    socket.on('chat:join', (roomId: string) => {
      void socket.join(roomId)
      const history = getDb()
        .chatMessages.filter((m) => m.roomId === roomId)
        .slice(-50)
      socket.emit('chat:history', history)
    })

    socket.on('chat:message', (payload: { roomId: string; body: string; senderName?: string }) => {
      if (!payload?.roomId || !payload?.body?.trim()) return
      const message = {
        id: randomUUID(),
        roomId: payload.roomId,
        senderId: userId,
        senderName: payload.senderName ?? name,
        body: payload.body.trim().slice(0, 2000),
        createdAt: new Date().toISOString(),
      }
      getDb().chatMessages.push(message)
      io.to(payload.roomId).emit('chat:message', message)
      io.to(payload.roomId).emit('notification:push', {
        title: 'New message',
        body: message.body.slice(0, 80),
      })
    })

    socket.on('chat:typing', (payload: { roomId: string; typing: boolean }) => {
      if (!payload?.roomId) return
      socket.to(payload.roomId).emit('chat:typing', {
        userId,
        name,
        typing: Boolean(payload.typing),
      })
    })

    socket.on('tracking:update', (payload: { lat: number; lng: number; heading?: number; speed?: number }) => {
      if (typeof payload?.lat !== 'number' || typeof payload?.lng !== 'number') return
      io.emit('tracking:live', {
        userId,
        lat: payload.lat,
        lng: payload.lng,
        heading: payload.heading ?? 0,
        speed: payload.speed ?? 0,
        updatedAt: new Date().toISOString(),
      })
    })

    socket.on('webrtc:signal', (payload: { roomId: string; signal: unknown; to?: string }) => {
      if (!payload?.roomId) return
      if (payload.to) {
        io.to(payload.to).emit('webrtc:signal', {
          from: socket.id,
          signal: payload.signal,
          roomId: payload.roomId,
        })
        return
      }
      socket.to(payload.roomId).emit('webrtc:signal', {
        from: socket.id,
        signal: payload.signal,
        roomId: payload.roomId,
      })
    })

    socket.on('webrtc:join', (roomId: string) => {
      void socket.join(roomId)
      socket.to(roomId).emit('webrtc:peer-joined', { peerId: socket.id })
    })

    socket.on('disconnect', () => {
      presence.delete(socket.id)
      io.emit('presence:update', [...presence.values()])
    })
  })

  return io
}
