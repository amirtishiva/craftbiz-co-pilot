import React, { useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMarketplace } from '@/hooks/useMarketplace';

interface ShoppingCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCartDrawer: React.FC<ShoppingCartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, fetchCart, updateCartItem, removeFromCart } = useMarketplace();

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen, fetchCart]);

  const subtotal = cart.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + (price * item.quantity);
  }, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({cart.length})
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Your cart is empty
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Discover unique handcrafted products from skilled artisans
            </p>
            <Button onClick={onClose} className="mt-4">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item) => {
                const product = item.product;
                if (!product) return null;

                const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
                  || product.product_images?.[0]?.image_url
                  || '/placeholder.svg';

                return (
                  <div key={item.id} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={primaryImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground line-clamp-2 text-sm">
                        {product.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.category}
                      </p>
                      
                      {item.customization_notes && (
                        <p className="text-xs text-primary mt-1 italic">
                          Note: {item.customization_notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-md">
                          <button
                            onClick={() => updateCartItem(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItem(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">
                            {formatPrice(product.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>

              <Button className="w-full" size="lg" disabled>
                Proceed to Checkout (Coming Soon)
              </Button>
              
              <Button variant="outline" className="w-full" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCartDrawer;
