import React from 'react';
import { X, ShoppingCart, Star, MapPin, Check, Minus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, useMarketplace } from '@/hooks/useMarketplace';
import { useHaptic } from '@/hooks/useHaptic';

interface ProductComparisonModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (productId: string) => void;
}

const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  products,
  isOpen,
  onClose,
  onRemove
}) => {
  const { addToCart } = useMarketplace();
  const haptic = useHaptic();

  const formatPrice = (price: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async (productId: string) => {
    haptic.impact('medium');
    await addToCart(productId);
    haptic.success();
  };

  const CompareRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
        {children}
      </div>
    </div>
  );

  const BooleanIndicator = ({ value }: { value: boolean }) => (
    value ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    )
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
        <DialogHeader className="sticky top-0 bg-background z-10 p-4 border-b border-border">
          <DialogTitle>Compare Products ({products.length})</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          {/* Product Images & Names */}
          <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
            {products.map((product) => {
              const image = product.product_images?.find(img => img.is_primary)?.image_url 
                || product.product_images?.[0]?.image_url
                || '/placeholder.svg';
              
              return (
                <div key={product.id} className="relative">
                  <button
                    onClick={() => onRemove(product.id)}
                    className="absolute -top-1 -right-1 z-10 p-1 rounded-full bg-destructive text-destructive-foreground shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                    <img
                      src={image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                    {product.title}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="space-y-0">
            <CompareRow label="Price">
              {products.map((p) => (
                <span key={p.id} className="text-lg font-bold text-primary">
                  {formatPrice(p.price, p.currency)}
                </span>
              ))}
            </CompareRow>

            <CompareRow label="Category">
              {products.map((p) => (
                <Badge key={p.id} variant="secondary" className="w-fit text-xs">
                  {p.category}
                </Badge>
              ))}
            </CompareRow>

            <CompareRow label="Seller">
              {products.map((p) => (
                <div key={p.id} className="text-sm">
                  <span className="font-medium">{p.seller_profile?.shop_name || 'Unknown'}</span>
                  {p.seller_profile?.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-muted-foreground mt-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {p.seller_profile.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </CompareRow>

            <CompareRow label="Verified Seller">
              {products.map((p) => (
                <BooleanIndicator key={p.id} value={p.seller_profile?.is_verified || false} />
              ))}
            </CompareRow>

            <CompareRow label="Location">
              {products.map((p) => (
                <span key={p.id} className="text-sm text-muted-foreground flex items-center gap-1">
                  {p.seller?.location ? (
                    <>
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{p.seller.location}</span>
                    </>
                  ) : (
                    '-'
                  )}
                </span>
              ))}
            </CompareRow>

            <CompareRow label="Customizable">
              {products.map((p) => (
                <BooleanIndicator key={p.id} value={p.is_customizable || false} />
              ))}
            </CompareRow>

            <CompareRow label="Stock">
              {products.map((p) => (
                <span key={p.id} className={`text-sm ${p.stock_quantity > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {p.stock_quantity > 0 
                    ? p.stock_quantity <= 5 
                      ? `Only ${p.stock_quantity} left` 
                      : 'In Stock'
                    : 'Made to order'}
                </span>
              ))}
            </CompareRow>

            {products.some(p => p.materials_used?.length) && (
              <CompareRow label="Materials">
                {products.map((p) => (
                  <span key={p.id} className="text-sm text-muted-foreground">
                    {p.materials_used?.join(', ') || '-'}
                  </span>
                ))}
              </CompareRow>
            )}

            {products.some(p => p.creation_time_hours) && (
              <CompareRow label="Creation Time">
                {products.map((p) => (
                  <span key={p.id} className="text-sm text-muted-foreground">
                    {p.creation_time_hours ? `${p.creation_time_hours} hours` : '-'}
                  </span>
                ))}
              </CompareRow>
            )}
          </div>

          {/* Add to Cart Buttons */}
          <div className="grid gap-2 mt-4 pt-4 border-t border-border" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
            {products.map((product) => (
              <Button
                key={product.id}
                onClick={() => handleAddToCart(product.id)}
                size="sm"
                className="gap-1"
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductComparisonModal;
