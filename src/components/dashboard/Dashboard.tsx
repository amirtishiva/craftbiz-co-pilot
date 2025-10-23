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
  Target
} from 'lucide-react';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const features = [
    {
      id: 'idea',
      title: 'Share Your Idea',
      description: 'Tell us about your craft business vision',
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      progress: 0,
    },
    {
      id: 'business-plan',
      title: 'AI-Generated Plan',
      description: 'Get a personalized business plan',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progress: 0,
    },
    {
      id: 'design-studio',
      title: 'Design Studio',
      description: 'Create logos and brand materials',
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      progress: 0,
    },
    {
      id: 'marketing',
      title: 'Marketing Hub',
      description: 'Generate social media content',
      icon: Megaphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      progress: 0,
    },
  ];

  const stats = [
    { label: 'Ideas Analyzed', value: '1', icon: TrendingUp },
    { label: 'Plans Generated', value: '0', icon: FileText },
    { label: 'Designs Created', value: '0', icon: Palette },
    { label: 'Marketing Assets', value: '0', icon: Target },
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
        {stats.map((stat, index) => {
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
        })}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
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
                    Progress: {feature.progress}%
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth" />
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-accent-orange h-2 rounded-full transition-smooth" 
                    style={{ width: `${feature.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Next Steps
          </CardTitle>
          <CardDescription>
            Follow these steps to build your business from scratch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-orange text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Share Your Business Idea</h4>
                  <p className="text-sm text-muted-foreground">Tell us about your craft and vision</p>
                </div>
              </div>
              <Button variant="warm" onClick={() => onTabChange('idea')}>
                Start Now
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Review AI-Generated Business Plan</h4>
                  <p className="text-sm text-muted-foreground">Get detailed insights and strategy</p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Next
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Launch Your Marketing</h4>
                  <p className="text-sm text-muted-foreground">Create content and reach customers</p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;