import React, { useState, useEffect } from 'react';
import { Package, Edit, Trash2, Eye, EyeOff, AlertTriangle, AlertCircle, Minus, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInventoryAlerts } from '@/hooks/useInventoryAlerts';

interface SellerProductListProps {
  onAddProduct: () => void;
}

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  stock_quantity: number;
  status: string;
  created_at: string;
  product_images: { image_url: string; is_primary: boolean }[];
}

const LOW_STOCK_THRESHOLD = 5;

const SellerProductList: React.FC<SellerProductListProps> = ({ onAddProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);
  const { toast } = useToast();
  const { alerts, lowStockCount, outOfStockCount, updateStock, checkInventory } = useInventoryAlerts();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) return;

      const { data, error } = await supabase
        .from('products')
        .select(`
          id, title, category, price, stock_quantity, status, created_at,
          product_images(image_url, is_primary)
        `)
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: string, currentStock: number) => {
    // Prevent activating out-of-stock products
    if (currentStatus !== 'active' && currentStock === 0) {
      toast({
        title: 'Cannot publish',
        description: 'Add stock before publishing this product',
        variant: 'destructive'
      });
      return;
    }

    try {
      const newStatus = currentStatus === 'active' ? 'draft' : 'active';
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, status: newStatus } : p
      ));

      toast({
        title: newStatus === 'active' ? 'Product Published' : 'Product Unpublished',
        description: newStatus === 'active' 
          ? 'Your product is now visible to buyers'
          : 'Your product has been hidden from the marketplace'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive'
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: 'Product Deleted',
        description: 'Your product has been removed'
      });
      checkInventory();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  const handleStockEdit = (productId: string, currentStock: number) => {
    setEditingStock(productId);
    setStockValue(currentStock);
  };

  const handleStockSave = async (productId: string) => {
    const success = await updateStock(productId, stockValue);
    if (success) {
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, stock_quantity: stockValue, status: stockValue === 0 ? 'draft' : p.status } 
          : p
      ));
    }
    setEditingStock(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
    if (stock <= LOW_STOCK_THRESHOLD) return { label: 'Low Stock', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
    return { label: 'In Stock', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Inventory Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Inventory Alerts</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  {outOfStockCount > 0 && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {outOfStockCount} out of stock
                    </Badge>
                  )}
                  {lowStockCount > 0 && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {lowStockCount} low stock
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Products with zero stock are automatically moved to draft
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No products yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start listing your handcrafted products to reach customers
            </p>
            <Button onClick={onAddProduct}>
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Products ({products.length})</CardTitle>
            <Button size="sm" onClick={onAddProduct}>
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => {
                const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
                  || product.product_images?.[0]?.image_url
                  || '/placeholder.svg';
                const stockStatus = getStockStatus(product.stock_quantity);
                const isOutOfStock = product.stock_quantity === 0;
                const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= LOW_STOCK_THRESHOLD;

                return (
                  <div
                    key={product.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg ${
                      isOutOfStock 
                        ? 'bg-red-500/5 border border-red-500/20' 
                        : isLowStock 
                          ? 'bg-yellow-500/5 border border-yellow-500/20'
                          : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={primaryImage}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {product.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-semibold text-primary">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Control */}
                    <div className="flex items-center gap-2">
                      {editingStock === product.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setStockValue(Math.max(0, stockValue - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            value={stockValue}
                            onChange={(e) => setStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 h-8 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setStockValue(stockValue + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button size="sm" onClick={() => handleStockSave(product.id)}>
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingStock(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className={`${stockStatus.color} cursor-pointer hover:opacity-80`}
                          onClick={() => handleStockEdit(product.id, product.stock_quantity)}
                        >
                          {product.stock_quantity} in stock
                        </Badge>
                      )}
                    </div>

                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleProductStatus(product.id, product.status, product.stock_quantity)}
                        title={product.status === 'active' ? 'Unpublish' : 'Publish'}
                        disabled={product.status !== 'active' && product.stock_quantity === 0}
                      >
                        {product.status === 'active' ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProduct(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SellerProductList;