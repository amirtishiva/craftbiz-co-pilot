import React from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import DashboardHero from './DashboardHero';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import TipsCarousel from './TipsCarousel';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { stats, progress, loading } = useDashboardStats();

  return (
    <div className="min-h-screen">
      {/* Main Container with responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 lg:space-y-10">
        
        {/* Hero Section */}
        <DashboardHero onGetStarted={() => onTabChange('idea')} />
        
        {/* Stats Overview */}
        <DashboardStats stats={stats} loading={loading} />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Quick Actions - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <QuickActions onTabChange={onTabChange} progress={progress} />
          </div>
          
          {/* Sidebar - Tips and Recent Activity */}
          <div className="space-y-6">
            {/* Tips Carousel */}
            <TipsCarousel />
            
            {/* Recent Activity */}
            <RecentActivity stats={stats} onTabChange={onTabChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
