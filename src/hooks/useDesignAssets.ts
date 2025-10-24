import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDesignAssets = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('design_assets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setAssets(data || []);
      } catch (error) {
        console.error('Error fetching design assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return { assets, loading, setAssets };
};
