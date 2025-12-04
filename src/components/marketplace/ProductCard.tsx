import React, { useState } from 'react';
import { Heart, ShoppingCart, MapPin, Star, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, useMarketplace } from '@/hooks/useMarketplace';
import ProductDetailModal from './ProductDetailModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, toggleWishlist } = useMarketplace();

  const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
    || product.product_images?.[0]?.image_url
    || '/placeholder.svg';

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await toggleWishlist(product.id);
    if (result.success) {
      setIsWishlisted(result.isInWishlist);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product.id);
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
        className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 border-border"
        onClick={() => setIsDetailOpen(true)}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailOpen(true);
              }}
            >
              <Eye className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart 
              className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_customizable && (
              <Badge variant="secondary" className="text-xs">
                Customizable
              </Badge>
            )}
            {product.seller_profile?.is_verified && (
              <Badge className="bg-green-500 text-white text-xs">
                Verified Artisan
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-1">
              {product.category}
            </p>

            {/* Seller Info */}
            {product.seller_profile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{product.seller_profile.shop_name}</span>
                {product.seller_profile.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {product.seller_profile.rating.toFixed(1)}
                  </span>
                )}
              </div>
            )}

            {/* Location */}
            {product.seller?.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {product.seller.location}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <span className="text-xs text-orange-500">
                  Only {product.stock_quantity} left
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
