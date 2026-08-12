import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Circle, useMapEvents } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { mapsApi } from '@/features/maps/api/mapsApi'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { config } from '@/shared/config/env'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import { getSocket } from '@/shared/realtime/socket'
import styles from '@/features/platform/pages/Platform.module.scss'
import 'leaflet/dist/leaflet.css'

// Leaflet default icon paths break under Vite bundling
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function MapsPage() {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null)
  const [routeGeom, setRouteGeom] = useState<Array<{ lat: number; lng: number }>>([])
  const [routeMeta, setRouteMeta] = useState<string>('')
  const [geocode, setGeocode] = useState<string>('')
  const [live, setLive] = useState<Array<{ userId: string; lat: number; lng: number }>>([])
  const [matrixLine, setMatrixLine] = useState('')
  const [fenceLine, setFenceLine] = useState('')

  const branchesQuery = useQuery({
    queryKey: QUERY_KEYS.maps.branches,
    queryFn: mapsApi.branches,
  })
  const providersQuery = useQuery({
    queryKey: QUERY_KEYS.maps.providers,
    queryFn: mapsApi.providers,
  })
  const heatmapQuery = useQuery({
    queryKey: QUERY_KEYS.maps.heatmap,
    queryFn: mapsApi.heatmap,
  })
  const clustersQuery = useQuery({
    queryKey: QUERY_KEYS.maps.clusters(10),
    queryFn: () => mapsApi.clusters(10),
  })

  useEffect(() => {
    const socket = getSocket()
    const onLive = (payload: { userId: string; lat: number; lng: number }) => {
      setLive((prev) => {
        const next = prev.filter((p) => p.userId !== payload.userId)
        next.push(payload)
        return next.slice(-20)
      })
    }
    socket.on('tracking:live', onLive)
    return () => {
      socket.off('tracking:live', onLive)
    }
  }, [])

  const center = useMemo(() => {
    const first = branchesQuery.data?.[0]
    return first ? ([first.lat, first.lng] as [number, number]) : ([24.7136, 46.6753] as [number, number])
  }, [branchesQuery.data])

  const tileUrl = config.mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${config.mapboxToken}`
    : config.mapTileUrl

  const runRoute = async () => {
    if (!picked || !branchesQuery.data?.[0]) return
    const to = branchesQuery.data[0]
    const route = await mapsApi.route(picked, { lat: to.lat, lng: to.lng }, true)
    setRouteGeom(route.geometry)
    setRouteMeta(
      t('maps.routeMeta', {
        km: route.distanceKm,
        min: route.durationMin,
        eta: new Date(route.eta).toLocaleTimeString(),
      }),
    )
    const eta = await mapsApi.eta(picked, { lat: to.lat, lng: to.lng })
    setRouteMeta((prev) => `${prev} · ETA ${new Date(eta.eta).toLocaleTimeString()}`)
  }

  const runReverse = async () => {
    if (!picked) return
    const result = await mapsApi.reverseGeocode(picked.lat, picked.lng)
    setGeocode(result.displayName)
  }

  const runMatrix = async () => {
    if (!picked || !branchesQuery.data?.length) return
    const matrix = await mapsApi.distanceMatrix(
      [picked],
      branchesQuery.data.slice(0, 4).map((b) => ({ lat: b.lat, lng: b.lng })),
    )
    const parts = matrix.rows[0]?.elements.map(
      (el, i) => `${branchesQuery.data![i]?.city}: ${el.distanceKm}km / ${el.durationMin}m`,
    )
    setMatrixLine(parts?.join(' · ') ?? '')
  }

  const runGeofence = async () => {
    if (!picked) return
    const results = await mapsApi.geofenceCheck(picked.lat, picked.lng)
    setFenceLine(
      results
        .map((r) => `${r.name}: ${r.inside ? t('maps.inside') : t('maps.outside')} (${r.distanceM}m)`)
        .join(' · '),
    )
  }

  const startTracking = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const payload = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        heading: pos.coords.heading ?? 0,
        speed: pos.coords.speed ?? 0,
      }
      setPicked({ lat: payload.lat, lng: payload.lng })
      void mapsApi.pushTrack(payload)
      getSocket().emit('tracking:update', payload)
    })
  }

  if (branchesQuery.isLoading || providersQuery.isLoading) return <Spinner />
  if (branchesQuery.isError) {
    return (
      <StateMessage
        tone="error"
        title={t('errors.generic')}
        onAction={() => void branchesQuery.refetch()}
      />
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.maps')}</p>
        <h1>{t('maps.title')}</h1>
        <p>{t('maps.subtitle')}</p>
      </header>

      <div className={styles.grid2}>
        <div className={styles.panel}>
          <div className={styles.mapShell}>
            <MapContainer center={center} zoom={6} scrollWheelZoom>
              <TileLayer attribution='&copy; OpenStreetMap / Mapbox' url={tileUrl} />
              <ClickCapture onPick={(lat, lng) => setPicked({ lat, lng })} />
              {branchesQuery.data?.map((branch) => (
                <Marker key={branch.id} position={[branch.lat, branch.lng]}>
                  <Popup>
                    <strong>{branch.name}</strong>
                    <br />
                    {branch.address}
                  </Popup>
                </Marker>
              ))}
              {branchesQuery.data?.map((branch) => (
                <Circle
                  key={`g-${branch.id}`}
                  center={[branch.lat, branch.lng]}
                  radius={branch.geofenceRadiusM}
                  pathOptions={{ color: '#00a3b5', fillOpacity: 0.08 }}
                />
              ))}
              {providersQuery.data?.map((p) => (
                <Circle
                  key={p.id}
                  center={[p.lat, p.lng]}
                  radius={80}
                  pathOptions={{ color: '#f07a3a', fillOpacity: 0.35 }}
                />
              ))}
              {heatmapQuery.data?.map((p, i) => (
                <Circle
                  key={`h-${i}`}
                  center={[p.lat, p.lng]}
                  radius={120 * p.weight}
                  pathOptions={{ color: '#c0392b', fillOpacity: 0.12, weight: 0 }}
                />
              ))}
              {picked ? <Marker position={[picked.lat, picked.lng]} /> : null}
              {routeGeom.length ? (
                <Polyline positions={routeGeom.map((p) => [p.lat, p.lng] as [number, number])} />
              ) : null}
              {live.map((p) => (
                <Marker key={p.userId} position={[p.lat, p.lng]}>
                  <Popup>{t('maps.liveUser', { id: p.userId.slice(0, 8) })}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <h2>{t('maps.tools')}</h2>
            <p className={styles.muted}>{t('maps.clickHint')}</p>
            <div className={styles.actions}>
              <Button type="button" onClick={() => void runRoute()} disabled={!picked}>
                {t('maps.routeNav')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void runReverse()} disabled={!picked}>
                {t('maps.reverse')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void runMatrix()} disabled={!picked}>
                {t('maps.matrix')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void runGeofence()} disabled={!picked}>
                {t('maps.geofence')}
              </Button>
              <Button type="button" variant="secondary" onClick={startTracking}>
                {t('maps.liveTrack')}
              </Button>
            </div>
            {routeMeta ? <p>{routeMeta}</p> : null}
            {geocode ? <p>{geocode}</p> : null}
            {matrixLine ? <p>{matrixLine}</p> : null}
            {fenceLine ? <p>{fenceLine}</p> : null}
          </div>

          <div className={styles.panel}>
            <h3>{t('maps.clusters')}</h3>
            <ul className={styles.list}>
              {clustersQuery.data?.items.map((item, index) => (
                <li key={index} className={styles.listItem}>
                  <span>{item.city ?? item.title ?? 'Point'}</span>
                  <strong>{item.count ?? 1}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
