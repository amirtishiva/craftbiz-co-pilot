// Simple cache utility for offline support
const CACHE_PREFIX = 'craftbiz_';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const cache = {
  set<T>(key: string, data: T): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  },

  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(CACHE_PREFIX + key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      
      // Check if cache is expired
      if (Date.now() - item.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      return null;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.error('Failed to remove cached data:', error);
    }
  },

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  },
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};