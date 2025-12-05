/**
 * Offline storage utilities using IndexedDB for product caching
 */

const DB_NAME = 'craftbiz-offline';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const CACHE_TIMESTAMP_KEY = 'products_cache_timestamp';

interface CachedProduct {
  id: string;
  data: any;
  cachedAt: number;
}

let db: IDBDatabase | null = null;

/**
 * Initialize the IndexedDB database
 */
export const initOfflineDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create products store
      if (!database.objectStoreNames.contains(PRODUCTS_STORE)) {
        const store = database.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
    };
  });
};

/**
 * Cache products for offline access
 */
export const cacheProducts = async (products: any[]): Promise<void> => {
  try {
    const database = await initOfflineDB();
    const transaction = database.transaction(PRODUCTS_STORE, 'readwrite');
    const store = transaction.objectStore(PRODUCTS_STORE);
    const now = Date.now();

    // Clear old cache
    store.clear();

    // Add new products
    for (const product of products) {
      const cachedProduct: CachedProduct = {
        id: product.id,
        data: product,
        cachedAt: now
      };
      store.put(cachedProduct);
    }

    // Store cache timestamp
    localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Failed to cache products:', error);
  }
};

/**
 * Get cached products for offline viewing
 */
export const getCachedProducts = async (): Promise<any[]> => {
  try {
    const database = await initOfflineDB();
    const transaction = database.transaction(PRODUCTS_STORE, 'readonly');
    const store = transaction.objectStore(PRODUCTS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cachedProducts = request.result as CachedProduct[];
        resolve(cachedProducts.map(cp => cp.data));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get cached products:', error);
    return [];
  }
};

/**
 * Get cache timestamp
 */
export const getCacheTimestamp = (): number | null => {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  return timestamp ? parseInt(timestamp, 10) : null;
};

/**
 * Check if cache is stale (older than 1 hour)
 */
export const isCacheStale = (): boolean => {
  const timestamp = getCacheTimestamp();
  if (!timestamp) return true;
  
  const ONE_HOUR = 60 * 60 * 1000;
  return Date.now() - timestamp > ONE_HOUR;
};

/**
 * Clear all cached data
 */
export const clearCache = async (): Promise<void> => {
  try {
    const database = await initOfflineDB();
    const transaction = database.transaction(PRODUCTS_STORE, 'readwrite');
    const store = transaction.objectStore(PRODUCTS_STORE);
    store.clear();
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};
