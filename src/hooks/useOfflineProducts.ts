import { useState, useEffect, useCallback } from 'react';
import { cacheProducts, getCachedProducts, isCacheStale, getCacheTimestamp } from '@/utils/offlineStorage';

interface UseOfflineProductsReturn {
  cachedProducts: any[];
  isOffline: boolean;
  isCached: boolean;
  cacheTimestamp: Date | null;
  cacheProductsData: (products: any[]) => Promise<void>;
  loadCachedProducts: () => Promise<any[]>;
}

export const useOfflineProducts = (): UseOfflineProductsReturn => {
  const [cachedProducts, setCachedProducts] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isCached, setIsCached] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached products on mount
  useEffect(() => {
    loadCachedProducts();
  }, []);

  const cacheProductsData = useCallback(async (products: any[]): Promise<void> => {
    if (products.length > 0) {
      await cacheProducts(products);
      setCachedProducts(products);
      setIsCached(true);
    }
  }, []);

  const loadCachedProducts = useCallback(async (): Promise<any[]> => {
    const cached = await getCachedProducts();
    if (cached.length > 0) {
      setCachedProducts(cached);
      setIsCached(true);
    }
    return cached;
  }, []);

  const timestamp = getCacheTimestamp();
  const cacheTimestamp = timestamp ? new Date(timestamp) : null;

  return {
    cachedProducts,
    isOffline,
    isCached,
    cacheTimestamp,
    cacheProductsData,
    loadCachedProducts
  };
};
