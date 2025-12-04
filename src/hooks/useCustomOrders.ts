import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CustomRequest {
  id: string;
  buyer_id: string;
  seller_id: string;
  description: string;
  reference_images: string[] | null;
  proposed_budget: number | null;
  seller_quote: number | null;
  estimated_delivery_days: number | null;
  status: string;
  seller_notes: string | null;
  created_at: string;
  updated_at: string;
  seller?: {
    shop_name: string;
    shop_tagline: string | null;
  };
}

interface CreateRequestParams {
  sellerId: string;
  description: string;
  referenceImages?: string[];
  proposedBudget?: number;
}

interface RespondToRequestParams {
  requestId: string;
  sellerQuote?: number;
  estimatedDeliveryDays?: number;
  sellerNotes?: string;
  status: 'quoted' | 'accepted' | 'rejected';
}

export const useCustomOrders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [buyerRequests, setBuyerRequests] = useState<CustomRequest[]>([]);
  const [sellerRequests, setSellerRequests] = useState<CustomRequest[]>([]);
  const { toast } = useToast();

  const createRequest = useCallback(async (params: CreateRequestParams) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to submit a custom request",
          variant: "destructive",
        });
        return { success: false };
      }

      const { data, error } = await supabase
        .from('custom_requests')
        .insert({
          buyer_id: user.id,
          seller_id: params.sellerId,
          description: params.description,
          reference_images: params.referenceImages || null,
          proposed_budget: params.proposedBudget || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your custom order request has been sent to the artisan",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Create request error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchBuyerRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('custom_requests')
        .select(`
          *,
          seller:seller_id(
            shop_name,
            shop_tagline
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        seller: item.seller ? {
          shop_name: (item.seller as any).shop_name,
          shop_tagline: (item.seller as any).shop_tagline
        } : undefined
      }));
      
      setBuyerRequests(transformedData);
    } catch (error) {
      console.error('Fetch buyer requests error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSellerRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get seller profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('custom_requests')
        .select('*')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSellerRequests(data || []);
    } catch (error) {
      console.error('Fetch seller requests error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const respondToRequest = useCallback(async (params: RespondToRequestParams) => {
    setIsLoading(true);
    try {
      const updateData: any = { status: params.status };
      if (params.sellerQuote !== undefined) updateData.seller_quote = params.sellerQuote;
      if (params.estimatedDeliveryDays !== undefined) updateData.estimated_delivery_days = params.estimatedDeliveryDays;
      if (params.sellerNotes !== undefined) updateData.seller_notes = params.sellerNotes;

      const { error } = await supabase
        .from('custom_requests')
        .update(updateData)
        .eq('id', params.requestId);

      if (error) throw error;

      toast({
        title: "Response Sent",
        description: "Your response has been sent to the buyer",
      });

      await fetchSellerRequests();
      return { success: true };
    } catch (error: any) {
      console.error('Respond to request error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchSellerRequests]);

  const acceptQuote = useCallback(async (requestId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('custom_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Quote Accepted",
        description: "You've accepted the artisan's quote. They will contact you to proceed.",
      });

      await fetchBuyerRequests();
      return { success: true };
    } catch (error: any) {
      console.error('Accept quote error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept quote",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchBuyerRequests]);

  return {
    isLoading,
    buyerRequests,
    sellerRequests,
    createRequest,
    fetchBuyerRequests,
    fetchSellerRequests,
    respondToRequest,
    acceptQuote
  };
};
