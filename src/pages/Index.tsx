import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navigation from '@/components/layout/Navigation';
import BuyerNavigation from '@/components/layout/BuyerNavigation';
import SecondaryNav from '@/components/layout/SecondaryNav';
import Dashboard from '@/components/dashboard/Dashboard';
import IdeaCapture from '@/components/idea/IdeaCapture';
import BusinessPlan from '@/components/business/BusinessPlan';
import DesignStudio from '@/components/design/DesignStudio';
import MarketingHub from '@/components/marketing/MarketingHub';
import SuppliersMap from '@/components/suppliers/SuppliersMap';
import Marketplace from '@/components/marketplace/Marketplace';
import SellerDashboard from '@/components/marketplace/SellerDashboard';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useUserRoles } from '@/hooks/useUserRoles';
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ideaData, setIdeaData] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { isBuyer, isSeller, isLoading: rolesLoading } = useUserRoles();
  
  // Determine if user is buyer-only (has buyer role but NOT seller role)
  const isBuyerOnly = isBuyer && !isSeller;

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

  // For buyer-only users, force marketplace tab
  useEffect(() => {
    if (!rolesLoading && isBuyerOnly && activeTab !== 'marketplace' && activeTab !== 'profile' && activeTab !== 'account') {
      setActiveTab('marketplace');
    }
  }, [isBuyerOnly, rolesLoading, activeTab]);

  const handleIdeaSubmit = (data: any) => {
    setIdeaData(data);
    setActiveTab('business-plan');
  };

  const handleTabChange = (tab: string) => {
    // Buyer-only users can only access marketplace, profile, and account
    if (isBuyerOnly && tab !== 'marketplace' && tab !== 'profile' && tab !== 'account') {
      return;
    }
    setActiveTab(tab);
  };

  const renderActiveComponent = () => {
    // For buyer-only users, only render marketplace, profile, or account
    if (isBuyerOnly) {
      switch (activeTab) {
        case 'profile':
          return <ProfileSettings />;
        case 'account':
          return <AccountSettings />;
        default:
          return <Marketplace />;
      }
    }

    // Full access for sellers
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={handleTabChange} />;
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
      case 'seller-dashboard':
        return (
          <RoleGuard 
            requiredRole="seller" 
            onAccessDenied={() => handleTabChange('marketplace')}
          >
            <SellerDashboard onBack={() => handleTabChange('marketplace')} />
          </RoleGuard>
        );
      case 'profile':
        return <ProfileSettings />;
      case 'account':
        return <AccountSettings />;
      default:
        return <Dashboard onTabChange={handleTabChange} />;
    }
  };

  if (loading || rolesLoading) {
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
      {/* Show simplified navigation for buyer-only users */}
      {isBuyerOnly ? (
        <BuyerNavigation onTabChange={handleTabChange} />
      ) : (
        <>
          <Navigation onTabChange={handleTabChange} />
          <SecondaryNav activeTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}
      <main className="pb-8">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
