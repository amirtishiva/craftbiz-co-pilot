import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    ideas: 0,
    plans: 0,
    designs: 0,
    marketing: 0,
  });
  const [progress, setProgress] = useState({
    idea: 0,
    'business-plan': 0,
    'design-studio': 0,
    marketing: 0,
    suppliers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch ideas count
        const { count: ideasCount } = await supabase
          .from('business_ideas')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch plans count
        const { count: plansCount } = await supabase
          .from('business_plans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch design assets count
        const { count: designsCount } = await supabase
          .from('design_assets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch marketing content count
        const { count: marketingCount } = await supabase
          .from('marketing_content')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats({
          ideas: ideasCount || 0,
          plans: plansCount || 0,
          designs: designsCount || 0,
          marketing: marketingCount || 0,
        });

        // Calculate progress percentages
        setProgress({
          idea: ideasCount > 0 ? 100 : 0,
          'business-plan': plansCount > 0 ? 100 : 0,
          'design-studio': designsCount > 0 ? 100 : 0,
          marketing: marketingCount > 0 ? 100 : 0,
          suppliers: 100, // Always available
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, progress, loading };
};
