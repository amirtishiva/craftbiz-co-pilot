import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  product_id: string;
  order_id: string | null;
  buyer_id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  created_at: string;
  buyer?: {
    business_name: string | null;
  };
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchProductReviews = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          buyer:buyer_id(business_name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        ...item,
        buyer: item.buyer ? {
          business_name: (item.buyer as any).business_name
        } : undefined
      }));

      setReviews(transformedData);
      return transformedData;
    } catch (error) {
      console.error('Fetch reviews error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReview = useCallback(async (
    productId: string,
    rating: number,
    comment?: string,
    orderId?: string,
    images?: string[]
  ) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to leave a review",
          variant: "destructive",
        });
        return { success: false };
      }

      // Check if user already reviewed this product
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .maybeSingle();

      if (existingReview) {
        toast({
          title: "Already reviewed",
          description: "You have already reviewed this product",
          variant: "destructive",
        });
        return { success: false };
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          buyer_id: user.id,
          rating,
          comment: comment || null,
          order_id: orderId || null,
          images: images || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      // Notify seller about new review
      const { data: product } = await supabase
        .from('products')
        .select('seller_id, title')
        .eq('id', productId)
        .single();

      if (product) {
        const { data: sellerProfile } = await supabase
          .from('seller_profiles')
          .select('user_id')
          .eq('id', product.seller_id)
          .single();

        if (sellerProfile) {
          await supabase.from('notifications').insert({
            user_id: sellerProfile.user_id,
            type: 'new_review',
            title: 'New Product Review',
            message: `Your product "${product.title}" received a ${rating}-star review`,
            data: { product_id: productId, review_id: data.id }
          });
        }
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Create review error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getAverageRating = useCallback((reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, []);

  return {
    reviews,
    isLoading,
    fetchProductReviews,
    createReview,
    getAverageRating
  };
};
