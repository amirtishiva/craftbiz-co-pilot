import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/layout/Navigation';
import SecondaryNav from '@/components/layout/SecondaryNav';
import Dashboard from '@/components/dashboard/Dashboard';
import IdeaCapture from '@/components/idea/IdeaCapture';
import BusinessPlan from '@/components/business/BusinessPlan';
import DesignStudio from '@/components/design/DesignStudio';
import MarketingHub from '@/components/marketing/MarketingHub';
import SuppliersMap from '@/components/suppliers/SuppliersMap';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ideaData, setIdeaData] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('craftbiz_user');
    if (!isLoggedIn) {
      navigate('/');
    }
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
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

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
