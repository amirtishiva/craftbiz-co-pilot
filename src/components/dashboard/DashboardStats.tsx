import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Lightbulb, 
  FileText, 
  Palette, 
  Megaphone,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    ideas: number;
    plans: number;
    designs: number;
    marketing: number;
  };
  loading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  const statItems = [
    { 
      label: 'Ideas Captured', 
      value: stats.ideas, 
      icon: Lightbulb,
      color: 'stat-ideas',
      bgClass: 'bg-stat-ideas/15',
      textClass: 'text-stat-ideas',
      trend: stats.ideas > 0 ? '+' + stats.ideas : null
    },
    { 
      label: 'Business Plans', 
      value: stats.plans, 
      icon: FileText,
      color: 'stat-plans',
      bgClass: 'bg-stat-plans/15',
      textClass: 'text-stat-plans',
      trend: stats.plans > 0 ? '+' + stats.plans : null
    },
    { 
      label: 'Designs Created', 
      value: stats.designs, 
      icon: Palette,
      color: 'stat-designs',
      bgClass: 'bg-stat-designs/15',
      textClass: 'text-stat-designs',
      trend: stats.designs > 0 ? '+' + stats.designs : null
    },
    { 
      label: 'Marketing Assets', 
      value: stats.marketing, 
      icon: Megaphone,
      color: 'stat-marketing',
      bgClass: 'bg-stat-marketing/15',
      textClass: 'text-stat-marketing',
      trend: stats.marketing > 0 ? '+' + stats.marketing : null
    },
  ];

  if (loading) {
    return (
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 sm:p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <CardContent className="p-4 sm:p-6 relative">
              {/* Background decoration */}
              <div className={`absolute -top-6 -right-6 w-20 h-20 ${stat.bgClass} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgClass} flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.textClass}`} />
                </div>
                
                {/* Value */}
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  {stat.trend && (
                    <span className="flex items-center text-xs text-success-green font-medium pb-1">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      {stat.trend}
                    </span>
                  )}
                </div>
                
                {/* Label */}
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
};

export default DashboardStats;
