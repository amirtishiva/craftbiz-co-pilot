import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Eye, Edit, Trash, FileText, Mic, Type, Image as ImageIcon } from 'lucide-react';
import { formatRelative, truncate } from '@/lib/dashboard-utils';
import { Idea } from '@/types/dashboard';

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
  if (ideas.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Your Business Ideas</h2>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <Lightbulb className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No ideas yet!</h3>
            <p className="text-muted-foreground mb-6">
              Every great business starts with an idea. Share yours using voice, text, or image.
            </p>
            <Button size="lg" onClick={onNewIdea}>
              Share Your First Idea
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'voice': return Mic;
      case 'text': return Type;
      case 'image': return ImageIcon;
      default: return Type;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Your Business Ideas</h2>
        <Button onClick={onNewIdea}>+ New Idea</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((idea) => {
          const MethodIcon = getMethodIcon(idea.inputMethod);
          return (
            <Card key={idea.id} className="hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{idea.title}</CardTitle>
                    <CardDescription>{truncate(idea.content, 100)}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    <MethodIcon className="h-3 w-3 mr-1" />
                    {idea.inputMethod}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {idea.businessType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(idea.createdAt)}
                  </span>
                </div>

                {idea.hasPlan ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-4">
                    ✓ Plan Generated
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 mb-4">
                    Draft
                  </Badge>
                )}

                {idea.imageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={idea.imageUrl} 
                      alt="Product" 
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onViewIdea(idea.id)}>
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onEditIdea(idea.id)}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  {!idea.hasPlan && (
                    <Button size="sm" variant="warm" onClick={() => onGeneratePlan(idea.id)}>
                      <FileText className="h-3 w-3 mr-1" /> Generate Plan
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => onDeleteIdea(idea.id)}>
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

export default IdeasGallery;
