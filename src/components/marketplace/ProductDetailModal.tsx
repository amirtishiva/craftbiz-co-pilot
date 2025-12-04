import React, { useState } from 'react';
import { Heart, ShoppingCart, MapPin, Star, Clock, Package, Truck, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Product, useMarketplace } from '@/hooks/useMarketplace';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customizationNotes, setCustomizationNotes] = useState('');
  const { addToCart } = useMarketplace();

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
    await addToCart(product.id, quantity, customizationNotes || undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={images[selectedImageIndex]?.image_url || '/placeholder.svg'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold text-foreground">{product.title}</h2>
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.is_customizable && (
                  <Badge variant="outline">Customizable</Badge>
                )}
                {product.seller_profile?.is_verified && (
                  <Badge className="bg-green-500 text-white">Verified</Badge>
                )}
              </div>
            </div>

            {/* Seller Info */}
            {product.seller_profile && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {product.seller_profile.shop_name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{product.seller_profile.shop_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {product.seller_profile.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {product.seller_profile.rating.toFixed(1)}
                      </span>
                    )}
                    {product.seller?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {product.seller.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Story */}
            {product.story && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  The Story Behind This Craft
                </h3>
                <p className="text-muted-foreground text-sm italic leading-relaxed">
                  "{product.story}"
                </p>
              </div>
            )}

            {/* Craft Heritage */}
            {product.craft_heritage && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Craft Heritage</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.craft_heritage}
                </p>
              </div>
            )}

            <Separator />

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.creation_time_hours && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{product.creation_time_hours}+ hours to create</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Made to order'}</span>
              </div>
              {product.materials_used?.length > 0 && (
                <div className="col-span-2 flex items-start gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4 mt-0.5" />
                  <span>Materials: {product.materials_used.join(', ')}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Customization */}
            {product.is_customizable && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Customization Notes</h3>
                <Textarea
                  placeholder="Add any customization requests here..."
                  value={customizationNotes}
                  onChange={(e) => setCustomizationNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
              
              <Button 
                className="flex-1" 
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
