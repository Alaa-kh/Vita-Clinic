import { useQuery } from '@tanstack/react-query'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { ordersApi } from '@/features/shop/api/shopApi'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { config } from '@/shared/config/env'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import styles from '@/features/shop/pages/Shop.module.scss'
import 'leaflet/dist/leaflet.css'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export function TrackOrderPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const trackQuery = useQuery({
    queryKey: QUERY_KEYS.orders.track(id),
    queryFn: () => ordersApi.track(id),
    enabled: Boolean(id),
    refetchInterval: 8_000,
  })

  if (trackQuery.isLoading) return <Spinner />
  if (trackQuery.isError || !trackQuery.data) {
    return <StateMessage tone="error" title={t('errors.generic')} />
  }

  const { order, courier, store, dropoff } = trackQuery.data
  const center: [number, number] = courier
    ? [courier.lat, courier.lng]
    : [store.lat, store.lng]
  const route = [
    [store.lat, store.lng] as [number, number],
    ...(courier ? [[courier.lat, courier.lng] as [number, number]] : []),
    [dropoff.lat, dropoff.lng] as [number, number],
  ]

  return (
    <div className={`container ${styles.page}`} style={{ paddingTop: '2rem' }}>
      <header>
        <p className={styles.eyebrow}>{t('track.eyebrow')}</p>
        <h1>{t('track.title')}</h1>
        <p className={styles.muted}>
          {t('track.status', { status: order.status, eta: order.etaMinutes })}
        </p>
      </header>

      <div className={styles.cartLayout}>
        <div className={styles.mapShell}>
          <MapContainer center={center} zoom={12} scrollWheelZoom>
            <TileLayer attribution="&copy; OSM" url={config.mapTileUrl} />
            <Marker position={[store.lat, store.lng]}>
              <Popup>{store.name}</Popup>
            </Marker>
            <Marker position={[dropoff.lat, dropoff.lng]}>
              <Popup>{dropoff.address}</Popup>
            </Marker>
            {courier ? (
              <Marker position={[courier.lat, courier.lng]}>
                <Popup>{t('track.courier')}</Popup>
              </Marker>
            ) : null}
            <Polyline positions={route} pathOptions={{ color: '#00a3b5' }} />
          </MapContainer>
        </div>

        <aside className={styles.panel}>
          <h2>#{order.id.slice(0, 8)}</h2>
          <p>
            {order.total} {order.currency}
          </p>
          <p className={styles.muted}>{order.deliveryAddress}</p>
          <ul style={{ paddingLeft: '1.1rem' }}>
            {order.items.map((item) => (
              <li key={item.productId}>
                {item.title} × {item.quantity}
              </li>
            ))}
          </ul>
          <p className={styles.muted}>
            {t('track.etaAt', { time: new Date(order.etaAt).toLocaleTimeString() })}
          </p>
        </aside>
      </div>
    </div>
  )
}
