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
  Upload,
  Eye,
  Heart,
  Share2,
  Loader2
} from 'lucide-react';
import { useDesignAssets } from '@/hooks/useDesignAssets';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DesignStudio: React.FC = () => {
  const { toast } = useToast();
  const { assets, loading: assetsLoading, setAssets } = useDesignAssets();
  const [logoPrompt, setLogoPrompt] = useState('');
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('logo');
  const [customSceneDescription, setCustomSceneDescription] = useState('');
  const [customSceneStyle, setCustomSceneStyle] = useState('Photographic');
  const [customSceneRatio, setCustomSceneRatio] = useState('16:9 (Landscape)');
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);

  // Filter assets by type
  const generatedLogos = assets.filter(asset => asset.asset_type === 'logo');
  const generatedScenes = assets.filter(asset => asset.asset_type === 'scene');

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
        title: "Generating Logo",
        description: "Creating your logo with AI... This may take 10-15 seconds.",
      });

      const { data, error } = await supabase.functions.invoke('generate-logo', {
        body: { prompt: logoPrompt }
      });

      if (error) throw error;

      if (!data?.logoUrl) {
        throw new Error('No logo URL returned from API');
      }

      // Save to database
      const { data: savedAsset, error: saveError } = await supabase
        .from('design_assets')
        .insert({
          user_id: user.id,
          asset_type: 'logo',
          asset_url: data.logoUrl,
          prompt_used: logoPrompt
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setAssets(prev => [savedAsset, ...prev]);
      setLogoPrompt('');
      toast({
        title: "Logo Generated!",
        description: "Your logo has been created successfully.",
      });
    } catch (error: any) {
      console.error('Logo generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Set as selected logo for mockups
      setSelectedLogo({
        id: 'uploaded',
        style: 'Uploaded Design',
        description: 'Your uploaded logo',
        file: file
      });
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

  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  const [generatedMockups, setGeneratedMockups] = useState<any[]>([]);

  const createMockup = async (templateId: string) => {
    if (!selectedLogo) {
      toast({
        title: "No Logo Selected",
        description: "Please select a logo first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingMockup(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      toast({
        title: "Generating Mockup",
        description: "Creating your product mockup... This may take 15-20 seconds.",
      });

      const { data, error } = await supabase.functions.invoke('generate-mockup', {
        body: { 
          logoUrl: selectedLogo.asset_url || '',
          productType: templateId,
          style: 'Professional product photography'
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
          prompt_used: `${templateId} mockup`
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setGeneratedMockups(prev => [savedAsset, ...prev]);
      toast({
        title: "Mockup Generated!",
        description: "Your product mockup has been created.",
      });
    } catch (error: any) {
      console.error('Mockup generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate mockup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMockup(false);
    }
  };

  const mockupTemplates = [
    { id: 'tshirt', name: 'T-Shirt', icon: Shirt, category: 'Apparel' },
    { id: 'mug', name: 'Coffee Mug', icon: Coffee, category: 'Accessories' },
    { id: 'phone', name: 'Phone Case', icon: Smartphone, category: 'Tech' },
    { id: 'bag', name: 'Tote Bag', icon: Upload, category: 'Accessories' },
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
          <Palette className="h-8 w-8 text-purple-600" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Generator */}
            <Card>
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
                  <Input placeholder="CraftBiz" />
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
                      className="absolute bottom-2 left-2 h-8 px-2"
                      onClick={() => {
                        const refined = `${logoPrompt}\n\nEnhanced: Create a modern, professional logo that represents innovation and trust.`;
                        setLogoPrompt(refined);
                      }}
                      title="Refine description with AI"
                    >
                      <Wand2 className="h-4 w-4 text-purple-600" />
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Logos...
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

            {/* Upload Alternative */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Existing Design
                </CardTitle>
                <CardDescription>
                  Have a logo already? Upload it to create mockups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Upload Your Logo</h3>
                  <p className="text-muted-foreground mb-4">
                    {uploadedFile ? `Uploaded: ${uploadedFile.name}` : 'Drag and drop your logo file here'}
                  </p>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

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
                      className={`cursor-pointer rounded-lg border p-4 transition-smooth hover:shadow-medium ${
                        selectedLogo?.id === logo.id ? 'ring-2 ring-accent-orange bg-accent/20' : ''
                      }`}
                      onClick={() => setSelectedLogo(logo)}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        <img src={logo.asset_url} alt="Generated logo" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-semibold text-sm">Generated Logo</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{logo.prompt_used}</p>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => window.open(logo.asset_url, '_blank')}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2">
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
            <CardContent>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mockupTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card key={template.id} className="cursor-pointer hover:shadow-medium transition-smooth">
                        <CardContent className="pt-6 text-center">
                          <Icon className="h-12 w-12 mx-auto mb-3 text-accent-orange" />
                          <h4 className="font-semibold mb-1">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mb-3">{template.category}</p>
                          <Button 
                            size="sm" 
                            variant="warm" 
                            className="w-full"
                            onClick={() => createMockup(template.id)}
                            disabled={isGeneratingMockup}
                          >
                            {isGeneratingMockup ? (
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
              )}

              {/* Generated Mockups Display */}
              {generatedMockups.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Generated Mockups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {generatedMockups.map((mockup) => (
                        <div key={mockup.id} className="border border-border rounded-lg p-3">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            <img src={mockup.asset_url} alt="Mockup" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{mockup.prompt_used}</p>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 px-2 flex-1" onClick={() => window.open(mockup.asset_url, '_blank')}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2 flex-1">
                              <Download className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenes Tab */}
        <TabsContent value="scenes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                AI Scene Creator
              </CardTitle>
              <CardDescription>
                Generate custom marketing scenes and lifestyle photos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sceneTemplates.map((scene) => (
                  <Card key={scene.id} className="cursor-pointer hover:shadow-medium transition-smooth">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">{scene.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{scene.description}</p>
                      <Button 
                        variant="warm" 
                        size="sm" 
                        className="w-full"
                        onClick={() => generateScene(scene.id)}
                        disabled={isGeneratingScene}
                      >
                        {isGeneratingScene ? 'Generating...' : 'Generate Scene'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Custom Scene Description</label>
                    <Textarea
                      placeholder="Describe the scene you want to create (e.g., 'A cozy coffee shop with customers using handmade ceramic mugs')"
                      className="mt-2"
                      value={customSceneDescription}
                      onChange={(e) => setCustomSceneDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Style</label>
                      <select 
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                        value={customSceneStyle}
                        onChange={(e) => setCustomSceneStyle(e.target.value)}
                      >
                        <option>Photographic</option>
                        <option>Artistic</option>
                        <option>Minimalist</option>
                        <option>Vintage</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Aspect Ratio</label>
                      <select 
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                        value={customSceneRatio}
                        onChange={(e) => setCustomSceneRatio(e.target.value)}
                      >
                        <option>16:9 (Landscape)</option>
                        <option>1:1 (Square)</option>
                        <option>9:16 (Portrait)</option>
                        <option>4:3 (Classic)</option>
                      </select>
                    </div>
                  </div>
                  <Button 
                    variant="craft" 
                    className="w-full"
                    onClick={handleCustomSceneGenerate}
                    disabled={isGeneratingScene || !customSceneDescription.trim()}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isGeneratingScene ? 'Generating Scene...' : 'Generate Custom Scene'}
                  </Button>
                  
                  {/* Generated Scenes Display */}
                  {generatedScenes.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-4">Generated Scenes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedScenes.map((scene) => (
                          <div key={scene.id} className="border border-border rounded-lg p-4">
                            <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                              <img src={scene.asset_url} alt="Scene" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{scene.prompt_used}</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1" onClick={() => window.open(scene.asset_url, '_blank')}>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Download className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignStudio;