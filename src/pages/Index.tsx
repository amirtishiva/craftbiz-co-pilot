import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navigation from '@/components/layout/Navigation';
import SecondaryNav from '@/components/layout/SecondaryNav';
import Dashboard from '@/components/dashboard/Dashboard';
import IdeaCapture from '@/components/idea/IdeaCapture';
import BusinessPlan from '@/components/business/BusinessPlan';
import DesignStudio from '@/components/design/DesignStudio';
import MarketingHub from '@/components/marketing/MarketingHub';
import SuppliersMap from '@/components/suppliers/SuppliersMap';
import Marketplace from '@/components/marketplace/Marketplace';
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ideaData, setIdeaData] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleIdeaSubmit = (data: any) => {
    setIdeaData(data);
    setActiveTab('business-plan');
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'idea':
        return <IdeaCapture onIdeaSubmit={handleIdeaSubmit} />;
      case 'business-plan':
        return <BusinessPlan ideaData={ideaData} />;
      case 'design-studio':
        return <DesignStudio />;
      case 'marketing':
        return <MarketingHub />;
      case 'suppliers':
        return <SuppliersMap />;
      case 'marketplace':
        return <Marketplace />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SecondaryNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pb-8">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
