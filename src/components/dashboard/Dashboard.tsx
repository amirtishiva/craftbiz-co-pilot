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

  const handleViewIdea = (id: string) => {
    const idea = dashboardData?.ideas.find(i => i.id === id);
    if (idea) {
      toast({
        title: idea.title,
        description: idea.content,
      });
    }
  };

  const handleEditIdea = (id: string) => {
    onTabChange('idea');
    toast({
      title: "Opening Idea Capture",
      description: "You can create a new idea or modify existing ones.",
    });
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

  const handleGeneratePlan = (id: string) => {
    const idea = dashboardData?.ideas.find(i => i.id === id);
    if (idea) {
      onTabChange('business-plan');
      toast({
        title: "Generating business plan",
        description: `Creating a comprehensive plan for "${idea.title}"`,
      });
    }
  };

  const handleViewPlan = (id: string) => {
    onTabChange('business-plan');
    toast({
      title: "Opening Business Plan",
      description: "Loading your business plan details.",
    });
  };

  const handleEditPlan = (id: string) => {
    onTabChange('business-plan');
    toast({
      title: "Edit Mode",
      description: "You can now modify your business plan.",
    });
  };

  const handleDownloadPlan = (id: string) => {
    const plan = dashboardData?.businessPlans.find(p => p.id === id);
    if (plan) {
      const planText = `
BUSINESS PLAN - ${plan.businessName}
=====================================

Business Type: ${plan.businessType}
Status: ${plan.status}
Completion: ${plan.completionPercentage}%

EXECUTIVE SUMMARY
${plan.sections.executiveSummary}

MARKET ANALYSIS
${plan.sections.marketAnalysis}

BUSINESS MODEL
${plan.sections.businessModel}

MARKETING STRATEGY
${plan.sections.marketingStrategy}

OPERATIONS PLANNING
${plan.sections.operationsPlanning}

FINANCIAL PROJECTIONS
${plan.sections.financialProjections}

Monthly Revenue: ₹${plan.financialData.monthlyRevenue.toLocaleString()}
Monthly Profit: ₹${plan.financialData.monthlyProfit.toLocaleString()}
Break-even: ${plan.financialData.breakEvenMonths} months
      `;

      const blob = new Blob([planText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan.businessName}-business-plan.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your business plan is being downloaded.",
      });
    }
  };

  const handleViewDesign = (id: string) => {
    const design = dashboardData?.designs.find(d => d.id === id);
    if (design) {
      toast({
        title: design.name,
        description: `${design.type} - ${design.style || 'Design'}`,
      });
    }
  };

  const handleDownloadDesign = (id: string) => {
    const design = dashboardData?.designs.find(d => d.id === id);
    if (design) {
      toast({
        title: "Download started",
        description: `Downloading ${design.name}`,
      });
    }
  };

  const handleCreateMockup = (id: string) => {
    onTabChange('design-studio');
    toast({
      title: "Opening Design Studio",
      description: "Create mockups with your selected design.",
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

    const design = updatedData.designs.find(d => d.id === id);
    toast({
      title: design?.favorited ? "Added to favorites" : "Removed from favorites",
      description: design?.name,
    });
  };

  const handleViewContent = (id: string) => {
    const content = dashboardData?.marketing.find(m => m.id === id);
    if (content) {
      toast({
        title: content.platform,
        description: content.content.substring(0, 100) + '...',
      });
    }
  };

  const handleEditContent = (id: string) => {
    onTabChange('marketing');
    toast({
      title: "Opening Marketing Hub",
      description: "You can generate new content or edit existing ones.",
    });
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Marketing content has been copied.",
    });
  };

  const handleShareContent = (id: string) => {
    const content = dashboardData?.marketing.find(m => m.id === id);
    if (content && navigator.share) {
      navigator.share({
        title: `${content.platform} Content`,
        text: content.content,
      }).catch(() => {
        handleCopyContent(content.content);
      });
    } else if (content) {
      handleCopyContent(content.content);
    }
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
              onViewIdea={handleViewIdea}
              onEditIdea={handleEditIdea}
              onDeleteIdea={handleDeleteIdea}
              onGeneratePlan={handleGeneratePlan}
              onNewIdea={() => onTabChange('idea')}
            />
          </div>

          {/* Business Plans Gallery */}
          <div id="plans-section">
            <BusinessPlansGallery
              plans={dashboardData?.businessPlans || []}
              onViewPlan={handleViewPlan}
              onEditPlan={handleEditPlan}
              onDownloadPlan={handleDownloadPlan}
            />
          </div>

          {/* Design Assets Gallery */}
          <div id="designs-section">
            <DesignsGallery
              designs={dashboardData?.designs || []}
              onViewDesign={handleViewDesign}
              onDownloadDesign={handleDownloadDesign}
              onCreateMockup={handleCreateMockup}
              onToggleFavorite={handleToggleFavorite}
              onNewDesign={() => onTabChange('design-studio')}
            />
          </div>

          {/* Marketing Content Gallery */}
          <div id="marketing-section">
            <MarketingGallery
              content={dashboardData?.marketing || []}
              onViewContent={handleViewContent}
              onEditContent={handleEditContent}
              onCopyContent={handleCopyContent}
              onShareContent={handleShareContent}
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