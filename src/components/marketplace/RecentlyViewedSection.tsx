import React, { useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/hooks/useMarketplace';

interface RecentlyViewedSectionProps {
  products: Product[];
  onClear: () => void;
  onProductClick: (product: Product) => void;
  wishlistProductIds?: Set<string>;
}

const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  products,
  onClear,
  onProductClick,
  wishlistProductIds
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const formatPrice = (price: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(price);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Recently Viewed</h3>
          <span className="text-sm text-muted-foreground">({products.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1"
            onClick={onClear}
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
      >
        {products.slice(0, 10).map((product) => {
          const image = product.product_images?.find(img => img.is_primary)?.image_url 
            || product.product_images?.[0]?.image_url
            || '/placeholder.svg';
          
          return (
            <Card
              key={product.id}
              className="flex-shrink-0 w-32 sm:w-36 cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => onProductClick(product)}
            >
              <div className="aspect-square bg-muted relative">
                <img
                  src={image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {wishlistProductIds?.has(product.id) && (
                  <div className="absolute top-1 right-1 p-1 rounded-full bg-red-500">
                    <span className="text-white text-[8px]">♥</span>
                  </div>
                )}
              </div>
              <CardContent className="p-2">
                <h4 className="text-xs font-medium text-foreground line-clamp-1">
                  {product.title}
                </h4>
                <p className="text-sm font-bold text-primary mt-0.5">
                  {formatPrice(product.price, product.currency)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyViewedSection;
