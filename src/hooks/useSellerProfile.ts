import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  created_at: string;
  updated_at: string;
}

export const useSellerProfile = () => {
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const { toast } = useToast();

  const fetchSellerProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setSellerProfile(data);
      setIsSeller(!!data);
      return data;
    } catch (error) {
      console.error('Fetch seller profile error:', error);
      return null;
    }
  }, []);

  const addSellerRole = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'seller' });

      if (error) {
        // Ignore duplicate key error - already has role
        if (error.code === '23505') return true;
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error adding seller role:', error);
      return false;
    }
  };

  const createSellerProfile = useCallback(async (profileData: {
    shop_name: string;
    shop_tagline?: string;
    artisan_story?: string;
    craft_specialty?: string[];
    years_of_experience?: number;
    social_links?: any;
    latitude?: number;
    longitude?: number;
  }) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create seller profile
      const { data, error } = await supabase
        .from('seller_profiles')
        .insert({
          user_id: user.id,
          ...profileData
        })
        .select()
        .single();

      if (error) throw error;

      // Add seller role to user_roles table
      await addSellerRole(user.id);

      setSellerProfile(data);
      setIsSeller(true);

      toast({
        title: "Seller Profile Created",
        description: "You can now start listing products!",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Create seller profile error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create seller profile",
        variant: "destructive",
      });
      return { success: false, data: null };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateSellerProfile = useCallback(async (updates: Partial<SellerProfile>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('seller_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSellerProfile(data);

      toast({
        title: "Profile Updated",
        description: "Your seller profile has been updated",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Update seller profile error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      return { success: false, data: null };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSellerProfile();
  }, [fetchSellerProfile]);

  return {
    sellerProfile,
    isSeller,
    isLoading,
    fetchSellerProfile,
    createSellerProfile,
    updateSellerProfile
  };
};
