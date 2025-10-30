import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Image, 
  Shirt, 
  Coffee,
  Smartphone,
  Download,
  Wand2,
  Eye,
  ShoppingBag,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesignAssets } from '@/hooks/useDesignAssets';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DesignStudio: React.FC = () => {
  const { toast } = useToast();
  const { assets, loading: assetsLoading, setAssets } = useDesignAssets();
  const [businessName, setBusinessName] = useState('');
  const [logoPrompt, setLogoPrompt] = useState('');
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isRefiningPrompt, setIsRefiningPrompt] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logo');
  const [customSceneDescription, setCustomSceneDescription] = useState('');
  const [customSceneStyle, setCustomSceneStyle] = useState('Photographic');
  const [customSceneRatio, setCustomSceneRatio] = useState('16:9');
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);
  const [isRefiningScene, setIsRefiningScene] = useState(false);
  const [mockupCustomText, setMockupCustomText] = useState('');
  const [isRefiningMockupText, setIsRefiningMockupText] = useState(false);
  const [activeMockupGeneration, setActiveMockupGeneration] = useState<string | null>(null);

  // Filter assets by type
  const generatedLogos = assets.filter(asset => asset.asset_type === 'logo');
  const generatedMockups = assets.filter(asset => asset.asset_type === 'mockup');
  const generatedScenes = assets.filter(asset => asset.asset_type === 'scene');

  const refinePrompt = async (promptType: 'logo' | 'mockup' | 'scene') => {
    let currentPrompt = '';
    let setRefining: (value: boolean) => void;
    let setPrompt: (value: string) => void;

    if (promptType === 'logo') {
      currentPrompt = logoPrompt;
      setRefining = setIsRefiningPrompt;
      setPrompt = setLogoPrompt;
    } else if (promptType === 'mockup') {
      currentPrompt = mockupCustomText;
      setRefining = setIsRefiningMockupText;
      setPrompt = setMockupCustomText;
    } else {
      currentPrompt = customSceneDescription;
      setRefining = setIsRefiningScene;
      setPrompt = setCustomSceneDescription;
    }

    if (!currentPrompt.trim()) return;

    setRefining(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-prompt', {
        body: { 
          prompt: currentPrompt, 
          type: promptType,
          businessName: promptType === 'logo' ? businessName : undefined
        }
      });

      if (error) throw error;

      if (data?.refinedPrompt) {
        setPrompt(data.refinedPrompt);
        toast({
          title: "Prompt Enhanced!",
          description: "Your description has been refined with AI.",
        });
      }
    } catch (error: any) {
      console.error('Prompt refinement error:', error);
      toast({
        title: "Refinement Failed",
        description: error.message || "Failed to refine prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefining(false);
    }
  };

  const generateLogo = async () => {
    if (!logoPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a brand description",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingLogo(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      toast({
        title: "Generating Logos",
        description: "Creating 2 unique logo variations... This may take 20-30 seconds.",
      });

      const fullPrompt = businessName 
        ? `Create a professional logo for "${businessName}". ${logoPrompt}` 
        : logoPrompt;

      const { data, error } = await supabase.functions.invoke('generate-logo', {
        body: { prompt: fullPrompt, businessName, count: 2 }
      });

      if (error) throw error;

      if (!data?.logoUrls || data.logoUrls.length === 0) {
        throw new Error('No logo URLs returned from API');
      }

      // Save all logos to database
      const savedAssets = [];
      for (let i = 0; i < data.logoUrls.length; i++) {
        const logoName = businessName || 'Logo';
        const { data: savedAsset, error: saveError } = await supabase
          .from('design_assets')
          .insert({
            user_id: user.id,
            asset_type: 'logo',
            asset_url: data.logoUrls[i],
            prompt_used: `${logoName} - Variation ${i + 1}`
          })
          .select()
          .single();

        if (saveError) throw saveError;
        savedAssets.push(savedAsset);
      }

      setAssets(prev => [...savedAssets, ...prev]);
      setLogoPrompt('');
      setBusinessName('');
      toast({
        title: "Logos Generated!",
        description: `${savedAssets.length} unique logos have been created successfully.`,
      });
    } catch (error: any) {
      console.error('Logo generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate logos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const handleGoToLogoDesign = () => {
    setActiveTab('logo');
  };

  const generateScene = async (templateId?: string) => {
    const description = templateId || customSceneDescription;
    if (!description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a scene description",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingScene(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      toast({
        title: "Generating Scene",
        description: "Creating your marketing scene... This may take 15-20 seconds.",
      });

      const { data, error } = await supabase.functions.invoke('generate-scene', {
        body: { 
          description,
          style: customSceneStyle,
          aspectRatio: customSceneRatio
        }
      });

      if (error) throw error;

      if (!data?.sceneUrl) {
        throw new Error('No scene URL returned from API');
      }

      // Save to database
      const { data: savedAsset, error: saveError } = await supabase
        .from('design_assets')
        .insert({
          user_id: user.id,
          asset_type: 'scene',
          asset_url: data.sceneUrl,
          prompt_used: description
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setAssets(prev => [savedAsset, ...prev]);
      if (!templateId) {
        setCustomSceneDescription('');
      }
      toast({
        title: "Scene Generated!",
        description: "Your marketing scene has been created.",
      });
    } catch (error: any) {
      console.error('Scene generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate scene. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingScene(false);
    }
  };

  const handleCustomSceneGenerate = () => {
    if (customSceneDescription.trim()) {
      generateScene();
    }
  };

  const createMockup = async (productType: string) => {
    if (!selectedLogo) {
      toast({
        title: "No Logo Selected",
        description: "Please select or upload a logo first",
        variant: "destructive",
      });
      return;
    }

    setActiveMockupGeneration(productType);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      toast({
        title: "Generating Mockup",
        description: `Creating your ${productType} mockup... This may take 15-20 seconds.`,
      });

      const styleAddition = mockupCustomText.trim() 
        ? `Additional customization: ${mockupCustomText}` 
        : 'Professional product photography';

      const { data, error } = await supabase.functions.invoke('generate-mockup', {
        body: { 
          logoUrl: selectedLogo.asset_url,
          productType: productType,
          style: styleAddition
        }
      });

      if (error) throw error;

      if (!data?.mockupUrl) {
        throw new Error('No mockup URL returned from API');
      }

      // Save to database
      const { data: savedAsset, error: saveError } = await supabase
        .from('design_assets')
        .insert({
          user_id: user.id,
          asset_type: 'mockup',
          asset_url: data.mockupUrl,
          prompt_used: `${productType} mockup with ${styleAddition}`
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setAssets(prev => [savedAsset, ...prev]);
      toast({
        title: "Mockup Generated!",
        description: `Your ${productType} mockup has been created.`,
      });
    } catch (error: any) {
      console.error('Mockup generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate mockup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActiveMockupGeneration(null);
    }
  };

  const downloadAsset = async (url: string, filename: string) => {
    try {
      // Use a proxy approach to handle CORS issues with OpenAI URLs
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Try to fetch and download
      try {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (fetchError) {
        // Fallback: open in new tab for user to save manually
        window.open(url, '_blank');
        toast({
          title: "Opening in New Tab",
          description: "Please right-click and save the image from the new tab.",
        });
        return;
      }
      
      toast({
        title: "Download Started",
        description: `${filename} is being downloaded.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Opening in new tab for manual save.",
        variant: "destructive",
      });
      window.open(url, '_blank');
    }
  };

  const mockupTemplates = [
    { id: 'tshirt', name: 'T-Shirt', icon: Shirt, category: 'Apparel' },
    { id: 'mug', name: 'Coffee Mug', icon: Coffee, category: 'Accessories' },
    { id: 'phone', name: 'Phone Case', icon: Smartphone, category: 'Tech' },
    { id: 'bag', name: 'Tote Bag', icon: ShoppingBag, category: 'Accessories' },
  ];

  const sceneTemplates = [
    { id: 'lifestyle', name: 'Lifestyle Scene', description: 'People using your product in real life' },
    { id: 'product', name: 'Product Shot', description: 'Clean, professional product photography' },
    { id: 'workspace', name: 'Workspace Scene', description: 'Your product in a work environment' },
    { id: 'outdoor', name: 'Outdoor Scene', description: 'Natural lighting and outdoor settings' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Palette className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Design Studio</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Create professional logos, mockups, and marketing visuals for your brand
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="logo">Logo Design</TabsTrigger>
          <TabsTrigger value="mockups">Mockups</TabsTrigger>
          <TabsTrigger value="scenes">Scenes</TabsTrigger>
        </TabsList>

        {/* Logo Design Tab */}
        <TabsContent value="logo" className="space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                AI Logo Generator
              </CardTitle>
              <CardDescription>
                Describe your brand and we'll create unique logos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Name</label>
                <Input 
                  placeholder="CraftBiz" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-medium">Brand Description</label>
                <Textarea
                  placeholder="Describe your brand personality, colors you like, style preferences..."
                  value={logoPrompt}
                  onChange={(e) => setLogoPrompt(e.target.value)}
                  className="min-h-[100px] pr-12"
                />
                {logoPrompt.trim() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 h-8 px-2"
                    onClick={() => refinePrompt('logo')}
                    disabled={isRefiningPrompt}
                    title="Refine description with AI"
                  >
                    {isRefiningPrompt ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                )}
              </div>
              <Button 
                variant="craft" 
                onClick={generateLogo}
                disabled={isGeneratingLogo || !logoPrompt.trim()}
                className="w-full"
              >
                {isGeneratingLogo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating 2 Logos...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Logos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Logos */}
          {assetsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : generatedLogos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Logos</CardTitle>
                <CardDescription>
                  Click on a logo to select it for mockups and downloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generatedLogos.map((logo) => (
                    <div
                      key={logo.id}
                      className={`cursor-pointer rounded-lg border p-4 transition-smooth hover:shadow-lg ${
                        selectedLogo?.id === logo.id ? 'ring-2 ring-primary bg-accent/20' : ''
                      }`}
                      onClick={() => setSelectedLogo(logo)}
                    >
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        <img src={logo.asset_url} alt="Generated logo" className="w-full h-full object-contain p-2" />
                      </div>
                      <h4 className="font-semibold text-sm">Generated Logo</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{logo.prompt_used}</p>
                      <div className="flex gap-1 mt-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 px-2" 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(logo.asset_url, '_blank');
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            const logoNum = generatedLogos.indexOf(logo) + 1;
                            downloadAsset(logo.asset_url, `Logo_${logoNum}.png`);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Mockups Tab */}
        <TabsContent value="mockups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Mockups</CardTitle>
              <CardDescription>
                Apply your logo to various products and merchandise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedLogo ? (
                <div className="text-center py-8">
                  <Shirt className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Logo Selected</h3>
                  <p className="text-muted-foreground">
                    Generate or upload a logo first to create mockups
                  </p>
                  <Button variant="warm" className="mt-4" onClick={handleGoToLogoDesign}>
                    Go to Logo Design
                  </Button>
                </div>
              ) : (
                <>
                  {/* Custom Text Input with Generate Button */}
                  <div className="space-y-4">
                    <div className="space-y-2 relative">
                      <label className="text-sm font-medium">Custom Mockup Text (Optional)</label>
                      <Textarea
                        placeholder="Add custom text or styling preferences for your mockup..."
                        value={mockupCustomText}
                        onChange={(e) => setMockupCustomText(e.target.value)}
                        className="min-h-[80px] pr-12"
                      />
                      {mockupCustomText.trim() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute bottom-2 right-2 h-8 px-2"
                          onClick={() => refinePrompt('mockup')}
                          disabled={isRefiningMockupText}
                          title="Refine text with AI"
                        >
                          {isRefiningMockupText ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                      )}
                    </div>
                    {mockupCustomText.trim() && (
                      <Button
                        variant="craft"
                        className="w-full"
                        onClick={() => createMockup('custom')}
                        disabled={!!activeMockupGeneration}
                      >
                        {activeMockupGeneration === 'custom' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Custom Mockup...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate Custom Mockup
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Quick Mockup Suggestions */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Quick Mockup Templates</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {mockupTemplates.map((template) => {
                        const Icon = template.icon;
                        const isGenerating = activeMockupGeneration === template.id;
                        return (
                          <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-smooth">
                            <CardContent className="pt-6 text-center">
                              <Icon className="h-12 w-12 mx-auto mb-3 text-primary" />
                              <h4 className="font-semibold mb-1">{template.name}</h4>
                              <p className="text-xs text-muted-foreground mb-3">{template.category}</p>
                              <Button 
                                size="sm" 
                                variant="warm" 
                                className="w-full"
                                onClick={() => createMockup(template.id)}
                                disabled={!!activeMockupGeneration}
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  'Create Mockup'
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Generated Mockups */}
          {generatedMockups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Mockups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedMockups.map((mockup) => (
                    <div key={mockup.id} className="rounded-lg border overflow-hidden">
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <img src={mockup.asset_url} alt="Mockup" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium mb-2">{mockup.prompt_used}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => window.open(mockup.asset_url, '_blank')}
                          >
                            <Eye className="mr-1 h-3 w-3" /> View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => downloadAsset(mockup.asset_url, `Mockup_${mockup.id}.png`)}
                          >
                            <Download className="mr-1 h-3 w-3" /> Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scenes Tab */}
        <TabsContent value="scenes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Scenes</CardTitle>
              <CardDescription>
                Create professional photography and lifestyle scenes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Custom Scene Generator */}
              <div className="space-y-4">
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium">Scene Description</label>
                  <Textarea
                    placeholder="Describe the scene you want to create..."
                    value={customSceneDescription}
                    onChange={(e) => setCustomSceneDescription(e.target.value)}
                    className="min-h-[100px] pr-12"
                  />
                  {customSceneDescription.trim() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-2 right-2 h-8 px-2"
                      onClick={() => refinePrompt('scene')}
                      disabled={isRefiningScene}
                      title="Refine description with AI"
                    >
                      {isRefiningScene ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style</label>
                    <Select value={customSceneStyle} onValueChange={setCustomSceneStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Photographic">Photographic</SelectItem>
                        <SelectItem value="Minimalist">Minimalist</SelectItem>
                        <SelectItem value="Realistic">Realistic</SelectItem>
                        <SelectItem value="Anime">Anime</SelectItem>
                        <SelectItem value="3D Render">3D Render</SelectItem>
                        <SelectItem value="Sketch">Sketch</SelectItem>
                        <SelectItem value="Digital Art">Digital Art</SelectItem>
                        <SelectItem value="Cinematic">Cinematic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aspect Ratio</label>
                    <Select value={customSceneRatio} onValueChange={setCustomSceneRatio}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                        <SelectItem value="3:2">3:2 (Photo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  variant="craft" 
                  onClick={handleCustomSceneGenerate}
                  disabled={isGeneratingScene || !customSceneDescription.trim()}
                  className="w-full"
                >
                  {isGeneratingScene ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Scene...
                    </>
                  ) : (
                    <>
                      <Image className="mr-2 h-4 w-4" />
                      Generate Scene
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Scene Templates */}
              <div>
                <h3 className="text-sm font-medium mb-3">Quick Scene Templates</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sceneTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="h-auto py-3 px-4 flex flex-col items-start"
                      onClick={() => generateScene(template.description)}
                      disabled={isGeneratingScene}
                    >
                      <span className="font-semibold text-sm">{template.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">{template.description}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Scenes */}
          {generatedScenes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Scenes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedScenes.map((scene) => (
                    <div key={scene.id} className="rounded-lg border overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <img src={scene.asset_url} alt="Scene" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium mb-2 line-clamp-2">{scene.prompt_used}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => window.open(scene.asset_url, '_blank')}
                          >
                            <Eye className="mr-1 h-3 w-3" /> View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => downloadAsset(scene.asset_url, `Scene_${scene.id}.png`)}
                          >
                            <Download className="mr-1 h-3 w-3" /> Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignStudio;
