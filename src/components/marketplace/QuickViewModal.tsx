import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, MapPin, X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, useMarketplace } from '@/hooks/useMarketplace';
import { useHaptic } from '@/hooks/useHaptic';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFull: () => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onViewFull,
  isWishlisted,
  onToggleWishlist
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useMarketplace();
  const haptic = useHaptic();

  if (!product) return null;

  const images = product.product_images?.length 
    ? product.product_images.sort((a, b) => a.display_order - b.display_order)
    : [{ id: '1', image_url: '/placeholder.svg', is_primary: true, display_order: 0, product_id: product.id }];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: product.currency || 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async () => {
    haptic.impact('medium');
    await addToCart(product.id, quantity);
    haptic.success();
    onClose();
  };

  const handleWishlistClick = () => {
    haptic.selection();
    onToggleWishlist();
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-square bg-muted">
            <img
              src={images[selectedImageIndex]?.image_url || '/placeholder.svg'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                {/* Image Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === selectedImageIndex ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.is_customizable && (
                <Badge variant="secondary" className="text-xs">Customizable</Badge>
              )}
              {product.seller_profile?.is_verified && (
                <Badge className="bg-green-500 text-white text-xs">Verified</Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-all shadow-sm"
            >
              <Heart 
                className={`h-5 w-5 transition-all ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`} 
              />
            </button>
          </div>

          {/* Info Section */}
          <div className="p-4 sm:p-5 flex flex-col">
            <div className="flex-1 space-y-3">
              {/* Title & Category */}
              <div>
                <Badge variant="outline" className="mb-2 text-xs">
                  {product.category}
                </Badge>
                <h2 className="text-lg font-bold text-foreground line-clamp-2">
                  {product.title}
                </h2>
              </div>

              {/* Seller Info */}
              {product.seller_profile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{product.seller_profile.shop_name}</span>
                  {product.seller_profile.rating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {product.seller_profile.rating.toFixed(1)}
                    </span>
                  )}
                  {product.seller?.location && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[100px]">{product.seller.location}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Stock Status */}
              <div className="text-sm">
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600">
                    {product.stock_quantity <= 5 
                      ? `Only ${product.stock_quantity} left!` 
                      : 'In Stock'}
                  </span>
                ) : (
                  <span className="text-orange-600">Made to order</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-3">
              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
                
                <Button 
                  className="flex-1" 
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* View Full Details */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  onClose();
                  onViewFull();
                }}
              >
                <Expand className="h-4 w-4 mr-2" />
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
