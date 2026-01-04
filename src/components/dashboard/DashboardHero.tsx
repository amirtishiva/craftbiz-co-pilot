import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface DashboardHeroProps {
  onGetStarted: () => void;
  userName?: string;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ onGetStarted, userName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-info-blue/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
      
      <div className="relative rounded-2xl lg:rounded-3xl bg-card border border-border overflow-hidden shadow-medium">
        {/* Decorative top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-orange via-info-blue to-purple-accent" />
        
        <div className="p-6 sm:p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">
            {/* Content */}
            <div className="flex-1 space-y-4 lg:space-y-6">
              {/* Greeting Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border">
                <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  {getGreeting()}{userName && `, ${userName}`}
                </span>
              </div>
              
              {/* Main Heading */}
              <div className="space-y-2 lg:space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                  Transform Your Craft Into
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-warning-amber">
                    A Thriving Business
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl">
                  AI-powered tools to help you build, market, and scale your handcraft business from idea to success.
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  variant="craft" 
                  size="lg"
                  onClick={onGetStarted}
                  className="group text-sm sm:text-base"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-sm sm:text-base"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            
            {/* Stats Preview */}
            <div className="hidden lg:grid grid-cols-2 gap-4 lg:w-72 xl:w-80">
              <StatPreviewCard 
                value="500+" 
                label="Artisans" 
                color="bg-stat-ideas/20 text-stat-ideas"
              />
              <StatPreviewCard 
                value="10K+" 
                label="Products" 
                color="bg-stat-plans/20 text-stat-plans"
              />
              <StatPreviewCard 
                value="95%" 
                label="Success Rate" 
                color="bg-stat-designs/20 text-stat-designs"
              />
              <StatPreviewCard 
                value="24/7" 
                label="AI Support" 
                color="bg-stat-marketing/20 text-stat-marketing"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatPreviewCardProps {
  value: string;
  label: string;
  color: string;
}

const StatPreviewCard: React.FC<StatPreviewCardProps> = ({ value, label, color }) => (
  <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/50">
    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
      <Sparkles className="w-4 h-4" />
    </div>
    <div className="text-lg xl:text-xl font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default DashboardHero;
