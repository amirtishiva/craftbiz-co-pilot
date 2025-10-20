import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Heart, Palette, Plus, Shirt } from 'lucide-react';
import { Design } from '@/types/dashboard';
import { formatRelative } from '@/lib/dashboard-utils';

interface DesignsGalleryProps {
  designs: Design[];
  onViewDesign: (id: string) => void;
  onDownloadDesign: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCreateMockup: (id: string) => void;
  onNewDesign: () => void;
}

const DesignsGallery: React.FC<DesignsGalleryProps> = ({
  designs,
  onViewDesign,
  onDownloadDesign,
  onToggleFavorite,
  onCreateMockup,
  onNewDesign,
}) => {
  if (designs.length === 0) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Design Assets</h2>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950 flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your brand identity begins here</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create stunning logos, mockups, and marketing visuals with AI.
            </p>
            <Button size="lg" variant="craft" onClick={onNewDesign}>
              <Plus className="mr-2 h-5 w-5" />
              Design Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div id="designs-gallery" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Design Assets</h2>
        <Button variant="craft" onClick={onNewDesign}>
          <Plus className="mr-2 h-4 w-4" />
          Create Design
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
          <Card 
            key={design.id}
            className="hover:shadow-medium transition-smooth overflow-hidden group"
          >
            <div className="relative aspect-video bg-muted">
              <img 
                src={design.thumbnailUrl || design.imageUrl}
                alt={design.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-smooth cursor-pointer"
                onClick={() => onViewDesign(design.id)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-smooth flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => onViewDesign(design.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Size
                </Button>
              </div>
              <button
                className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background transition-smooth"
                onClick={() => onToggleFavorite(design.id)}
              >
                <Heart 
                  className={`h-4 w-4 ${design.favorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                />
              </button>
            </div>
            
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold line-clamp-1">{design.name}</h3>
                <Badge variant="outline" className="text-xs capitalize">
                  {design.type}
                </Badge>
              </div>
              {design.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {design.description}
                </p>
              )}
              {design.style && (
                <Badge variant="secondary" className="text-xs mb-2">
                  {design.style}
                </Badge>
              )}
              <p className="text-xs text-muted-foreground">
                {formatRelative(design.createdAt)}
              </p>
            </CardContent>
            
            <CardFooter className="flex gap-2 flex-wrap pt-0">
              <Button size="sm" variant="ghost" onClick={() => onDownloadDesign(design.id)}>
                <Download className="mr-1 h-3 w-3" />
                Download
              </Button>
              {design.type === 'logo' && (
                <Button size="sm" variant="warm" onClick={() => onCreateMockup(design.id)}>
                  <Shirt className="mr-1 h-3 w-3" />
                  Create Mockup
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DesignsGallery;
