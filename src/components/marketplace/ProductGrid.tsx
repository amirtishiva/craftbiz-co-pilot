import React from 'react';
import { Package } from 'lucide-react';
import { Product } from '@/hooks/useMarketplace';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onRefresh?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading, onRefresh }) => {
  if (isLoading) {
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
