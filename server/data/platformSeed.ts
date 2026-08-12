import { randomUUID } from 'node:crypto'
import type { BranchRecord, Database } from '../types.js'

export const BRANCH_SEEDS: Omit<BranchRecord, 'id'>[] = [
  {
    name: 'BARQ Riyadh — Narjis',
    city: 'Riyadh',
    address: 'Anas Ibn Malik Rd, Al Narjis',
    phone: '+966920000001',
    lat: 24.8301,
    lng: 46.6558,
    hours: 'Sat–Thu 9:00–22:00',
    geofenceRadiusM: 250,
  },
  {
    name: 'BARQ Jeddah — Corniche',
    city: 'Jeddah',
    address: 'Prince Sultan St, Ash Shati',
    phone: '+966920000002',
    lat: 21.5858,
    lng: 39.1202,
    hours: 'Sat–Thu 9:00–22:00',
    geofenceRadiusM: 300,
  },
  {
    name: 'BARQ Khobar — North',
    city: 'Khobar',
    address: 'Pepsi St, Northern Khobar',
    phone: '+966920000003',
    lat: 26.2866,
    lng: 50.2083,
    hours: 'Sat–Thu 9:00–22:00',
    geofenceRadiusM: 200,
  },
  {
    name: 'BARQ Dammam — Tiba',
    city: 'Dammam',
    address: 'King Fahd Rd, Tiba',
    phone: '+966920000004',
    lat: 26.4207,
    lng: 50.0888,
    hours: 'Sat–Thu 9:00–22:00',
    geofenceRadiusM: 220,
  },
]

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Riyadh: { lat: 24.7136, lng: 46.6753 },
  Jeddah: { lat: 21.4858, lng: 39.1925 },
  Khobar: { lat: 26.2172, lng: 50.1971 },
  Dammam: { lat: 26.4207, lng: 50.0888 },
  Remote: { lat: 24.7136, lng: 46.6753 },
}

export function coordsForCity(city: string): { lat: number; lng: number } {
  return CITY_COORDS[city] ?? CITY_COORDS.Riyadh
}

export function seedPlatformCollections(db: Database): void {
  for (const seed of BRANCH_SEEDS) {
    db.branches.push({ ...seed, id: randomUUID() })
  }

  db.featureFlags = {
    maps: true,
    liveTracking: true,
    payments: true,
    videoCall: true,
    aiChat: true,
    offlineMode: true,
    multiCurrency: true,
    subscriptions: true,
    heatMaps: true,
    clustering: true,
  }
}
