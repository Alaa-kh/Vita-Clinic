import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { storageApi } from '@/features/storage/api/storageApi'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import styles from '@/features/platform/pages/Platform.module.scss'

export function StoragePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [active, setActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const filesQuery = useQuery({
    queryKey: QUERY_KEYS.storage.files,
    queryFn: storageApi.list,
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => storageApi.upload(file, true),
    onSuccess: async (result) => {
      if (result.file.mimeType === 'application/pdf') {
        setPreviewUrl(result.file.url)
      } else if (result.file.mimeType.startsWith('image/')) {
        setPreviewUrl(result.file.url)
      }
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storage.files })
    },
  })

  const onFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file) uploadMutation.mutate(file)
    },
    [uploadMutation],
  )

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.storage')}</p>
        <h1>{t('storage.title')}</h1>
        <p>{t('storage.subtitle')}</p>
      </header>

      <div
        className={`${styles.dropZone} ${active ? styles.dropZoneActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setActive(true)
        }}
        onDragLeave={() => setActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setActive(false)
          onFiles(e.dataTransfer.files)
        }}
        onClick={() => document.getElementById('barq-upload')?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            document.getElementById('barq-upload')?.click()
          }
        }}
      >
        <p>{t('storage.drop')}</p>
        <input
          id="barq-upload"
          type="file"
          hidden
          accept="image/*,video/*,application/pdf"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {uploadMutation.isPending ? <Spinner /> : null}

      <div className={styles.grid2} style={{ marginTop: '1.5rem' }}>
        <div className={styles.panel}>
          <h2>{t('storage.files')}</h2>
          <ul className={styles.list}>
            {filesQuery.data?.map((f) => (
              <li key={f.id} className={styles.listItem}>
                <div>
                  <strong>{f.originalName}</strong>
                  <div className={styles.muted}>
                    {f.mimeType} · {Math.round(f.size / 1024)} KB
                    {f.compressed ? ` · ${t('storage.compressed')}` : ''}
                  </div>
                </div>
                <Button type="button" size="sm" variant="secondary" onClick={() => setPreviewUrl(f.url)}>
                  {t('storage.preview')}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.panel}>
          <h3>{t('storage.previewTitle')}</h3>
          {previewUrl ? (
            previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.includes('pdf') ? (
              <iframe title="pdf" src={previewUrl} style={{ width: '100%', minHeight: 360, border: 0 }} />
            ) : (
              <img src={previewUrl} alt="" style={{ width: '100%', borderRadius: 12 }} />
            )
          ) : (
            <p className={styles.muted}>{t('storage.noPreview')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
