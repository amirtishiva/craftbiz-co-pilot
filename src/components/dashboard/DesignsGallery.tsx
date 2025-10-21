import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Eye, Download, Heart, Shirt } from 'lucide-react';
import { formatRelative } from '@/lib/dashboard-utils';
import { Design } from '@/types/dashboard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DesignsGalleryProps {
  designs: Design[];
  onViewDesign: (id: string) => void;
  onDownloadDesign: (id: string) => void;
  onCreateMockup: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onNewDesign: () => void;
}

const DesignsGallery: React.FC<DesignsGalleryProps> = ({
  designs,
  onViewDesign,
  onDownloadDesign,
  onCreateMockup,
  onToggleFavorite,
  onNewDesign,
}) => {
  const [filter, setFilter] = useState<'all' | 'logo' | 'mockup' | 'scene'>('all');

  const filteredDesigns = filter === 'all' 
    ? designs 
    : designs.filter(d => d.type === filter);

  if (designs.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Your Design Assets</h2>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Your brand identity begins here</h3>
            <p className="text-muted-foreground mb-6">
              Create stunning logos, mockups, and marketing visuals with AI.
            </p>
            <Button size="lg" onClick={onNewDesign}>
              Design Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Your Design Assets</h2>
        <Button onClick={onNewDesign}>+ Create Design</Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All ({designs.length})</TabsTrigger>
          <TabsTrigger value="logo">
            Logos ({designs.filter(d => d.type === 'logo').length})
          </TabsTrigger>
          <TabsTrigger value="mockup">
            Mockups ({designs.filter(d => d.type === 'mockup').length})
          </TabsTrigger>
          <TabsTrigger value="scene">
            Scenes ({designs.filter(d => d.type === 'scene').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDesigns.map((design) => (
          <Card key={design.id} className="overflow-hidden group hover:shadow-medium transition-smooth">
            <div className="relative aspect-video bg-muted">
              <img
                src={design.thumbnailUrl || design.imageUrl}
                alt={design.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-smooth cursor-pointer"
                onClick={() => onViewDesign(design.id)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-smooth flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-smooth flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onViewDesign(design.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onDownloadDesign(design.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  {design.type === 'logo' && (
                    <Button size="sm" variant="secondary" onClick={() => onCreateMockup(design.id)}>
                      <Shirt className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => onToggleFavorite(design.id)}
                  >
                    <Heart className={`h-4 w-4 ${design.favorited ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>
              <Badge className="absolute top-2 right-2 bg-purple-100 text-purple-800">
                {design.type}
              </Badge>
            </div>

            <CardContent className="pt-4">
              <h3 className="font-semibold text-foreground mb-1">{design.name}</h3>
              {design.description && (
                <p className="text-sm text-muted-foreground mb-2">{design.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatRelative(design.createdAt)}
                </span>
                {design.style && (
                  <Badge variant="outline" className="text-xs">
                    {design.style}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DesignsGallery;
