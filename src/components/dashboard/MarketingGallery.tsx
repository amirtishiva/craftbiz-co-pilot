import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit, Eye, Trash, Megaphone, Plus, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { MarketingContent } from '@/types/dashboard';
import { truncate, formatRelative } from '@/lib/dashboard-utils';
import { toast } from '@/hooks/use-toast';

interface MarketingGalleryProps {
  marketing: MarketingContent[];
  onViewContent: (id: string) => void;
  onEditContent: (id: string) => void;
  onDeleteContent: (id: string) => void;
  onNewContent: () => void;
}

const MarketingGallery: React.FC<MarketingGalleryProps> = ({
  marketing,
  onViewContent,
  onEditContent,
  onDeleteContent,
  onNewContent,
}) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      default: return Megaphone;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'text-blue-600';
      case 'instagram': return 'text-pink-600';
      case 'linkedin': return 'text-blue-700';
      case 'twitter': return 'text-sky-500';
      default: return 'text-green-600';
    }
  };

  const getEngagementBadge = (engagement: string) => {
    switch (engagement) {
      case 'high': return { label: '🔥 High Engagement', variant: 'default' as const };
      case 'medium': return { label: '👍 Good Engagement', variant: 'secondary' as const };
      default: return { label: '💡 Medium Engagement', variant: 'outline' as const };
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  if (marketing.length === 0) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Marketing Content</h2>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Let's tell your story to the world</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Generate engaging marketing content for social media and campaigns.
            </p>
            <Button size="lg" variant="craft" onClick={onNewContent}>
              <Plus className="mr-2 h-5 w-5" />
              Create Content
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div id="marketing-gallery" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Marketing Content</h2>
        <Button variant="craft" onClick={onNewContent}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Content
        </Button>
      </div>
      
      <div className="space-y-4">
        {marketing.map((content) => {
          const PlatformIcon = getPlatformIcon(content.platform);
          const engagement = getEngagementBadge(content.engagement);
          
          return (
            <Card key={content.id} className="hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted`}>
                      <PlatformIcon className={`h-5 w-5 ${getPlatformColor(content.platform)}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">{content.platform}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(content.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={engagement.variant}>
                    {engagement.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
                  {content.content.length > 300 
                    ? truncate(content.content, 300) 
                    : content.content}
                </p>
                
                {content.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {content.hashtags.slice(0, 5).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {content.hashtags.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{content.hashtags.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant="warm"
                  onClick={() => copyToClipboard(content.content)}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onViewContent(content.id)}>
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onEditContent(content.id)}>
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDeleteContent(content.id)}>
                  <Trash className="mr-1 h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MarketingGallery;
