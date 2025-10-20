import React, { useState, useEffect } from 'react';
import PersonalizedHero from './PersonalizedHero';
import IdeasGallery from './IdeasGallery';
import BusinessPlansGallery from './BusinessPlansGallery';
import DesignsGallery from './DesignsGallery';
import MarketingGallery from './MarketingGallery';
import ActivityTimeline from './ActivityTimeline';
import { getDashboardData, saveDashboardData } from '@/lib/dashboard-utils';
import { DashboardData } from '@/types/dashboard';
import { toast } from '@/hooks/use-toast';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getDashboardData();
    setDashboardData(data);
    setLoading(false);
  }, []);

  const refreshData = () => {
    const data = getDashboardData();
    setDashboardData(data);
  };

  const handleStatClick = (section: string) => {
    const element = document.getElementById(`${section}-gallery`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDeleteIdea = (id: string) => {
    if (!dashboardData) return;
    
    const updatedData = {
      ...dashboardData,
      ideas: dashboardData.ideas.filter(idea => idea.id !== id),
    };
    saveDashboardData(updatedData);
    setDashboardData(updatedData);
    
    toast({
      title: "Idea deleted",
      description: "Your idea has been removed",
    });
  };

  const handleDeletePlan = (id: string) => {
    if (!dashboardData) return;
    
    const updatedData = {
      ...dashboardData,
      businessPlans: dashboardData.businessPlans.filter(plan => plan.id !== id),
    };
    saveDashboardData(updatedData);
    setDashboardData(updatedData);
    
    toast({
      title: "Plan deleted",
      description: "Your business plan has been removed",
    });
  };

  const handleDeleteDesign = (id: string) => {
    if (!dashboardData) return;
    
    const updatedData = {
      ...dashboardData,
      designs: dashboardData.designs.filter(design => design.id !== id),
    };
    saveDashboardData(updatedData);
    setDashboardData(updatedData);
    
    toast({
      title: "Design deleted",
      description: "Your design has been removed",
    });
  };

  const handleDeleteMarketing = (id: string) => {
    if (!dashboardData) return;
    
    const updatedData = {
      ...dashboardData,
      marketing: dashboardData.marketing.filter(content => content.id !== id),
    };
    saveDashboardData(updatedData);
    setDashboardData(updatedData);
    
    toast({
      title: "Content deleted",
      description: "Your marketing content has been removed",
    });
  };

  const handleToggleFavorite = (id: string) => {
    if (!dashboardData) return;
    
    const updatedData = {
      ...dashboardData,
      designs: dashboardData.designs.map(design => 
        design.id === id ? { ...design, favorited: !design.favorited } : design
      ),
    };
    saveDashboardData(updatedData);
    setDashboardData(updatedData);
  };

  if (loading || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const stats = {
    totalIdeas: dashboardData.ideas.length,
    totalPlans: dashboardData.businessPlans.length,
    totalDesigns: dashboardData.designs.length,
    totalMarketing: dashboardData.marketing.length,
  };

  const isNewUser = stats.totalIdeas === 0 && stats.totalPlans === 0 && 
                     stats.totalDesigns === 0 && stats.totalMarketing === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PersonalizedHero
        userName={dashboardData.user.name}
        stats={stats}
        streak={dashboardData.user.activityStreak}
        onStatClick={handleStatClick}
      />

      {isNewUser ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Welcome to CraftBiz!</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your business idea into a launch-ready business kit with AI-powered tools designed for Indian entrepreneurs.
          </p>
          <button 
            onClick={() => onTabChange('idea')}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-accent-orange text-white font-semibold hover:opacity-90 transition-smooth"
          >
            Get Started
          </button>
        </div>
      ) : (
        <>
          <IdeasGallery
            ideas={dashboardData.ideas}
            onViewIdea={(id) => console.log('View idea:', id)}
            onEditIdea={(id) => console.log('Edit idea:', id)}
            onDeleteIdea={handleDeleteIdea}
            onGeneratePlan={(id) => onTabChange('business-plan')}
            onNewIdea={() => onTabChange('idea')}
          />

          <BusinessPlansGallery
            plans={dashboardData.businessPlans}
            onViewPlan={(id) => console.log('View plan:', id)}
            onEditPlan={(id) => console.log('Edit plan:', id)}
            onDownloadPlan={(id) => console.log('Download plan:', id)}
            onNewPlan={() => onTabChange('idea')}
          />

          <DesignsGallery
            designs={dashboardData.designs}
            onViewDesign={(id) => console.log('View design:', id)}
            onDownloadDesign={(id) => console.log('Download design:', id)}
            onToggleFavorite={handleToggleFavorite}
            onCreateMockup={(id) => onTabChange('design-studio')}
            onNewDesign={() => onTabChange('design-studio')}
          />

          <MarketingGallery
            marketing={dashboardData.marketing}
            onViewContent={(id) => console.log('View content:', id)}
            onEditContent={(id) => console.log('Edit content:', id)}
            onDeleteContent={handleDeleteMarketing}
            onNewContent={() => onTabChange('marketing')}
          />

          <ActivityTimeline activities={dashboardData.activities} />
        </>
      )}
    </div>
  );
};

export default Dashboard;