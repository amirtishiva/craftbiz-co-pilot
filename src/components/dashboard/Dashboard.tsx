import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Lightbulb, 
  FileText, 
  Palette, 
  Megaphone, 
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Loader2,
  Truck
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { stats, progress, loading } = useDashboardStats();

  const features = [
    {
      id: 'idea',
      title: 'Share Your Idea',
      description: 'Tell us about your craft business vision',
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'business-plan',
      title: 'AI-Generated Plan',
      description: 'Get a personalized business plan',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'design-studio',
      title: 'Design Studio',
      description: 'Create logos and brand materials',
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'marketing',
      title: 'Marketing Hub',
      description: 'Generate social media content',
      icon: Megaphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'suppliers',
      title: 'Suppliers',
      description: 'Connect with trusted suppliers',
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const dashboardStats = [
    { label: 'Ideas Analyzed', value: stats.ideas, icon: TrendingUp },
    { label: 'Plans Generated', value: stats.plans, icon: FileText },
    { label: 'Designs Created', value: stats.designs, icon: Palette },
    { label: 'Marketing Assets', value: stats.marketing, icon: Target },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="gradient-warm rounded-2xl p-8 mb-8 shadow-medium">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Start Any Small Business Today
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your craft skills into a thriving business with AI-powered tools and expert guidance
          </p>
          <Button 
            variant="craft" 
            size="xl"
            onClick={() => onTabChange('idea')}
            className="group"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-accent-orange" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          const featureProgress = progress[feature.id as keyof typeof progress] || 0;
          return (
            <Card 
              key={feature.id} 
              className="hover:shadow-medium transition-smooth cursor-pointer group"
              onClick={() => onTabChange(feature.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary transition-smooth">
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Progress: {featureProgress}%
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth" />
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-accent-orange h-2 rounded-full transition-smooth" 
                    style={{ width: `${featureProgress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
};

export default Dashboard;