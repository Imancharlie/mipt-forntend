// Simple IndexedDB-based offline queue for POST requests
// Stores payloads when offline and replays them when online

interface QueuedRequest {
  id: number;
  url: string;
  method: string;
  body?: any;
  createdAt: number;
}

const DB_NAME = 'mipt-offline-db';
const STORE = 'queue';
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function add(payload: Omit<QueuedRequest, 'id' | 'createdAt'>) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    store.add({ ...payload, createdAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function all(): Promise<QueuedRequest[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as QueuedRequest[]);
    req.onerror = () => reject(req.error);
  });
}

async function clear(id: number) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function replay() {
  const items = await all();
  for (const item of items) {
    try {
      const resp = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });
      if (resp.ok) {
        await clear((item as any).id);
      }
    } catch {
      // keep in queue
    }
  }
}

export const OfflineQueue = { add, replay };

// Attach globally for easy access from UI without heavy imports
(window as any).__miptQueue = OfflineQueue;

// Auto replay on regain connection
window.addEventListener('online', () => {
  OfflineQueue.replay();
});



