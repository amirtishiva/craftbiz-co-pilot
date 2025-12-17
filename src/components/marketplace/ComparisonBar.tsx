import React from 'react';
import { X, GitCompare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/useMarketplace';

interface ComparisonBarProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCompare: () => void;
  maxItems: number;
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({
  products,
  onRemove,
  onClear,
  onCompare,
  maxItems
}) => {
  if (products.length === 0) return null;

  const formatPrice = (price: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-lg z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-xl shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Compare ({products.length}/{maxItems})
          </span>
          <button
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          {products.map((product) => {
            const image = product.product_images?.find(img => img.is_primary)?.image_url 
              || product.product_images?.[0]?.image_url
              || '/placeholder.svg';
            
            return (
              <div 
                key={product.id} 
                className="relative group"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border">
                  <img
                    src={image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => onRemove(product.id)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="text-[10px] text-center mt-0.5 truncate w-14 text-muted-foreground">
                  {formatPrice(product.price)}
                </div>
              </div>
            );
          })}
          
          {/* Empty slots */}
          {Array.from({ length: maxItems - products.length }).map((_, i) => (
            <div 
              key={`empty-${i}`}
              className="w-14 h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center"
            >
              <span className="text-xs text-muted-foreground">+</span>
            </div>
          ))}
        </div>
        
        <Button
          onClick={onCompare}
          className="w-full gap-2"
          size="sm"
          disabled={products.length < 2}
        >
          <GitCompare className="h-4 w-4" />
          Compare {products.length >= 2 ? `(${products.length})` : '- Add more'}
        </Button>
      </div>
    </div>
  );
};

export default ComparisonBar;
