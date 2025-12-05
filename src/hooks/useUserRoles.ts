import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'buyer' | 'seller' | 'admin';

export const useUserRoles = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRoles([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const userRoles = data?.map(r => r.role as AppRole) || [];
      setRoles(userRoles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasRole = useCallback((role: AppRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  const addSellerRole = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already has seller role
      if (roles.includes('seller')) return true;

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'seller' });

      if (error) {
        // Ignore duplicate key error - already has role
        if (error.code === '23505') {
          setRoles(prev => [...prev, 'seller']);
          return true;
        }
        throw error;
      }

      setRoles(prev => [...prev, 'seller']);
      return true;
    } catch (error) {
      console.error('Error adding seller role:', error);
      return false;
    }
  }, [roles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchRoles();
      } else {
        setRoles([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRoles]);

  return {
    roles,
    isLoading,
    hasRole,
    isBuyer: hasRole('buyer'),
    isSeller: hasRole('seller'),
    isAdmin: hasRole('admin'),
    addSellerRole,
    refetchRoles: fetchRoles
  };
};
