import React, { useState } from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import BuyerMarketplace from './BuyerMarketplace';
import SellerOnboarding from './SellerOnboarding';
import SellerDashboard from './SellerDashboard';
import { Loader2 } from 'lucide-react';

type MarketplaceView = 'browse' | 'seller-onboarding' | 'seller-dashboard';

const MarketplaceHome: React.FC = () => {
  const [view, setView] = useState<MarketplaceView>('browse');
  const { isSeller, isLoading: rolesLoading, refetchRoles } = useUserRoles();
  const { isLoading: profileLoading } = useSellerProfile();

  const handleOnboardingComplete = async () => {
    // Refresh roles to pick up the new seller role
    await refetchRoles();
    setView('seller-dashboard');
  };

  if (rolesLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (view === 'seller-onboarding') {
    return (
      <SellerOnboarding 
        onComplete={handleOnboardingComplete} 
        onBack={() => setView('browse')} 
      />
    );
  }

  if (view === 'seller-dashboard') {
    // Only allow access if user has seller role
    if (!isSeller) {
      setView('browse');
      return null;
    }
    return <SellerDashboard onBack={() => setView('browse')} />;
  }

  return (
    <BuyerMarketplace
      onStartSelling={() => setView('seller-onboarding')}
      onGoToSellerDashboard={() => setView('seller-dashboard')}
    />
  );
};

export default MarketplaceHome;
