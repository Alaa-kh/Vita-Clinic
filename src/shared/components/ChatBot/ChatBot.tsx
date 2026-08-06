import { FormEvent, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import styles from '@/shared/components/ChatBot/ChatBot.module.scss'

interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  text: string
}

function replyFor(input: string, t: (key: string) => string): string {
  const value = input.toLowerCase()
  if (/(حجز|موعد|book|appoint)/i.test(value)) return t('chat.replies.book')
  if (/(فرع|branch|موقع|location)/i.test(value)) return t('chat.replies.branch')
  if (/(عرض|سعر|price|offer|باقة)/i.test(value)) return t('chat.replies.offers')
  if (/(أسنان|dental|tooth)/i.test(value)) return t('chat.replies.dental')
  if (/(جلد|ليزر|derm|laser)/i.test(value)) return t('chat.replies.derm')
  if (/(شعر|hair)/i.test(value)) return t('chat.replies.hair')
  return t('chat.replies.fallback')
}

export function ChatBot() {
  const { t } = useTranslation()
  const panelId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEYS.chatDismissed) === '1') {
      setPulse(true)
      return
    }

    const timer = window.setTimeout(() => {
      setOpen(true)
      setPulse(true)
    }, 800)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open || messages.length > 0) return

    setMessages([
      { id: 'welcome', role: 'bot', text: t('chat.welcome') },
      { id: 'hint', role: 'bot', text: t('chat.hint') },
    ])
  }, [open, messages.length, t])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  const closeChat = () => {
    setOpen(false)
    sessionStorage.setItem(STORAGE_KEYS.chatDismissed, '1')
  }

  const openChat = () => {
    setOpen(true)
  }

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }
    setMessages((prev) => [...prev, userMessage])
    setDraft('')

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: replyFor(trimmed, t),
        },
      ])
    }, 550)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    send(draft)
  }

  const quick = [t('chat.quick.book'), t('chat.quick.offers'), t('chat.quick.branch')]

  return (
    <div className={styles.root}>
      {open ? (
        <section id={panelId} className={styles.panel} aria-label={t('chat.title')}>
          <header className={styles.header}>
            <div>
              <strong>{t('chat.title')}</strong>
              <p>{t('chat.subtitle')}</p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={closeChat}
              aria-label={t('chat.close')}
            >
              ×
            </button>
          </header>

          <div className={styles.messages} ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === 'bot' ? styles.bot : styles.user}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className={styles.quick}>
            {quick.map((item) => (
              <button key={item} type="button" onClick={() => send(item)}>
                {item}
              </button>
            ))}
          </div>

          <form className={styles.composer} onSubmit={onSubmit}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t('chat.placeholder')}
              aria-label={t('chat.placeholder')}
            />
            <button type="submit">{t('chat.send')}</button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className={`${styles.launcher} ${pulse ? styles.pulse : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (open) {
            closeChat()
            return
          }
          openChat()
        }}
      >
        <span className={styles.launcherIcon} aria-hidden="true" />
        <span>{open ? t('chat.close') : t('chat.open')}</span>
      </button>
    </div>
  )
}
