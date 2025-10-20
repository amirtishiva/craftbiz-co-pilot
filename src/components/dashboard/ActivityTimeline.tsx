import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, FileText, Palette, Megaphone, Clock } from 'lucide-react';
import { Activity } from '@/types/dashboard';
import { formatRelative } from '@/lib/dashboard-utils';

interface ActivityTimelineProps {
  activities: Activity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'idea': return Lightbulb;
      case 'plan': return FileText;
      case 'design': return Palette;
      case 'marketing': return Megaphone;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'idea': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'plan': return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
      case 'design': return 'text-purple-600 bg-purple-50 dark:bg-purple-950';
      case 'marketing': return 'text-green-600 bg-green-50 dark:bg-green-950';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getActionText = (action: string, type: string) => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    switch (action) {
      case 'created': return `Created ${typeLabel.toLowerCase()}`;
      case 'edited': return `Edited ${typeLabel.toLowerCase()}`;
      case 'deleted': return `Deleted ${typeLabel.toLowerCase()}`;
      case 'downloaded': return `Downloaded ${typeLabel.toLowerCase()}`;
      default: return action;
    }
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {getActionText(activity.action, activity.type)}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.itemTitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelative(activity.timestamp)}
                  </p>
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
