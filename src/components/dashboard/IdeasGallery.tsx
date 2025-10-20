import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Type, Image as ImageIcon, Eye, Edit, Trash, FileText, Plus } from 'lucide-react';
import { Idea } from '@/types/dashboard';
import { truncate, formatRelative } from '@/lib/dashboard-utils';

interface IdeasGalleryProps {
  ideas: Idea[];
  onViewIdea: (id: string) => void;
  onEditIdea: (id: string) => void;
  onDeleteIdea: (id: string) => void;
  onGeneratePlan: (id: string) => void;
  onNewIdea: () => void;
}

const IdeasGallery: React.FC<IdeasGalleryProps> = ({
  ideas,
  onViewIdea,
  onEditIdea,
  onDeleteIdea,
  onGeneratePlan,
  onNewIdea,
}) => {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'voice': return Mic;
      case 'image': return ImageIcon;
      default: return Type;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'voice': return 'bg-blue-500';
      case 'image': return 'bg-purple-500';
      default: return 'bg-green-500';
    }
  };

  if (ideas.length === 0) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Business Ideas</h2>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-yellow-50 dark:bg-yellow-950 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No ideas yet!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Every great business starts with an idea. Share yours using voice, text, or image.
            </p>
            <Button size="lg" variant="craft" onClick={onNewIdea}>
              <Plus className="mr-2 h-5 w-5" />
              Share Your First Idea
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div id="ideas-gallery" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Business Ideas</h2>
        <Button variant="craft" onClick={onNewIdea}>
          <Plus className="mr-2 h-4 w-4" />
          New Idea
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => {
          const MethodIcon = getMethodIcon(idea.inputMethod);
          return (
            <Card 
              key={idea.id}
              className="hover:shadow-medium transition-smooth group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${getMethodColor(idea.inputMethod)} text-white`}>
                    <MethodIcon className="h-4 w-4" />
                  </div>
                  <Badge variant={idea.hasPlan ? 'default' : 'secondary'}>
                    {idea.hasPlan ? '✓ Plan Generated' : 'Draft'}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {truncate(idea.content, 120)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Badge variant="outline" className="text-xs">
                    {idea.businessType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(idea.createdAt)}
                  </span>
                </div>
                
                {idea.imageUrl && (
                  <div className="rounded-md overflow-hidden mb-3">
                    <img 
                      src={idea.imageUrl} 
                      alt={idea.title}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex gap-2 flex-wrap">
                <Button size="sm" variant="ghost" onClick={() => onViewIdea(idea.id)}>
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onEditIdea(idea.id)}>
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                {!idea.hasPlan && (
                  <Button size="sm" variant="warm" onClick={() => onGeneratePlan(idea.id)}>
                    <FileText className="mr-1 h-3 w-3" />
                    Generate Plan
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onDeleteIdea(idea.id)}>
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

export default IdeasGallery;
