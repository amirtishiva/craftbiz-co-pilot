import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Megaphone, 
  Copy, 
  Image,
  Share2,
  Eye,
  Loader2,
  Sparkles,
  Pencil,
  Trash2
} from 'lucide-react';
import { useMarketingContent } from '@/hooks/useMarketingContent';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MarketingHub: React.FC = () => {
  const { toast } = useToast();
  const { content: generatedContent, loading: contentLoading, setContent } = useMarketingContent();
  const [contentType, setContentType] = useState('social-post');
  const [socialMediaType, setSocialMediaType] = useState('facebook');
  const [audienceType, setAudienceType] = useState('general');
  const [contentPrompt, setContentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

  const generateContent = async () => {
    if (!contentPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a campaign focus",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const requestBody: any = { 
        prompt: contentPrompt,
        contentType,
        audienceType
      };

      // Only include socialMediaType if contentType is social-post
      if (contentType === 'social-post') {
        requestBody.socialMediaType = socialMediaType;
      }

      const { data, error } = await supabase.functions.invoke('generate-marketing-content', {
        body: requestBody
      });

      if (error) throw error;

      // Check if content was saved in the backend
      if (data.savedContent) {
        setContent(prev => [data.savedContent, ...prev]);
      } else {
        // Save to database if not saved in backend
        const { data: savedContent, error: saveError } = await supabase
          .from('marketing_content')
          .insert({
            user_id: user.id,
            platform: contentType === 'social-post' ? socialMediaType : null,
            content_text: data.content,
            hashtags: []
          })
          .select()
          .single();

        if (saveError) throw saveError;
        setContent(prev => [savedContent, ...prev]);
      }
      toast({
        title: "Content Generated!",
        description: "Your marketing content has been created.",
      });
      setContentPrompt('');
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewContent = (content: any) => {
    setPreviewContent(content);
    setShowPreview(true);
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const handleEditContent = (content: any) => {
    setEditingContentId(content.id);
    setEditedContent(content.content_text);
  };

  const handleSaveEdit = (contentId: string) => {
    setContent(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, content_text: editedContent }
        : item
    ));
    setEditingContentId(null);
    setEditedContent('');
    toast({
      title: "Content Updated!",
      description: "Your changes have been saved.",
    });
  };

  const handleCancelEdit = () => {
    setEditingContentId(null);
    setEditedContent('');
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('marketing_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      setContent(prev => prev.filter(item => item.id !== contentId));
      toast({
        title: "Content Deleted",
        description: "The content has been removed successfully.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getContentHeading = (content: any) => {
    // If it's a social media post, show the platform name
    if (content.platform) {
      const platformNames: Record<string, string> = {
        facebook: 'Facebook',
        instagram: 'Instagram',
        linkedin: 'LinkedIn',
        x: 'X'
      };
      return platformNames[content.platform] || content.platform;
    }
    
    // Otherwise, show the content type
    const contentTypeNames: Record<string, string> = {
      'ad-copy': 'Advertisement Copy',
      'email': 'Email Newsletter',
      'blog-intro': 'Blog Introduction',
      'social-post': 'Social Media Post'
    };
    return contentTypeNames[contentType] || 'Marketing Content';
  };

  const handleShareContent = (content: any) => {
    const textToShare = content.content_text || content.content || '';
    if (navigator.share) {
      navigator.share({
        title: `Marketing Content`,
        text: textToShare,
      }).catch((err) => {
        console.error('Share failed:', err);
        handleCopyContent(textToShare);
      });
    } else {
      handleCopyContent(textToShare);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard (sharing not supported on this device)",
      });
    }
  };

  const refineContent = async () => {
    if (!contentPrompt.trim()) {
      toast({
        title: "Nothing to Refine",
        description: "Please enter some text to refine",
        variant: "destructive",
      });
      return;
    }

    setIsRefining(true);
    try {
      console.log('Starting content refinement...', { contentPrompt, contentType, audienceType, socialMediaType });
      
      const requestBody: any = { 
        content: contentPrompt,
        contentType,
        audienceType
      };

      // Only include socialMediaType if contentType is social-post
      if (contentType === 'social-post') {
        requestBody.socialMediaType = socialMediaType;
      }

      const { data, error } = await supabase.functions.invoke('refine-marketing-content', {
        body: requestBody
      });

      console.log('Refinement response:', { data, error });

      if (error) {
        console.error('Refinement error:', error);
        throw error;
      }

      if (!data || !data.refinedContent) {
        throw new Error('No refined content returned from API');
      }

      setContentPrompt(data.refinedContent);
      toast({
        title: "Content Refined!",
        description: "Your content has been polished and optimized.",
      });
    } catch (error) {
      console.error('Content refinement error:', error);
      toast({
        title: "Refinement Failed",
        description: error instanceof Error ? error.message : "Failed to refine content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefining(false);
    }
  };

  const marketingTools = [
    {
      id: 'content',
      title: 'Content Generator',
      description: 'AI-powered social media posts and ad copy',
      icon: Copy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'visuals',
      title: 'Visual Assets',
      description: 'Marketing graphics and posters',
      icon: Image,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Megaphone className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-foreground">Marketing Hub</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Create compelling marketing content and grow your audience
        </p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-2xl mx-auto">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
        </TabsList>

        {/* Content Generation Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  AI Content Generator
                </CardTitle>
                <CardDescription>
                  Generate engaging social media posts and ad copy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                  >
                    <option value="social-post">Social Media Post</option>
                    <option value="ad-copy">Advertisement Copy</option>
                    <option value="email">Email Newsletter</option>
                    <option value="blog-intro">Blog Introduction</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <select 
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={audienceType}
                    onChange={(e) => setAudienceType(e.target.value)}
                  >
                    <option value="general">General Consumers</option>
                    <option value="millennials">Millennials (25-40)</option>
                    <option value="conscious">Conscious Consumers</option>
                    <option value="local">Local Community</option>
                    <option value="business">Business Owners</option>
                  </select>
                </div>
                {contentType === 'social-post' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Social Media Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={socialMediaType}
                      onChange={(e) => setSocialMediaType(e.target.value)}
                    >
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="x">X (formerly Twitter)</option>
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Focus</label>
                  <div className="relative">
                    <Textarea
                      placeholder="What message do you want to convey? (e.g., supporting local artisans, product quality, cultural heritage)"
                      value={contentPrompt}
                      onChange={(e) => setContentPrompt(e.target.value)}
                      className="min-h-[100px] pr-10"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute bottom-2 right-2 h-8 w-8 p-0"
                      onClick={refineContent}
                      disabled={isRefining || !contentPrompt.trim()}
                      title="Refine content with AI"
                    >
                      {isRefining ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="craft" 
                  onClick={generateContent}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Megaphone className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tools Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Marketing Tools</CardTitle>
                <CardDescription>
                  Comprehensive tools for your marketing success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketingTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <div key={tool.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-smooth">
                        <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                          <Icon className={`h-5 w-5 ${tool.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{tool.title}</h4>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content */}
          {contentLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : generatedContent.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Review, edit, and use your AI-generated marketing content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedContent.map((content) => (
                    <div key={content.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{getContentHeading(content)}</span>
                        </div>
                        <div className="flex gap-2">
                          {editingContentId === content.id ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleSaveEdit(content.id)}
                              >
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEditContent(content)}
                                title="Edit content"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleCopyContent(content.content_text)}
                                title="Copy to clipboard"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleShareContent(content)}
                                title="Share content"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteContent(content.id)}
                                title="Delete content"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {editingContentId === content.id ? (
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="min-h-[200px] w-full"
                          placeholder="Edit your content..."
                        />
                      ) : (
                        <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                          {content.content_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Visuals Tab */}
        <TabsContent value="visuals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Visual Marketing Assets
              </CardTitle>
              <CardDescription>
                Create stunning visuals for your marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Visual Assets Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Generate marketing posters, social media graphics, and promotional materials
              </p>
              <Button 
                variant="warm"
                onClick={() => {
                  if (generatedContent.length > 0) {
                    handlePreviewContent(generatedContent[0]);
                  } else {
                    alert('Generate some content first to see the preview feature!');
                  }
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Feature
              </Button>
              
              {/* Preview Modal */}
              {showPreview && previewContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Content Preview</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowPreview(false)}
                      >
                        ×
                      </Button>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-lg">{getContentHeading(previewContent)}</span>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                          {previewContent.content_text || previewContent.content || ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline"
                        onClick={() => handleCopyContent(previewContent.content_text || previewContent.content || '')}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        variant="craft"
                        onClick={() => handleShareContent(previewContent)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingHub;