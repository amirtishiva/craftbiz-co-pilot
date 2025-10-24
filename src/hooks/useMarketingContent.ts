import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMarketingContent = () => {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('marketing_content')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setContent(data || []);
      } catch (error) {
        console.error('Error fetching marketing content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, setContent };
};
