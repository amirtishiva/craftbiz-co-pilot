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
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { t } = useLanguage();

  const features = [
    {
      id: 'idea',
      title: t('dashboard.features.shareIdea'),
      description: t('dashboard.features.shareIdea.desc'),
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      progress: 0,
    },
    {
      id: 'business-plan',
      title: t('dashboard.features.aiPlan'),
      description: t('dashboard.features.aiPlan.desc'),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progress: 0,
    },
    {
      id: 'design-studio',
      title: t('dashboard.features.designStudio'),
      description: t('dashboard.features.designStudio.desc'),
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      progress: 0,
    },
    {
      id: 'marketing',
      title: t('dashboard.features.marketing'),
      description: t('dashboard.features.marketing.desc'),
      icon: Megaphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      progress: 0,
    },
  ];

  const stats = [
    { label: t('dashboard.stats.ideasAnalyzed'), value: '1', icon: TrendingUp },
    { label: t('dashboard.stats.plansGenerated'), value: '0', icon: FileText },
    { label: t('dashboard.stats.designsCreated'), value: '0', icon: Palette },
    { label: t('dashboard.stats.marketingAssets'), value: '0', icon: Target },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="gradient-warm rounded-2xl p-8 mb-8 shadow-medium">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('dashboard.hero.title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('dashboard.hero.description')}
          </p>
          <Button 
            variant="craft" 
            size="xl"
            onClick={() => onTabChange('idea')}
            className="group"
          >
            {t('dashboard.hero.cta')}
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
                    {t('dashboard.progress')}: {feature.progress}%
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
            {t('dashboard.nextSteps')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.nextSteps.desc')}
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
                  <h4 className="font-semibold">{t('dashboard.step1')}</h4>
                  <p className="text-sm text-muted-foreground">{t('dashboard.step1.desc')}</p>
                </div>
              </div>
              <Button variant="warm" onClick={() => onTabChange('idea')}>
                {t('dashboard.startNow')}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">{t('dashboard.step2')}</h4>
                  <p className="text-sm text-muted-foreground">{t('dashboard.step2.desc')}</p>
                </div>
              </div>
              <Button variant="outline" disabled>
                {t('dashboard.comingNext')}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">{t('dashboard.step3')}</h4>
                  <p className="text-sm text-muted-foreground">{t('dashboard.step3.desc')}</p>
                </div>
              </div>
              <Button variant="outline" disabled>
                {t('dashboard.comingNext')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;