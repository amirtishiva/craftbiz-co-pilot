import React, { useState } from 'react';
import { Heart, ShoppingCart, MapPin, Star, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, useMarketplace } from '@/hooks/useMarketplace';
import ProductDetailModal from './ProductDetailModal';
import { useHaptic } from '@/hooks/useHaptic';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, toggleWishlist } = useMarketplace();
  const haptic = useHaptic();

  const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
    || product.product_images?.[0]?.image_url
    || '/placeholder.svg';

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.selection();
    const result = await toggleWishlist(product.id);
    if (result.success) {
      setIsWishlisted(result.isInWishlist);
      haptic.success();
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.impact('medium');
    await addToCart(product.id);
    haptic.success();
  };

  const handleCardClick = () => {
    haptic.tap();
    setIsDetailOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: product.currency || 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <Card 
        className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 border-border native-card"
        onClick={handleCardClick}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Overlay Actions - Hidden on mobile, shown on hover for larger screens */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center gap-2 sm:gap-3">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
              onClick={(e) => {
                e.stopPropagation();
                haptic.tap();
                setIsDetailOpen(true);
              }}
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200 active:scale-90"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Heart 
              className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ${
                isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'
              }`} 
            />
          </button>

          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
            {product.is_customizable && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                Customizable
              </Badge>
            )}
            {product.seller_profile?.is_verified && (
              <Badge className="bg-green-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                Verified
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-2 sm:p-3 lg:p-4">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            
            <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground line-clamp-1">
              {product.category}
            </p>

            {/* Seller Info */}
            {product.seller_profile && (
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                <span className="font-medium truncate">{product.seller_profile.shop_name}</span>
                {product.seller_profile.rating > 0 && (
                  <span className="flex items-center gap-0.5 flex-shrink-0">
                    <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                    {product.seller_profile.rating.toFixed(1)}
                  </span>
                )}
              </div>
            )}

            {/* Location - Hidden on very small screens */}
            {product.seller?.location && (
              <div className="hidden sm:flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="truncate">{product.seller.location}</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between pt-1 sm:pt-2">
              <span className="text-sm sm:text-base lg:text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <span className="text-[9px] sm:text-[10px] lg:text-xs text-orange-500">
                  {product.stock_quantity} left
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductDetailModal
        product={product}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
};

export default ProductCard;
