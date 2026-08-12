import { apiClient } from '@/shared/api/apiClient'

export interface Branch {
  id: string
  name: string
  city: string
  address: string
  phone: string
  lat: number
  lng: number
  hours: string
  geofenceRadiusM: number
}

export interface MapProvider {
  id: string
  title: string
  city: string
  lat: number
  lng: number
  specialty: string
  price: number
  currency: string
}

export const mapsApi = {
  branches: async () => {
    const { data } = await apiClient.get<{ items: Branch[] }>('/maps/branches')
    return data.items
  },
  providers: async () => {
    const { data } = await apiClient.get<{ items: MapProvider[] }>('/maps/providers')
    return data.items
  },
  clusters: async (zoom: number) => {
    const { data } = await apiClient.get<{
      type: string
      items: Array<{ lat: number; lng: number; count?: number; city?: string; title?: string; id?: string }>
    }>('/maps/clusters', { params: { zoom } })
    return data
  },
  heatmap: async () => {
    const { data } = await apiClient.get<{ points: Array<{ lat: number; lng: number; weight: number }> }>(
      '/maps/heatmap',
    )
    return data.points
  },
  reverseGeocode: async (lat: number, lng: number) => {
    const { data } = await apiClient.post<{ displayName: string; provider: string }>(
      '/maps/geocode/reverse',
      { lat, lng },
    )
    return data
  },
  distanceMatrix: async (
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
  ) => {
    const { data } = await apiClient.post<{
      rows: Array<{ elements: Array<{ distanceKm: number; durationMin: number }> }>
    }>('/maps/distance-matrix', { origins, destinations })
    return data
  },
  route: async (from: { lat: number; lng: number }, to: { lat: number; lng: number }, optimize = true) => {
    const { data } = await apiClient.post<{
      distanceKm: number
      durationMin: number
      eta: string
      geometry: Array<{ lat: number; lng: number }>
      optimized: boolean
    }>('/maps/route', { from, to, optimize })
    return data
  },
  geofenceCheck: async (lat: number, lng: number) => {
    const { data } = await apiClient.post<{
      results: Array<{ branchId: string; name: string; inside: boolean; distanceM: number }>
    }>('/maps/geofence/check', { lat, lng })
    return data.results
  },
  eta: async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    const { data } = await apiClient.post<{ distanceKm: number; durationMin: number; eta: string }>(
      '/maps/eta',
      { from, to },
    )
    return data
  },
  pushTrack: async (payload: { lat: number; lng: number; heading?: number; speed?: number }) => {
    const { data } = await apiClient.post('/maps/tracking', payload)
    return data
  },
}
