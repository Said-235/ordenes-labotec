import { openDB } from 'idb'

const DB_NAME = 'labotec-ordenes'
const STORE = 'pending'
const VERSION = 1

function openQueue() {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    },
  })
}

export async function enqueuePending(orden) {
  const db = await openQueue()
  await db.put(STORE, { ...orden, pending: true })
}

export async function listPending() {
  try {
    const db = await openQueue()
    return await db.getAll(STORE)
  } catch (err) {
    console.error('[offlineQueue] listPending:', err)
    return []
  }
}

export async function removePending(id) {
  const db = await openQueue()
  await db.delete(STORE, id)
}

export async function countPending() {
  const db = await openQueue()
  return db.count(STORE)
}
