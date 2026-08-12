import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { aiApi } from '@/features/ai/api/aiApi'
import { careDetailPath } from '@/shared/constants/routes'
import { Button } from '@/shared/components/Button/Button'
import styles from '@/features/platform/pages/Platform.module.scss'

export function AiPage() {
  const { t, i18n } = useTranslation()
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const [provider, setProvider] = useState('')
  const [recs, setRecs] = useState<Array<{ id: string; title: string; price: number; currency: string }>>([])
  const [searchQ, setSearchQ] = useState('')
  const [searchHits, setSearchHits] = useState<Array<{ id: string; title: string; score: number }>>([])
  const [toolOut, setToolOut] = useState('')

  const ask = async () => {
    const locale = i18n.language === 'ar' ? 'ar' : 'en'
    const data = await aiApi.chat(message, locale)
    setReply(data.reply)
    setProvider(data.provider)
    setRecs(data.recommendations)
  }

  const search = async () => {
    const data = await aiApi.search(searchQ)
    setSearchHits(data.items)
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.ai')}</p>
        <h1>{t('ai.title')}</h1>
        <p>{t('ai.subtitle')}</p>
      </header>

      <div className={styles.grid2}>
        <div className={styles.panel}>
          <h2>{t('ai.chat')}</h2>
          <textarea
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('ai.placeholder')}
          />
          <div className={styles.actions}>
            <Button type="button" onClick={() => void ask()}>
              {t('ai.ask')}
            </Button>
          </div>
          {reply ? (
            <div className={styles.bubble}>
              <div className={styles.muted}>{provider}</div>
              <p>{reply}</p>
            </div>
          ) : null}
          <ul className={styles.list}>
            {recs.map((r) => (
              <li key={r.id} className={styles.listItem}>
                <Link to={careDetailPath(r.id)}>{r.title}</Link>
                <span>
                  {r.price} {r.currency}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <h3>{t('ai.semantic')}</h3>
            <div className={styles.composer}>
              <input
                className={styles.input}
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder={t('ai.searchPlaceholder')}
              />
              <Button type="button" onClick={() => void search()}>
                {t('app.search')}
              </Button>
            </div>
            <ul className={styles.list}>
              {searchHits.map((hit) => (
                <li key={hit.id} className={styles.listItem}>
                  <Link to={careDetailPath(hit.id)}>{hit.title}</Link>
                  <span>score {hit.score}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel}>
            <h3>{t('ai.tools')}</h3>
            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  const data = await aiApi.ocr('voucher.jpg')
                  setToolOut(`${data.provider}: ${data.text} (${Math.round(data.confidence * 100)}%)`)
                }}
              >
                OCR
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  const data = await aiApi.transcribe(i18n.language === 'ar' ? 'ar' : 'en')
                  setToolOut(data.text)
                }}
              >
                {t('ai.stt')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  const data = await aiApi.synthesize(reply || 'Welcome to BARQ')
                  setToolOut(data.note)
                }}
              >
                {t('ai.tts')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  const data = await aiApi.vision('clinic')
                  setToolOut(data.labels.join(', '))
                }}
              >
                {t('ai.vision')}
              </Button>
            </div>
            {toolOut ? <p>{toolOut}</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
