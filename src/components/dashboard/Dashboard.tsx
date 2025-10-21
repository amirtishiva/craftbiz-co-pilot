import React, { useState, useEffect } from 'react';
import { getDashboardData, saveDashboardData } from '@/lib/dashboard-utils';
import { DashboardData } from '@/types/dashboard';
import PersonalizedHero from './PersonalizedHero';
import IdeasGallery from './IdeasGallery';
import BusinessPlansGallery from './BusinessPlansGallery';
import DesignsGallery from './DesignsGallery';
import MarketingGallery from './MarketingGallery';
import ActivityTimeline from './ActivityTimeline';
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

  const handleDeleteIdea = (id: string) => {
    if (!dashboardData) return;
    
    const updatedData = {
      ...dashboardData,
      ideas: dashboardData.ideas.filter(i => i.id !== id),
    };
    saveDashboardData(updatedData);
    setDashboardData(updatedData);
    
    toast({
      title: "Idea deleted",
      description: "Your idea has been removed.",
    });
  };

  const handleDeleteContent = (id: string) => {
    if (!dashboardData) return;
    
    const updatedData = {
      ...dashboardData,
      marketing: dashboardData.marketing.filter(m => m.id !== id),
    };
    saveDashboardData(updatedData);
    setDashboardData(updatedData);
    
    toast({
      title: "Content deleted",
      description: "Marketing content has been removed.",
    });
  };

  const handleToggleFavorite = (id: string) => {
    if (!dashboardData) return;
    
    const updatedData = {
      ...dashboardData,
      designs: dashboardData.designs.map(d =>
        d.id === id ? { ...d, favorited: !d.favorited } : d
      ),
    };
    saveDashboardData(updatedData);
    setDashboardData(updatedData);
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalIdeas: dashboardData?.ideas?.length || 0,
    totalPlans: dashboardData?.businessPlans?.length || 0,
    totalDesigns: dashboardData?.designs?.length || 0,
    totalMarketing: dashboardData?.marketing?.length || 0,
  };

  const isNewUser = stats.totalIdeas === 0 && stats.totalPlans === 0 && stats.totalDesigns === 0 && stats.totalMarketing === 0;

  const handleStatClick = (type: string) => {
    const sectionMap: { [key: string]: string } = {
      ideas: 'ideas',
      plans: 'plans',
      designs: 'designs',
      marketing: 'marketing',
    };
    
    const sectionId = sectionMap[type];
    if (sectionId) {
      const element = document.getElementById(`${sectionId}-section`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Personalized Hero */}
      <PersonalizedHero
        userName={dashboardData?.user?.name}
        stats={stats}
        lastLogin={dashboardData?.user?.lastLogin}
        streak={dashboardData?.user?.activityStreak}
        recentActivities={dashboardData?.activities || []}
        onGetStarted={() => onTabChange('idea')}
        onStatClick={handleStatClick}
      />

      {isNewUser ? (
        /* Onboarding View for New Users */
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome to CraftBiz AI! 🎉
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your entrepreneurial journey by sharing your first business idea.
            Our AI will help you transform it into a complete business plan.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => onTabChange('idea')}
              className="px-8 py-4 bg-accent-orange text-white rounded-lg font-semibold hover:bg-accent-orange/90 transition-smooth"
            >
              Share Your First Idea →
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Ideas Gallery */}
          <div id="ideas-section">
            <IdeasGallery
              ideas={dashboardData?.ideas || []}
              onViewIdea={(id) => console.log('View idea:', id)}
              onEditIdea={(id) => console.log('Edit idea:', id)}
              onDeleteIdea={handleDeleteIdea}
              onGeneratePlan={(id) => {
                onTabChange('business-plan');
                toast({
                  title: "Generating plan...",
                  description: "Please wait while we create your business plan.",
                });
              }}
              onNewIdea={() => onTabChange('idea')}
            />
          </div>

          {/* Business Plans Gallery */}
          <div id="plans-section">
            <BusinessPlansGallery
              plans={dashboardData?.businessPlans || []}
              onViewPlan={(id) => onTabChange('business-plan')}
              onEditPlan={(id) => onTabChange('business-plan')}
              onDownloadPlan={(id) => {
                toast({
                  title: "Download started",
                  description: "Your business plan is being prepared.",
                });
              }}
            />
          </div>

          {/* Design Assets Gallery */}
          <div id="designs-section">
            <DesignsGallery
              designs={dashboardData?.designs || []}
              onViewDesign={(id) => console.log('View design:', id)}
              onDownloadDesign={(id) => {
                toast({
                  title: "Download started",
                  description: "Your design is being downloaded.",
                });
              }}
              onCreateMockup={(id) => {
                onTabChange('design-studio');
                toast({
                  title: "Opening Design Studio",
                  description: "Create mockups with your logo.",
                });
              }}
              onToggleFavorite={handleToggleFavorite}
              onNewDesign={() => onTabChange('design-studio')}
            />
          </div>

          {/* Marketing Content Gallery */}
          <div id="marketing-section">
            <MarketingGallery
              content={dashboardData?.marketing || []}
              onViewContent={(id) => console.log('View content:', id)}
              onEditContent={(id) => onTabChange('marketing')}
              onCopyContent={handleCopyContent}
              onShareContent={(id) => {
                toast({
                  title: "Share",
                  description: "Sharing functionality coming soon!",
                });
              }}
              onDeleteContent={handleDeleteContent}
              onNewContent={() => onTabChange('marketing')}
            />
          </div>

          {/* Activity Timeline */}
          <ActivityTimeline activities={dashboardData?.activities || []} />
        </>
      )}
    </div>
  );
};

export default Dashboard;