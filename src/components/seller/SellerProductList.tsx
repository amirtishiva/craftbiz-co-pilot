import React, { useState, useEffect } from 'react';
import { Package, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const SellerProductList: React.FC<SellerProductListProps> = ({ onAddProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
        .single();

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

  const toggleProductStatus = async (productId: string, currentStatus: string) => {
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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
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

  if (products.length === 0) {
    return (
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
    );
  }

  return (
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

            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
              >
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
                    <span className="text-xs text-muted-foreground">
                      • {product.stock_quantity} in stock
                    </span>
                  </div>
                </div>

                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleProductStatus(product.id, product.status)}
                    title={product.status === 'active' ? 'Unpublish' : 'Publish'}
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
  );
};

export default SellerProductList;