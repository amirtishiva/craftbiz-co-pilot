import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from './useMarketplace';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsLoading(true);
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          created_at,
          product:products(
            *,
            product_images(*),
            seller:profiles!products_seller_id_fkey(id, user_id, business_name, avatar_url, location)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch seller profiles for wishlist products
      const items = data || [];
      if (items.length > 0) {
        const userIds = items
          .map(item => (item.product as any)?.seller?.user_id)
          .filter(Boolean);

        if (userIds.length > 0) {
          const { data: sellerProfiles } = await supabase
            .from('seller_profiles')
            .select('user_id, shop_name, rating, is_verified')
            .in('user_id', userIds);

          const sellerProfileMap = new Map(
            sellerProfiles?.map(sp => [sp.user_id, sp]) || []
          );

          items.forEach(item => {
            if ((item.product as any)?.seller?.user_id) {
              (item.product as any).seller_profile = sellerProfileMap.get(
                (item.product as any).seller.user_id
              );
            }
          });
        }
      }

      setWishlistItems(items as WishlistItem[]);
      setWishlistProductIds(new Set(items.map(item => item.product_id)));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistProductIds.has(productId);
  }, [wishlistProductIds]);

  const toggleWishlist = useCallback(async (productId: string): Promise<{ success: boolean; isInWishlist: boolean }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save items');
        return { success: false, isInWishlist: false };
      }

      const currentlyInWishlist = wishlistProductIds.has(productId);

      if (currentlyInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setWishlistProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        
        toast.success('Removed from wishlist');
        return { success: true, isInWishlist: false };
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: productId });

        if (error) throw error;

        setWishlistProductIds(prev => new Set([...prev, productId]));
        // Refresh to get the full product data
        await fetchWishlist();
        
        toast.success('Added to wishlist');
        return { success: true, isInWishlist: true };
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
      return { success: false, isInWishlist: wishlistProductIds.has(productId) };
    }
  }, [wishlistProductIds, fetchWishlist]);

  const clearWishlist = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setWishlistItems([]);
      setWishlistProductIds(new Set());
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlistItems,
    wishlistProductIds,
    isLoading,
    isInWishlist,
    toggleWishlist,
    fetchWishlist,
    clearWishlist,
    count: wishlistItems.length
  };
};
