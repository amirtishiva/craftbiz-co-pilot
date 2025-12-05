import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queueSyncAction } from '@/utils/backgroundSync';

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  story: string | null;
  craft_heritage: string | null;
  category: string;
  price: number;
  ai_suggested_price: number | null;
  currency: string;
  stock_quantity: number;
  status: string;
  is_customizable: boolean;
  customization_options: any;
  materials_used: string[] | null;
  creation_time_hours: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
  seller?: any;
  seller_profile?: any;
  distance?: number | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  shop_name: string;
  shop_tagline: string | null;
  artisan_story: string | null;
  craft_specialty: string[] | null;
  years_of_experience: number | null;
  social_links: any;
  is_verified: boolean;
  rating: number;
  total_sales: number;
  latitude: number | null;
  longitude: number | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  customization_notes: string | null;
  product?: Product;
}

interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export const useMarketplace = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const isOnline = () => navigator.onLine;

  const searchProducts = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-products', {
        body: params
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setProducts(data.data);
      return { success: true, data: data.data, count: data.count };
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search products",
        variant: "destructive",
      });
      return { success: false, data: [], count: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateProductListing = useCallback(async (params: {
    productName: string;
    category: string;
    imageBase64?: string;
    craftType?: string;
    materials?: string;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-listing', {
        body: params
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Listing Generated",
        description: "AI has created your product listing",
      });

      return { success: true, data: data.data };
    } catch (error: any) {
      console.error('Generate listing error:', error);
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate listing",
        variant: "destructive",
      });
      return { success: false, data: null };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchCart = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            *,
            product_images(*)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCart(data || []);
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity: number = 1, customizationNotes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to add items to cart",
          variant: "destructive",
        });
        return { success: false };
      }

      // Queue for sync if offline
      if (!isOnline()) {
        await queueSyncAction('add_to_cart', { productId, quantity, customizationNotes });
        toast({
          title: "Queued for sync",
          description: "Item will be added when you're back online",
        });
        return { success: true };
      }

      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: productId,
          quantity,
          customization_notes: customizationNotes || null
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) throw error;

      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      });

      await fetchCart();
      return { success: true };
    } catch (error: any) {
      console.error('Add to cart error:', error);
      
      // Queue for sync on network error
      if (!isOnline()) {
        await queueSyncAction('add_to_cart', { productId, quantity, customizationNotes });
        toast({
          title: "Queued for sync",
          description: "Item will be added when you're back online",
        });
        return { success: true };
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [toast, fetchCart]);

  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    try {
      // Queue for sync if offline
      if (!isOnline()) {
        await queueSyncAction('update_cart', { itemId, quantity });
        toast({
          title: "Queued for sync",
          description: "Cart will update when you're back online",
        });
        return { success: true };
      }

      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
        if (error) throw error;
      }

      await fetchCart();
      return { success: true };
    } catch (error: any) {
      console.error('Update cart error:', error);
      
      // Queue for sync on network error
      if (!isOnline()) {
        await queueSyncAction('update_cart', { itemId, quantity });
        toast({
          title: "Queued for sync",
          description: "Cart will update when you're back online",
        });
        return { success: true };
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to update cart",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [toast, fetchCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    return updateCartItem(itemId, 0);
  }, [updateCartItem]);

  const toggleWishlist = useCallback(async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save items",
          variant: "destructive",
        });
        return { success: false, isInWishlist: false };
      }

      // Queue for sync if offline
      if (!isOnline()) {
        await queueSyncAction('toggle_wishlist', { productId });
        toast({
          title: "Queued for sync",
          description: "Wishlist will update when you're back online",
        });
        return { success: true, isInWishlist: true };
      }

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Remove from wishlist
        await supabase
          .from('wishlists')
          .delete()
          .eq('id', existing.id);
        
        toast({ title: "Removed from wishlist" });
        return { success: true, isInWishlist: false };
      } else {
        // Add to wishlist
        await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: productId });
        
        toast({ title: "Added to wishlist" });
        return { success: true, isInWishlist: true };
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      
      // Queue for sync on network error
      if (!isOnline()) {
        await queueSyncAction('toggle_wishlist', { productId });
        toast({
          title: "Queued for sync",
          description: "Wishlist will update when you're back online",
        });
        return { success: true, isInWishlist: true };
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
      return { success: false, isInWishlist: false };
    }
  }, [toast]);

  return {
    isLoading,
    products,
    cart,
    searchProducts,
    generateProductListing,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    toggleWishlist
  };
};
