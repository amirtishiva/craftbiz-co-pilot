import React, { useState } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { Product } from '@/hooks/useMarketplace';
import ProductCard from './ProductCard';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onRefresh?: () => Promise<void> | void;
  enablePullToRefresh?: boolean;
  wishlistProductIds?: Set<string>;
  onToggleWishlist?: (productId: string) => Promise<void>;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  isLoading, 
  onRefresh,
  enablePullToRefresh = false,
  wishlistProductIds,
  onToggleWishlist
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const { containerRef, pullDistance, pullProgress, isRefreshing: isPulling } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: !enablePullToRefresh || isLoading,
    threshold: 80
  });

  if (isLoading && !isRefreshing) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-muted rounded w-3/4" />
              <div className="h-2.5 sm:h-3 bg-muted rounded w-1/2" />
              <div className="h-4 sm:h-6 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center px-4">
        <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          No products found
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md">
          Be the first to list your handcrafted products on the marketplace!
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto"
    >
      {/* Pull to refresh indicator - mobile only */}
      {enablePullToRefresh && (
        <div 
          className="sm:hidden absolute left-0 right-0 flex items-center justify-center transition-all duration-200 overflow-hidden"
          style={{ 
            height: pullDistance,
            top: -pullDistance,
            opacity: pullProgress
          }}
        >
          <div 
            className={`flex items-center gap-2 text-sm text-muted-foreground ${isPulling ? 'animate-spin' : ''}`}
            style={{
              transform: `rotate(${pullProgress * 360}deg)`
            }}
          >
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
      )}
      
      {/* Refreshing overlay */}
      {isRefreshing && (
        <div className="sm:hidden flex items-center justify-center py-3 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          Refreshing...
        </div>
      )}

      <div 
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance > 0 ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            isWishlisted={wishlistProductIds?.has(product.id) || false}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
