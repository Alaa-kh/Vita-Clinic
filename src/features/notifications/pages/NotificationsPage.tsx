import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { notificationsApi } from '@/features/notifications/api/notificationsApi'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import styles from '@/features/platform/pages/Platform.module.scss'

export function NotificationsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: QUERY_KEYS.notifications.all,
    queryFn: notificationsApi.list,
  })

  const readMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all })
    },
  })

  const readAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all })
    },
  })

  const scheduleMutation = useMutation({
    mutationFn: () =>
      notificationsApi.schedule({
        title: t('notifications.scheduledTitle'),
        body: t('notifications.scheduledBody'),
        channel: 'push',
        scheduledFor: new Date(Date.now() + 3600_000).toISOString(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all })
    },
  })

  if (listQuery.isLoading) return <Spinner />
  if (listQuery.isError || !listQuery.data) {
    return (
      <StateMessage
        tone="error"
        title={t('errors.generic')}
        onAction={() => void listQuery.refetch()}
      />
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.notifications')}</p>
        <h1>{t('notifications.title')}</h1>
        <p>{t('notifications.subtitle', { count: listQuery.data.unread })}</p>
      </header>

      <div className={styles.actions} style={{ marginBottom: '1rem' }}>
        <Button type="button" variant="secondary" onClick={() => readAllMutation.mutate()}>
          {t('notifications.readAll')}
        </Button>
        <Button type="button" onClick={() => scheduleMutation.mutate()}>
          {t('notifications.schedule')}
        </Button>
      </div>

      <ul className={styles.list}>
        {listQuery.data.items.map((n) => (
          <li key={n.id} className={styles.listItem}>
            <div>
              <strong>{n.title}</strong>
              <div className={styles.muted}>
                {n.body} · {n.channel}
                {n.scheduledFor ? ` · ${t('notifications.scheduled')}` : ''}
              </div>
            </div>
            {!n.read ? (
              <Button type="button" size="sm" variant="secondary" onClick={() => readMutation.mutate(n.id)}>
                {t('notifications.markRead')}
              </Button>
            ) : (
              <span>{t('notifications.read')}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
