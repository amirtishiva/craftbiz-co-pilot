/**
 * Background sync utilities for queuing actions when offline
 */

const DB_NAME = 'craftbiz-sync';
const DB_VERSION = 1;
const SYNC_STORE = 'sync_queue';

export interface SyncAction {
  id: string;
  type: 'add_to_cart' | 'update_cart' | 'remove_from_cart' | 'toggle_wishlist' | 'create_order';
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
}

let syncDb: IDBDatabase | null = null;

/**
 * Initialize the sync database
 */
export const initSyncDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (syncDb) {
      resolve(syncDb);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open sync DB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      syncDb = request.result;
      resolve(syncDb);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains(SYNC_STORE)) {
        const store = database.createObjectStore(SYNC_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
};

/**
 * Generate a unique ID for sync actions
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Queue an action for sync
 */
export const queueSyncAction = async (
  type: SyncAction['type'],
  payload: Record<string, unknown>
): Promise<string> => {
  const database = await initSyncDB();
  const transaction = database.transaction(SYNC_STORE, 'readwrite');
  const store = transaction.objectStore(SYNC_STORE);

  const action: SyncAction = {
    id: generateId(),
    type,
    payload,
    createdAt: Date.now(),
    retryCount: 0
  };

  return new Promise((resolve, reject) => {
    const request = store.add(action);
    request.onsuccess = () => resolve(action.id);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get all pending sync actions
 */
export const getPendingSyncActions = async (): Promise<SyncAction[]> => {
  const database = await initSyncDB();
  const transaction = database.transaction(SYNC_STORE, 'readonly');
  const store = transaction.objectStore(SYNC_STORE);
  const index = store.index('createdAt');

  return new Promise((resolve, reject) => {
    const request = index.getAll();
    request.onsuccess = () => resolve(request.result as SyncAction[]);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Remove a sync action after successful sync
 */
export const removeSyncAction = async (id: string): Promise<void> => {
  const database = await initSyncDB();
  const transaction = database.transaction(SYNC_STORE, 'readwrite');
  const store = transaction.objectStore(SYNC_STORE);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Update retry count for failed sync
 */
export const updateRetryCount = async (id: string): Promise<void> => {
  const database = await initSyncDB();
  const transaction = database.transaction(SYNC_STORE, 'readwrite');
  const store = transaction.objectStore(SYNC_STORE);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const action = getRequest.result as SyncAction;
      if (action) {
        action.retryCount += 1;
        const putRequest = store.put(action);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

/**
 * Clear all sync actions (use after successful full sync)
 */
export const clearSyncQueue = async (): Promise<void> => {
  const database = await initSyncDB();
  const transaction = database.transaction(SYNC_STORE, 'readwrite');
  const store = transaction.objectStore(SYNC_STORE);

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get count of pending actions
 */
export const getPendingCount = async (): Promise<number> => {
  const database = await initSyncDB();
  const transaction = database.transaction(SYNC_STORE, 'readonly');
  const store = transaction.objectStore(SYNC_STORE);

  return new Promise((resolve, reject) => {
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
