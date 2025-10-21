import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Lightbulb, FileText, Palette, Megaphone } from 'lucide-react';
import { formatRelative } from '@/lib/dashboard-utils';
import { Activity } from '@/types/dashboard';

interface PersonalizedHeroProps {
  userName?: string;
  stats: {
    totalIdeas: number;
    totalPlans: number;
    totalDesigns: number;
    totalMarketing: number;
  };
  lastLogin?: string;
  streak?: number;
  recentActivities: Activity[];
  onGetStarted: () => void;
  onStatClick: (type: string) => void;
}

const PersonalizedHero: React.FC<PersonalizedHeroProps> = ({
  userName,
  stats,
  lastLogin,
  streak = 0,
  recentActivities,
  onGetStarted,
  onStatClick,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTagline = () => {
    const totalItems = stats.totalIdeas + stats.totalPlans + stats.totalDesigns + stats.totalMarketing;
    if (totalItems === 0) return "Let's start your entrepreneurial journey! 🚀";
    if (totalItems <= 3) return "You're making great progress! Keep going 💪";
    return `You're on fire! 🔥 ${streak} day streak`;
  };

  const statCards = [
    {
      icon: Lightbulb,
      label: 'Ideas Submitted',
      value: stats.totalIdeas,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      type: 'ideas',
    },
    {
      icon: FileText,
      label: 'Business Plans',
      value: stats.totalPlans,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      type: 'plans',
    },
    {
      icon: Palette,
      label: 'Designs Created',
      value: stats.totalDesigns,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      type: 'designs',
    },
    {
      icon: Megaphone,
      label: 'Marketing Assets',
      value: stats.totalMarketing,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      type: 'marketing',
    },
  ];

  return (
    <div className="gradient-warm rounded-2xl p-8 mb-8 shadow-medium">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          {getGreeting()}{userName ? `, ${userName}` : ''}!
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          {getTagline()}
        </p>
        {lastLogin && (
          <p className="text-sm text-muted-foreground">
            Last visit: {formatRelative(lastLogin)}
          </p>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.type}
              className="cursor-pointer hover:shadow-medium transition-smooth"
              onClick={() => onStatClick(stat.type)}
            >
              <CardContent className="pt-6 text-center">
                <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} mb-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Timeline */}
      {recentActivities.length > 0 && (
        <div className="bg-background/50 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivities.slice(0, 3).map((activity) => {
              const iconMap = {
                idea: Lightbulb,
                plan: FileText,
                design: Palette,
                marketing: Megaphone,
              };
              const Icon = iconMap[activity.type];
              return (
                <div key={activity.id} className="flex items-center gap-3 text-sm">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatRelative(activity.timestamp)}
                  </span>
                  <span className="text-foreground">
                    {activity.action} {activity.itemTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedHero;
