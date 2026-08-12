/** Offline cache + background sync helpers (IndexedDB-backed queue). */

const DB_NAME = 'barq-offline'
const STORE = 'queue'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function enqueueOfflineRequest(payload: {
  url: string
  method: string
  body?: unknown
}): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add({ ...payload, createdAt: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function flushOfflineQueue(
  sender: (item: { url: string; method: string; body?: unknown }) => Promise<void>,
): Promise<number> {
  const db = await openDb()
  const items = await new Promise<Array<{ id: number; url: string; method: string; body?: unknown }>>(
    (resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).getAll()
      req.onsuccess = () => resolve(req.result as Array<{ id: number; url: string; method: string; body?: unknown }>)
      req.onerror = () => reject(req.error)
    },
  )

  let flushed = 0
  for (const item of items) {
    await sender(item)
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(item.id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    flushed += 1
  }
  return flushed
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}
