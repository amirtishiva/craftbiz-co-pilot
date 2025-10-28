import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchParams {
  searchQuery?: string;
  category?: string;
  city?: string;
  userLocation?: {
    lat: number;
    lng: number;
  };
  maxDistance?: number;
}

export const useSupplierSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchSuppliers = useCallback(async (params: SearchParams) => {
    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke('search-suppliers', {
        body: params
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      return {
        success: true,
        data: data.data,
        count: data.count
      };

    } catch (error: any) {
      console.error('Supplier search error:', error);
      
      toast({
        title: "Search Error",
        description: error.message || "Failed to search suppliers. Please try again.",
        variant: "destructive",
      });

      return {
        success: false,
        data: [],
        count: 0
      };
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const geocodeAddress = useCallback(async (address: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Geocoding failed');
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error: any) {
      console.error('Geocoding error:', error);
      
      toast({
        title: "Location Error",
        description: "Failed to find location coordinates.",
        variant: "destructive",
      });

      return {
        success: false,
        data: null
      };
    }
  }, [toast]);

  return {
    searchSuppliers,
    geocodeAddress,
    isSearching
  };
};