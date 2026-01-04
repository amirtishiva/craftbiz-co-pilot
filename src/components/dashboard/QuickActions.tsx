import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  FileText, 
  Palette, 
  Megaphone, 
  Truck,
  Store,
  ArrowRight,
  CheckCircle2,
  Circle
} from 'lucide-react';

interface QuickActionsProps {
  onTabChange: (tab: string) => void;
  progress: {
    idea: number;
    'business-plan': number;
    'design-studio': number;
    marketing: number;
    suppliers: number;
  };
}

const QuickActions: React.FC<QuickActionsProps> = ({ onTabChange, progress }) => {
  const features = [
    {
      id: 'idea',
      title: 'Capture Your Idea',
      description: 'Share your craft vision through text, voice, or images',
      icon: Lightbulb,
      color: 'stat-ideas',
      bgClass: 'bg-stat-ideas/10 group-hover:bg-stat-ideas/20',
      iconClass: 'text-stat-ideas',
      step: 1
    },
    {
      id: 'business-plan',
      title: 'Generate Business Plan',
      description: 'AI creates a personalized roadmap for your success',
      icon: FileText,
      color: 'stat-plans',
      bgClass: 'bg-stat-plans/10 group-hover:bg-stat-plans/20',
      iconClass: 'text-stat-plans',
      step: 2
    },
    {
      id: 'design-studio',
      title: 'Design Your Brand',
      description: 'Create logos, mockups, and visual identity',
      icon: Palette,
      color: 'stat-designs',
      bgClass: 'bg-stat-designs/10 group-hover:bg-stat-designs/20',
      iconClass: 'text-stat-designs',
      step: 3
    },
    {
      id: 'marketing',
      title: 'Marketing Hub',
      description: 'Generate social media content and campaigns',
      icon: Megaphone,
      color: 'stat-marketing',
      bgClass: 'bg-stat-marketing/10 group-hover:bg-stat-marketing/20',
      iconClass: 'text-stat-marketing',
      step: 4
    },
    {
      id: 'suppliers',
      title: 'Find Suppliers',
      description: 'Connect with trusted material suppliers nearby',
      icon: Truck,
      color: 'accent-orange',
      bgClass: 'bg-accent-orange/10 group-hover:bg-accent-orange/20',
      iconClass: 'text-accent-orange',
      step: 5
    },
    {
      id: 'seller-dashboard',
      title: 'Open My Shop',
      description: 'Manage products, orders, and analytics',
      icon: Store,
      color: 'info-blue',
      bgClass: 'bg-info-blue/10 group-hover:bg-info-blue/20',
      iconClass: 'text-info-blue',
      step: 6
    },
  ];

  const getProgressForFeature = (id: string): number => {
    return progress[id as keyof typeof progress] || 0;
  };

  const isCompleted = (id: string) => getProgressForFeature(id) >= 100;

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            Your Journey
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Follow these steps to build your craft business
          </p>
        </div>
      </div>
      
      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          const featureProgress = getProgressForFeature(feature.id);
          const completed = isCompleted(feature.id);
          
          return (
            <Card 
              key={feature.id}
              onClick={() => onTabChange(feature.id)}
              className="group cursor-pointer border-border/80 hover:border-border hover:shadow-medium transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Progress indicator line */}
              {featureProgress > 0 && (
                <div 
                  className="absolute top-0 left-0 h-1 bg-gradient-to-r from-success-green to-success-green/50 transition-all duration-500"
                  style={{ width: `${featureProgress}%` }}
                />
              )}
              
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.bgClass} flex items-center justify-center transition-colors duration-300`}>
                    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${feature.iconClass}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {feature.description}
                        </p>
                      </div>
                      
                      {/* Status indicator */}
                      <div className="flex-shrink-0">
                        {completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success-green" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">{feature.step}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={featureProgress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground font-medium w-10 text-right">
                        {featureProgress}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Hover arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default QuickActions;
