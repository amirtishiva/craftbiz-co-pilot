import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  FileText, 
  Palette, 
  Megaphone,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface RecentActivityProps {
  stats: {
    ideas: number;
    plans: number;
    designs: number;
    marketing: number;
  };
  onTabChange: (tab: string) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ stats, onTabChange }) => {
  const hasActivity = stats.ideas > 0 || stats.plans > 0 || stats.designs > 0 || stats.marketing > 0;

  const recentItems = [
    { 
      type: 'idea', 
      label: 'Business Ideas', 
      count: stats.ideas, 
      icon: Lightbulb,
      color: 'text-stat-ideas',
      bgColor: 'bg-stat-ideas/15'
    },
    { 
      type: 'business-plan', 
      label: 'Business Plans', 
      count: stats.plans, 
      icon: FileText,
      color: 'text-stat-plans',
      bgColor: 'bg-stat-plans/15'
    },
    { 
      type: 'design-studio', 
      label: 'Design Assets', 
      count: stats.designs, 
      icon: Palette,
      color: 'text-stat-designs',
      bgColor: 'bg-stat-designs/15'
    },
    { 
      type: 'marketing', 
      label: 'Marketing Content', 
      count: stats.marketing, 
      icon: Megaphone,
      color: 'text-stat-marketing',
      bgColor: 'bg-stat-marketing/15'
    },
  ].filter(item => item.count > 0);

  if (!hasActivity) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-accent-orange" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            Start Your Journey
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            You haven't created anything yet. Begin by capturing your first business idea and let AI guide you through the process.
          </p>
          <Button 
            variant="craft"
            onClick={() => onTabChange('idea')}
            className="group"
          >
            Capture Your First Idea
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            Your Creations
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {recentItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => onTabChange(item.type)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
              >
                <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.count} {item.count === 1 ? 'item' : 'items'} created
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
