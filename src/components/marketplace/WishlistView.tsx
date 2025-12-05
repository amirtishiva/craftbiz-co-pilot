import React from 'react';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/useMarketplace';
import ProductCard from './ProductCard';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

interface WishlistViewProps {
  wishlistItems: WishlistItem[];
  wishlistProductIds: Set<string>;
  onToggleWishlist: (productId: string) => Promise<void>;
  onBack: () => void;
}

const WishlistView: React.FC<WishlistViewProps> = ({
  wishlistItems,
  wishlistProductIds,
  onToggleWishlist,
  onBack
}) => {
  const validProducts = wishlistItems
    .filter(item => item.product)
    .map(item => item.product as Product);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-sm text-muted-foreground">
            {validProducts.length} {validProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {/* Empty State */}
      {validProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Save items you love by tapping the heart icon on products. They'll appear here for easy access.
          </p>
          <Button onClick={onBack}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {validProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistProductIds.has(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistView;
