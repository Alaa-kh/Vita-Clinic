import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Button } from '@/shared/components/Button/Button'
import { getSocket } from '@/shared/realtime/socket'
import styles from '@/features/platform/pages/Platform.module.scss'

interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
}

interface PresenceUser {
  id: string
  name: string
  socketId: string
}

const ROOM = 'barq-lobby'

export function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [typingName, setTypingName] = useState<string | null>(null)
  const [presence, setPresence] = useState<PresenceUser[]>([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    const socket = getSocket()
    socket.emit('chat:join', ROOM)

    const onHistory = (history: ChatMessage[]) => setMessages(history)
    const onMessage = (message: ChatMessage) => setMessages((prev) => [...prev, message])
    const onTyping = (payload: { name: string; typing: boolean }) => {
      setTypingName(payload.typing ? payload.name : null)
    }
    const onPresence = (users: PresenceUser[]) => setPresence(users)
    const onPush = (payload: { title: string; body: string }) => {
      setToast(`${payload.title}: ${payload.body}`)
      window.setTimeout(() => setToast(''), 2500)
    }

    socket.on('chat:history', onHistory)
    socket.on('chat:message', onMessage)
    socket.on('chat:typing', onTyping)
    socket.on('presence:update', onPresence)
    socket.on('notification:push', onPush)

    return () => {
      socket.off('chat:history', onHistory)
      socket.off('chat:message', onMessage)
      socket.off('chat:typing', onTyping)
      socket.off('presence:update', onPresence)
      socket.off('notification:push', onPush)
    }
  }, [])

  const send = () => {
    if (!text.trim()) return
    getSocket().emit('chat:message', {
      roomId: ROOM,
      body: text,
      senderName: user?.fullName ?? 'Guest',
    })
    getSocket().emit('chat:typing', { roomId: ROOM, typing: false })
    setText('')
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.chat')}</p>
        <h1>{t('realtime.title')}</h1>
        <p>{t('realtime.subtitle')}</p>
      </header>

      <div className={styles.grid2}>
        <div className={styles.panel}>
          <h2>{t('realtime.liveChat')}</h2>
          <div className={styles.chatLog}>
            {messages.map((m) => {
              const mine = user?.id ? m.senderId === user.id : false
              return (
                <div
                  key={m.id}
                  className={`${styles.bubble} ${mine ? styles.bubbleMine : ''}`}
                >
                  <strong>{m.senderName}</strong>
                  <div>{m.body}</div>
                </div>
              )
            })}
          </div>
          {typingName ? <p className={styles.muted}>{t('realtime.typing', { name: typingName })}</p> : null}
          {toast ? <p>{toast}</p> : null}
          <div className={styles.composer}>
            <input
              className={styles.input}
              value={text}
              placeholder={t('realtime.placeholder')}
              onChange={(e) => {
                setText(e.target.value)
                getSocket().emit('chat:typing', { roomId: ROOM, typing: true })
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
            />
            <Button type="button" onClick={send}>
              {t('realtime.send')}
            </Button>
          </div>
        </div>

        <div className={styles.panel}>
          <h3>{t('realtime.presence')}</h3>
          <ul className={styles.list}>
            {presence.map((p) => (
              <li key={p.socketId} className={styles.listItem}>
                <span>{p.name}</span>
                <strong>{t('realtime.online')}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
