import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { bookingsApi } from '@/features/booking/api/bookingsApi'
import { useCareList } from '@/features/care/hooks/useCareList'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import styles from '@/features/platform/pages/Platform.module.scss'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function BookingPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const careQuery = useCareList({ pageSize: 50 })
  const [careId, setCareId] = useState('')
  const [date, setDate] = useState(todayIso())
  const [slot, setSlot] = useState('')
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'biweekly' | 'monthly'>('none')
  const [notes, setNotes] = useState('')

  const selectedCareId = careId || careQuery.data?.items[0]?.id || ''

  const availabilityQuery = useQuery({
    queryKey: QUERY_KEYS.bookings.slots(selectedCareId, date),
    queryFn: () => bookingsApi.availability(selectedCareId, date),
    enabled: Boolean(selectedCareId && date),
  })

  const mineQuery = useQuery({
    queryKey: QUERY_KEYS.bookings.mine,
    queryFn: bookingsApi.mine,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        careId: selectedCareId,
        date,
        slot,
        recurrence,
        notes: notes || undefined,
      }),
    onSuccess: async () => {
      setSlot('')
      setNotes('')
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.mine })
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.bookings.slots(selectedCareId, date),
      })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.updateStatus(id, 'cancelled'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.mine })
    },
  })

  const weekDays = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      return d.toISOString().slice(0, 10)
    })
  }, [])

  if (careQuery.isLoading) return <Spinner />

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.booking')}</p>
        <h1>{t('booking.title')}</h1>
        <p>{t('booking.subtitle')}</p>
      </header>

      <div className={styles.grid2}>
        <div className={styles.panel}>
          <h2>{t('booking.new')}</h2>
          <div className={styles.grid}>
            <label>
              <span className={styles.muted}>{t('booking.care')}</span>
              <select
                className={styles.select}
                value={selectedCareId}
                onChange={(e) => setCareId(e.target.value)}
              >
                {careQuery.data?.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={styles.muted}>{t('booking.date')}</span>
              <select className={styles.select} value={date} onChange={(e) => setDate(e.target.value)}>
                {weekDays.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <p className={styles.muted}>{t('booking.slots')}</p>
              <div className={styles.actions}>
                {availabilityQuery.data?.map((s) => (
                  <Button
                    key={s.slot}
                    type="button"
                    size="sm"
                    variant={slot === s.slot ? 'primary' : 'secondary'}
                    disabled={!s.available}
                    onClick={() => setSlot(s.slot)}
                  >
                    {s.slot}
                  </Button>
                ))}
              </div>
            </div>

            <label>
              <span className={styles.muted}>{t('booking.recurrence')}</span>
              <select
                className={styles.select}
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
              >
                <option value="none">{t('booking.recurrenceNone')}</option>
                <option value="weekly">{t('booking.recurrenceWeekly')}</option>
                <option value="biweekly">{t('booking.recurrenceBiweekly')}</option>
                <option value="monthly">{t('booking.recurrenceMonthly')}</option>
              </select>
            </label>

            <label>
              <span className={styles.muted}>{t('booking.notes')}</span>
              <textarea
                className={styles.textarea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('booking.notesPlaceholder')}
              />
            </label>

            {createMutation.isError ? (
              <StateMessage tone="error" title={t('errors.generic')} />
            ) : null}

            <Button
              type="button"
              disabled={!slot || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {t('booking.confirm')}
            </Button>
          </div>
        </div>

        <div className={styles.panel}>
          <h2>{t('booking.mine')}</h2>
          {mineQuery.isLoading ? <Spinner /> : null}
          {mineQuery.isSuccess && mineQuery.data.length === 0 ? (
            <StateMessage title={t('booking.empty')} />
          ) : null}
          <ul className={styles.list}>
            {mineQuery.data?.map((b) => (
              <li key={b.id} className={styles.listItem}>
                <div>
                  <strong>
                    {b.date} · {b.slot}
                  </strong>
                  <div className={styles.muted}>
                    {b.status} · {b.recurrence}
                    {b.reminderAt ? ` · ${t('booking.reminder')}` : ''}
                  </div>
                </div>
                {b.status !== 'cancelled' ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => cancelMutation.mutate(b.id)}
                  >
                    {t('booking.cancel')}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
