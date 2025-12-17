import { useState, useCallback, useEffect } from 'react';
import { Product } from './useMarketplace';

const STORAGE_KEY = 'craftbizz_recently_viewed';
const MAX_ITEMS = 20;
const EXPIRY_DAYS = 30;

interface RecentlyViewedItem {
  product: Product;
  viewedAt: number;
}

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount and clean expired items
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const items: RecentlyViewedItem[] = JSON.parse(stored);
        const now = Date.now();
        const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        
        // Filter out expired items
        const validItems = items.filter(item => now - item.viewedAt < expiryTime);
        setRecentlyViewed(validItems);
        
        // Update storage if items were removed
        if (validItems.length !== items.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (recentlyViewed.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);

  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.product.id !== product.id);
      
      // Add to beginning with current timestamp
      const newItems = [{ product, viewedAt: Date.now() }, ...filtered];
      
      // Limit to MAX_ITEMS
      return newItems.slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getRecentProducts = useCallback((limit?: number): Product[] => {
    const products = recentlyViewed.map(item => item.product);
    return limit ? products.slice(0, limit) : products;
  }, [recentlyViewed]);

  return {
    recentlyViewed,
    recentProducts: recentlyViewed.map(item => item.product),
    count: recentlyViewed.length,
    addToRecentlyViewed,
    clearRecentlyViewed,
    getRecentProducts
  };
};
