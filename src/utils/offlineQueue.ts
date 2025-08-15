// Enhanced IndexedDB-based offline queue for comprehensive offline support
// Stores actions when offline and provides smooth sync when back online

interface QueuedRequest {
  id: number;
  url: string;
  method: string;
  body?: any;
  createdAt: number;
  actionType: 'create' | 'update' | 'delete' | 'enhance';
  resourceType: 'daily_report' | 'weekly_report' | 'general_report' | 'profile' | 'other';
  description: string;
  userFriendlyMessage: string;
  retryCount: number;
  maxRetries: number;
}

interface OfflineAction {
  id: string;
  type: QueuedRequest['actionType'];
  resourceType: QueuedRequest['resourceType'];
  description: string;
  userFriendlyMessage: string;
  timestamp: number;
}

const DB_NAME = 'mipt-offline-db';
const STORE = 'queue';
const VERSION = 2;

// Enhanced database with better structure
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        // Add indexes for better querying
        store.createIndex('actionType', 'actionType', { unique: false });
        store.createIndex('resourceType', 'resourceType', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Add request to offline queue
async function add(payload: Omit<QueuedRequest, 'id' | 'createdAt' | 'retryCount'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    
    const request = store.add({ 
      ...payload, 
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: 3
    });
    
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
    
    tx.oncomplete = () => {
      // Notify user about offline action
      notifyOfflineAction(payload);
    };
  });
}

// Get all queued requests
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

// Get requests by action type
async function getByActionType(actionType: QueuedRequest['actionType']): Promise<QueuedRequest[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const index = store.index('actionType');
    const req = index.getAll(actionType);
    req.onsuccess = () => resolve(req.result as QueuedRequest[]);
    req.onerror = () => reject(req.error);
  });
}

// Get requests by resource type
async function getByResourceType(resourceType: QueuedRequest['resourceType']): Promise<QueuedRequest[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const index = store.index('resourceType');
    const req = index.getAll(resourceType);
    req.onsuccess = () => resolve(req.result as QueuedRequest[]);
    req.onerror = () => reject(req.error);
  });
}

// Clear specific request from queue
async function clear(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Clear all requests
async function clearAll(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Get count of queued requests
async function count(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Enhanced replay with better error handling and user feedback
async function replay(): Promise<{ success: number; failed: number; total: number }> {
  const items = await all();
  let success = 0;
  let failed = 0;
  
  console.log(`🔄 Replaying ${items.length} offline actions...`);
  
  for (const item of items) {
    try {
      // Check if we should retry this request
      if (item.retryCount >= item.maxRetries) {
        console.warn(`⚠️ Skipping request ${item.id} - max retries exceeded`);
        failed++;
        continue;
      }
      
      const response = await fetch(item.url, {
        method: item.method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });
      
      if (response.ok) {
        await clear(item.id);
        success++;
        console.log(`✅ Successfully synced: ${item.description}`);
      } else {
        // Increment retry count
        await incrementRetryCount(item.id);
        failed++;
        console.warn(`⚠️ Failed to sync: ${item.description} (${response.status})`);
      }
    } catch (error) {
      // Increment retry count
      await incrementRetryCount(item.id);
      failed++;
      console.error(`❌ Error syncing: ${item.description}`, error);
    }
  }
  
  const total = items.length;
  console.log(`🔄 Sync complete: ${success} successful, ${failed} failed, ${total} total`);
  
  return { success, failed, total };
}

// Increment retry count for a request
async function incrementRetryCount(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.retryCount++;
        const updateReq = store.put(item);
        updateReq.onsuccess = () => resolve();
        updateReq.onerror = () => reject(updateReq.error);
      } else {
        resolve();
      }
    };
    
    getReq.onerror = () => reject(getReq.error);
  });
}

// Get summary of offline actions for user notification
async function getOfflineActionsSummary(): Promise<OfflineAction[]> {
  const items = await all();
  
  return items.map(item => ({
    id: item.id.toString(),
    type: item.actionType,
    resourceType: item.resourceType,
    description: item.description,
    userFriendlyMessage: item.userFriendlyMessage,
    timestamp: item.createdAt
  }));
}

// Notify user about offline action
function notifyOfflineAction(payload: Omit<QueuedRequest, 'id' | 'createdAt' | 'retryCount'>): void {
  // Dispatch custom event for UI to handle
  window.dispatchEvent(new CustomEvent('offline:action-queued', {
    detail: {
      actionType: payload.actionType,
      resourceType: payload.resourceType,
      description: payload.description,
      userFriendlyMessage: payload.userFriendlyMessage
    }
  }));
}

// Check if there are pending offline actions
async function hasPendingActions(): Promise<boolean> {
  const count = await count();
  return count > 0;
}

// Get user-friendly message for action type
export function getActionMessage(actionType: QueuedRequest['actionType'], resourceType: QueuedRequest['resourceType']): string {
  const resourceNames = {
    daily_report: 'Daily Report',
    weekly_report: 'Weekly Report',
    general_report: 'General Report',
    profile: 'Profile',
    other: 'Data'
  };
  
  const actionMessages = {
    create: `Created ${resourceNames[resourceType]}`,
    update: `Updated ${resourceNames[resourceType]}`,
    delete: `Deleted ${resourceNames[resourceType]}`,
    enhance: `Enhanced ${resourceNames[resourceType]} with AI`
  };
  
  return actionMessages[actionType] || 'Modified data';
}

export const OfflineQueue = { 
  add, 
  replay, 
  all, 
  getByActionType, 
  getByResourceType,
  clear, 
  clearAll, 
  count, 
  hasPendingActions,
  getOfflineActionsSummary
};

// Attach globally for easy access from UI without heavy imports
(window as any).__miptQueue = OfflineQueue;

// Enhanced online/offline detection
let isOnline = navigator.onLine;
let offlineActionsCount = 0;

// Update online status
function updateOnlineStatus(): void {
  const wasOffline = !isOnline;
  isOnline = navigator.onLine;
  
  if (wasOffline && isOnline) {
    console.log('🌐 Connection restored - checking for offline actions...');
    checkAndReplayOfflineActions();
  } else if (!wasOffline && !isOnline) {
    console.log('📴 Connection lost - actions will be queued offline');
    offlineActionsCount = 0;
  }
}

// Check and replay offline actions with user confirmation
async function checkAndReplayOfflineActions(): Promise<void> {
  try {
    const hasActions = await OfflineQueue.hasPendingActions();
    
    if (hasActions) {
      const actions = await OfflineQueue.getOfflineActionsSummary();
      
      // Dispatch event for UI to show sync confirmation
      window.dispatchEvent(new CustomEvent('offline:sync-available', {
        detail: { actions }
      }));
    }
  } catch (error) {
    console.error('Error checking offline actions:', error);
  }
}

// Auto replay on regain connection (with user choice)
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initialize online status
updateOnlineStatus();



















