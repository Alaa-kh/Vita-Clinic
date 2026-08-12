import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { analyticsApi } from '@/features/analytics/api/analyticsApi'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import styles from '@/features/platform/pages/Platform.module.scss'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const dashboardQuery = useQuery({
    queryKey: QUERY_KEYS.analytics.dashboard,
    queryFn: analyticsApi.dashboard,
    refetchInterval: 15_000,
  })

  const download = async (format: 'csv' | 'excel' | 'pdf') => {
    const data = await analyticsApi.exportReport(format)
    if (format === 'pdf') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'barq-report.json'
      a.click()
      URL.revokeObjectURL(url)
      return
    }
    const blob = new Blob([String(data)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `barq-report.${format === 'excel' ? 'csv' : 'csv'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (dashboardQuery.isLoading) return <Spinner />
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <StateMessage
        tone="error"
        title={t('errors.generic')}
        onAction={() => void dashboardQuery.refetch()}
      />
    )
  }

  const { kpis, charts, realtime } = dashboardQuery.data

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.analytics')}</p>
        <h1>{t('analytics.title')}</h1>
        <p>{t('analytics.subtitle')}</p>
      </header>

      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.id} className={styles.kpi}>
            <strong>
              {kpi.value}
              {kpi.unit ? ` ${kpi.unit}` : ''}
            </strong>
            <span>{kpi.label}</span>
            <div className={styles.delta}>
              {kpi.delta >= 0 ? '+' : ''}
              {kpi.delta}%
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.grid2} ${styles.grid}`} style={{ marginTop: '1.5rem' }}>
        <div className={styles.panel}>
          <h2>{t('analytics.revenue')}</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={charts.revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00a3b5" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#00a3b5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#00a3b5" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.panel}>
          <h2>{t('analytics.specialties')}</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={charts.bySpecialty}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f07a3a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.panel} style={{ marginTop: '1.5rem' }}>
        <h3>{t('analytics.realtime')}</h3>
        <p className={styles.muted}>
          {t('analytics.realtimeLine', {
            online: realtime.onlineUsers,
            health: realtime.apiHealth,
            queue: realtime.queueDepth,
            cache: Math.round(realtime.cacheHitRate * 100),
          })}
        </p>
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => void download('csv')}>
            {t('analytics.exportCsv')}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void download('excel')}>
            {t('analytics.exportExcel')}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void download('pdf')}>
            {t('analytics.exportPdf')}
          </Button>
        </div>
      </div>
    </div>
  )
}
