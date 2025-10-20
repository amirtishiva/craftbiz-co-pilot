import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, FileText, Palette, Megaphone, Sparkles } from 'lucide-react';
import { getGreeting } from '@/lib/dashboard-utils';

interface PersonalizedHeroProps {
  userName: string;
  stats: {
    totalIdeas: number;
    totalPlans: number;
    totalDesigns: number;
    totalMarketing: number;
  };
  streak: number;
  onStatClick: (section: string) => void;
}

const PersonalizedHero: React.FC<PersonalizedHeroProps> = ({ 
  userName, 
  stats,
  streak,
  onStatClick 
}) => {
  const getTagline = () => {
    const total = stats.totalIdeas + stats.totalPlans + stats.totalDesigns + stats.totalMarketing;
    
    if (total === 0) return "Let's start your entrepreneurial journey! 🚀";
    if (total <= 3) return "You're making great progress! Keep going 💪";
    return `You're on fire! 🔥 ${streak} day streak`;
  };

  const statCards = [
    {
      label: 'Ideas',
      value: stats.totalIdeas,
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      section: 'ideas',
    },
    {
      label: 'Business Plans',
      value: stats.totalPlans,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      section: 'plans',
    },
    {
      label: 'Designs',
      value: stats.totalDesigns,
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      section: 'designs',
    },
    {
      label: 'Marketing',
      value: stats.totalMarketing,
      icon: Megaphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      section: 'marketing',
    },
  ];

  return (
    <div className="mb-8 space-y-6">
      {/* Welcome Banner */}
      <div className="gradient-warm rounded-2xl p-8 shadow-medium">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="h-6 w-6 text-accent-orange" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {getGreeting()}, {userName}!
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {getTagline()}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.section}
              className="cursor-pointer hover:shadow-medium transition-smooth hover:scale-105"
              onClick={() => onStatClick(stat.section)}
            >
              <CardContent className="pt-6">
                <div className={`p-3 rounded-lg ${stat.bgColor} w-fit mx-auto mb-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalizedHero;
