import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, FileText, Palette, Megaphone } from 'lucide-react';
import { formatRelative } from '@/lib/dashboard-utils';
import { Activity } from '@/types/dashboard';

interface ActivityTimelineProps {
  activities: Activity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (activities.length === 0) return null;

  const iconMap = {
    idea: Lightbulb,
    plan: FileText,
    design: Palette,
    marketing: Megaphone,
  };

  const colorMap = {
    idea: 'text-yellow-600 bg-yellow-50',
    plan: 'text-blue-600 bg-blue-50',
    design: 'text-purple-600 bg-purple-50',
    marketing: 'text-green-600 bg-green-50',
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 10).map((activity) => {
            const Icon = iconMap[activity.type];
            const colorClass = colorMap[activity.type];
            
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-foreground">
                    <span className="font-semibold capitalize">{activity.action}</span>{' '}
                    <span className="text-muted-foreground">{activity.itemTitle}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatRelative(activity.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
