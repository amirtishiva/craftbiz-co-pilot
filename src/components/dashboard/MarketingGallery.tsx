import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Copy, Edit, Eye, Share2, Trash, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { formatRelative } from '@/lib/dashboard-utils';
import { MarketingContent } from '@/types/dashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface MarketingGalleryProps {
  content: MarketingContent[];
  onViewContent: (id: string) => void;
  onEditContent: (id: string) => void;
  onCopyContent: (content: string) => void;
  onShareContent: (id: string) => void;
  onDeleteContent: (id: string) => void;
  onNewContent: () => void;
}

const MarketingGallery: React.FC<MarketingGalleryProps> = ({
  content,
  onViewContent,
  onEditContent,
  onCopyContent,
  onShareContent,
  onDeleteContent,
  onNewContent,
}) => {
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const filteredContent = platformFilter === 'all'
    ? content
    : content.filter(c => c.platform === platformFilter);

  if (content.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Your Marketing Content</h2>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Let's tell your story to the world</h3>
            <p className="text-muted-foreground mb-6">
              Generate engaging marketing content for social media and campaigns.
            </p>
            <Button size="lg" onClick={onNewContent}>
              Create Content
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      default: return Megaphone;
    }
  };

  const getEngagementBadge = (engagement: string) => {
    switch (engagement) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">🔥 High Engagement</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">👍 Good Engagement</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">💡 Medium Engagement</Badge>;
    }
  };

  const handleCopy = (text: string) => {
    onCopyContent(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Your Marketing Content</h2>
        <div className="flex gap-2">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="facebook">Facebook Only</SelectItem>
              <SelectItem value="instagram">Instagram Only</SelectItem>
              <SelectItem value="linkedin">LinkedIn Only</SelectItem>
              <SelectItem value="twitter">Twitter Only</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onNewContent}>+ Generate Content</Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredContent.map((item) => {
          const PlatformIcon = getPlatformIcon(item.platform);
          return (
            <Card key={item.id} className="hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <PlatformIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground capitalize">{item.platform}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelative(item.createdAt)}
                      </div>
                    </div>
                  </div>
                  {getEngagementBadge(item.engagement)}
                </div>
              </CardHeader>

              <CardContent>
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
                </div>

                {item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.hashtags.slice(0, 5).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.hashtags.length > 5 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        +{item.hashtags.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="warm"
                    onClick={() => handleCopy(item.content)}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onEditContent(item.id)}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onViewContent(item.id)}>
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onShareContent(item.id)}>
                    <Share2 className="h-3 w-3 mr-1" /> Share
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDeleteContent(item.id)}>
                    <Trash className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MarketingGallery;
