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
  Eye,
  Loader2,
  Sparkles,
  Pencil,
  Trash2,
  Download,
  LayoutTemplate
} from 'lucide-react';
import { useMarketingContent } from '@/hooks/useMarketingContent';
import { useBannerDesigns } from '@/hooks/useBannerDesigns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MarketingHub: React.FC = () => {
  const { toast } = useToast();
  const { content: generatedContent, loading: contentLoading, setContent } = useMarketingContent();
  const [contentType, setContentType] = useState('social-post');
  const [socialMediaType, setSocialMediaType] = useState('facebook');
  const [audienceType, setAudienceType] = useState('general');
  const [inputType, setInputType] = useState<'text' | 'image'>('text');
  const [contentPrompt, setContentPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

  // Banner Design states
  const { data: bannerDesigns, refetch: refetchBanners } = useBannerDesigns();
  const [bannerSize, setBannerSize] = useState('instagram-post');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [bannerInputType, setBannerInputType] = useState<'text' | 'image'>('text');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [styleTheme, setStyleTheme] = useState('minimalist');
  const [colorScheme, setColorScheme] = useState('brand');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [textDescription, setTextDescription] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [generatedBanners, setGeneratedBanners] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateContent = async () => {
    if (inputType === 'text' && !contentPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a campaign focus",
        variant: "destructive",
      });
      return;
    }

    if (inputType === 'image' && !selectedImage) {
      toast({
        title: "Missing Information",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      let imageData = null;
      if (inputType === 'image' && selectedImage) {
        const reader = new FileReader();
        imageData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedImage);
        });
      }

      const requestBody: any = { 
        prompt: contentPrompt,
        contentType,
        audienceType,
        inputType,
        imageData
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
            content_type: contentType,
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
      setSelectedImage(null);
      setImagePreview(null);
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
    // First check if content has a stored content_type
    if (content.content_type) {
      const contentTypeNames: Record<string, string> = {
        'ad-copy': 'Advertisement Copy',
        'email': 'Email Newsletter',
        'blog-intro': 'Blog Introduction',
        'social-post': 'Social Media Post'
      };
      
      // If it's a social post with a platform, show the platform name
      if (content.content_type === 'social-post' && content.platform) {
        const platformNames: Record<string, string> = {
          facebook: 'Facebook',
          instagram: 'Instagram',
          linkedin: 'LinkedIn',
          x: 'X'
        };
        return platformNames[content.platform] || content.platform;
      }
      
      // Otherwise show the content type
      return contentTypeNames[content.content_type] || 'Marketing Content';
    }
    
    // Fallback for old content without content_type field
    if (content.platform) {
      const platformNames: Record<string, string> = {
        facebook: 'Facebook',
        instagram: 'Instagram',
        linkedin: 'LinkedIn',
        x: 'X'
      };
      return platformNames[content.platform] || content.platform;
    }
    
    return 'Marketing Content';
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

  // Banner Design functions
  const handleReferenceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBanner = async () => {
    if (!headline.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a headline for your banner",
        variant: "destructive",
      });
      return;
    }

    if (bannerInputType === 'image' && !referenceImage) {
      toast({
        title: "Missing Information",
        description: "Please upload a reference image",
        variant: "destructive",
      });
      return;
    }

    if (bannerSize === 'custom' && (!customWidth || !customHeight)) {
      toast({
        title: "Missing Information",
        description: "Please specify custom dimensions",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingBanner(true);
    setGeneratedBanners([]);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      let referenceImageData = null;
      if (bannerInputType === 'image' && referenceImage) {
        const reader = new FileReader();
        referenceImageData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(referenceImage);
        });
      }

      const { data, error } = await supabase.functions.invoke('generate-banner', {
        body: {
          bannerSize,
          customWidth: bannerSize === 'custom' ? parseInt(customWidth) : null,
          customHeight: bannerSize === 'custom' ? parseInt(customHeight) : null,
          inputType: bannerInputType,
          headline,
          subheadline,
          ctaText,
          styleTheme,
          colorScheme,
          primaryColor: primaryColor || null,
          secondaryColor: secondaryColor || null,
          textDescription: bannerInputType === 'text' ? textDescription : null,
          referenceImageData,
          planId: null,
        }
      });

      if (error) throw error;

      if (data?.success && data?.banners) {
        setGeneratedBanners(data.banners);
        await refetchBanners();
        toast({
          title: "Success!",
          description: "Banner variants generated successfully",
        });
      } else {
        throw new Error('No banners generated');
      }
    } catch (error) {
      console.error('Error generating banner:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate banner",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBanner(false);
    }
  };

  const downloadBanner = (url: string, format: 'png' | 'jpg') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `banner-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `Banner downloaded as ${format.toUpperCase()}`,
    });
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
    },
    {
      id: 'banners',
      title: 'Banner Design',
      description: 'Professional banners for all platforms',
      icon: LayoutTemplate,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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
        <TabsList className="grid grid-cols-3 w-full max-w-3xl mx-auto">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
          <TabsTrigger value="banners">Banner Design</TabsTrigger>
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
                  <label className="text-sm font-medium">Campaign Focus Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={inputType}
                    onChange={(e) => {
                      setInputType(e.target.value as 'text' | 'image');
                      setContentPrompt('');
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    <option value="text">Text-based</option>
                    <option value="image">Image-based</option>
                  </select>
                </div>
                {inputType === 'text' ? (
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
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Image</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="relative border rounded-lg p-4 bg-muted/30 mt-2">
                        <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Upload a product photo, mockup, or visual to generate contextual marketing content
                    </p>
                  </div>
                )}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banner Design Tab */}
        <TabsContent value="banners" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5" />
                  Banner Design Studio
                </CardTitle>
                <CardDescription>
                  Create professional marketing banners with AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Banner Size</Label>
                  <Select value={bannerSize} onValueChange={setBannerSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram-post">Instagram Post (1080x1080)</SelectItem>
                      <SelectItem value="instagram-story">Instagram Story (1080x1920)</SelectItem>
                      <SelectItem value="facebook-cover">Facebook Cover (820x312)</SelectItem>
                      <SelectItem value="facebook-post">Facebook Post (1200x630)</SelectItem>
                      <SelectItem value="linkedin-banner">LinkedIn Banner (1584x396)</SelectItem>
                      <SelectItem value="twitter-header">X Header (1500x500)</SelectItem>
                      <SelectItem value="youtube-thumbnail">YouTube Thumbnail (1280x720)</SelectItem>
                      <SelectItem value="website-hero">Website Hero (1920x600)</SelectItem>
                      <SelectItem value="email-header">Email Header (600x200)</SelectItem>
                      <SelectItem value="custom">Custom Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bannerSize === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Width (px)</Label>
                      <Input
                        type="number"
                        placeholder="1920"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        placeholder="1080"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Input Type</Label>
                  <Select value={bannerInputType} onValueChange={(val) => setBannerInputType(val as 'text' | 'image')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Description</SelectItem>
                      <SelectItem value="image">Image Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Headline *</Label>
                  <Input
                    placeholder="e.g., Diwali Mega Sale! 🪔"
                    maxLength={50}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subheadline</Label>
                  <Input
                    placeholder="e.g., Up to 50% Off on Handcrafted Goods"
                    maxLength={80}
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Call-to-Action</Label>
                  <Input
                    placeholder="e.g., Shop Now"
                    maxLength={20}
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Style/Theme</Label>
                  <Select value={styleTheme} onValueChange={setStyleTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="bold">Bold & Vibrant</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="festive">Festive</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="modern">Modern Tech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">Brand Colors</SelectItem>
                      <SelectItem value="warm">Warm (Red/Orange/Yellow)</SelectItem>
                      <SelectItem value="cool">Cool (Blue/Green/Purple)</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {colorScheme === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <Input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {bannerInputType === 'text' ? (
                  <div className="space-y-2">
                    <Label>Additional Description</Label>
                    <Textarea
                      placeholder="e.g., Traditional Indian patterns with diyas and rangoli"
                      value={textDescription}
                      onChange={(e) => setTextDescription(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Reference Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleReferenceImageSelect}
                      className="cursor-pointer"
                    />
                    {referenceImagePreview && (
                      <div className="relative border rounded-lg p-4 bg-muted/30 mt-2">
                        <div className="w-full h-32 flex items-center justify-center overflow-hidden rounded">
                          <img 
                            src={referenceImagePreview} 
                            alt="Reference Preview" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setReferenceImage(null);
                            setReferenceImagePreview(null);
                          }}
                          className="absolute top-2 right-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  variant="craft" 
                  onClick={generateBanner}
                  disabled={isGeneratingBanner}
                  className="w-full"
                >
                  {isGeneratingBanner ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Banners...
                    </>
                  ) : (
                    <>
                      <LayoutTemplate className="mr-2 h-4 w-4" />
                      Generate Banner Variants
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Banners</CardTitle>
                <CardDescription>
                  {generatedBanners.length > 0 
                    ? "3 variants ready for download" 
                    : "Your generated banners will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGeneratingBanner ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Generating 3 banner variants...</p>
                  </div>
                ) : generatedBanners.length > 0 ? (
                  <div className="space-y-4">
                    {generatedBanners.map((banner, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Variant {index + 1}</span>
                        </div>
                        <div className="bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center min-h-[200px]">
                          <img 
                            src={banner} 
                            alt={`Banner Variant ${index + 1}`}
                            className="max-w-full max-h-[300px] object-contain"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBanner(banner, 'png')}
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            PNG
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBanner(banner, 'jpg')}
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            JPG
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <LayoutTemplate className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Configure your banner and click Generate to create 3 professional variants
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingHub;