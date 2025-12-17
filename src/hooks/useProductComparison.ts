import { useState, useCallback, useEffect } from 'react';
import { Product } from './useMarketplace';

const STORAGE_KEY = 'craftbizz_comparison_products';
const MAX_COMPARISON_ITEMS = 4;

export const useProductComparison = () => {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setComparisonProducts(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage when products change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonProducts));
  }, [comparisonProducts]);

  const addToComparison = useCallback((product: Product): boolean => {
    if (comparisonProducts.length >= MAX_COMPARISON_ITEMS) {
      return false;
    }
    if (comparisonProducts.some(p => p.id === product.id)) {
      return false;
    }
    setComparisonProducts(prev => [...prev, product]);
    return true;
  }, [comparisonProducts]);

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const toggleComparison = useCallback((product: Product): { success: boolean; isInComparison: boolean } => {
    const isIn = comparisonProducts.some(p => p.id === product.id);
    if (isIn) {
      removeFromComparison(product.id);
      return { success: true, isInComparison: false };
    } else {
      if (comparisonProducts.length >= MAX_COMPARISON_ITEMS) {
        return { success: false, isInComparison: false };
      }
      addToComparison(product);
      return { success: true, isInComparison: true };
    }
  }, [comparisonProducts, addToComparison, removeFromComparison]);

  const clearComparison = useCallback(() => {
    setComparisonProducts([]);
  }, []);

  const isInComparison = useCallback((productId: string): boolean => {
    return comparisonProducts.some(p => p.id === productId);
  }, [comparisonProducts]);

  return {
    comparisonProducts,
    comparisonCount: comparisonProducts.length,
    maxItems: MAX_COMPARISON_ITEMS,
    addToComparison,
    removeFromComparison,
    toggleComparison,
    clearComparison,
    isInComparison,
    canAddMore: comparisonProducts.length < MAX_COMPARISON_ITEMS
  };
};
