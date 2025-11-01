import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Wand2, Download, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedImage {
  id: string;
  original_url: string;
  enhanced_url: string;
  scene_url?: string;
  context_type?: string;
  created_at: string;
}

export const ImageEnhancer: React.FC = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string>('');
  const [generatedScenes, setGeneratedScenes] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState<string>('');

  const contextOptions = [
    { id: 'studio', name: 'Studio Setup', description: 'Professional studio lighting and background' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Product in real-life usage scenarios' },
    { id: 'outdoor', name: 'Outdoor Natural', description: 'Natural lighting and outdoor environment' },
    { id: 'luxury', name: 'Luxury Brand', description: 'Premium, high-end brand presentation' },
    { id: 'minimalist', name: 'Minimalist', description: 'Clean, simple, modern aesthetic' },
    { id: 'vintage', name: 'Vintage', description: 'Retro and vintage styling' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setEnhancedImage('');
      setGeneratedScenes([]);
    }
  };

  const enhanceImage = async () => {
    if (!selectedFile) return;

    setIsEnhancing(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      toast({
        title: "Enhancing Image",
        description: "AI is improving your image quality... This may take 15-20 seconds.",
      });

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const base64Image = await base64Promise;

      const { data, error } = await supabase.functions.invoke('enhance-image', {
        body: { 
          imageData: base64Image,
          enhancementType: 'quality'
        }
      });

      if (error) throw error;

      if (!data?.enhancedImage) {
        throw new Error('No enhanced image returned');
      }

      setEnhancedImage(data.enhancedImage);
      
      toast({
        title: "Image Enhanced!",
        description: "Your image quality has been improved with AI.",
      });
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateContextualScene = async (contextType: string) => {
    if (!enhancedImage && !previewUrl) {
      toast({
        title: "No Image",
        description: "Please upload and enhance an image first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingScene(true);
    setSelectedContext(contextType);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const contextData = contextOptions.find(c => c.id === contextType);
      
      toast({
        title: "Generating Scene",
        description: `Creating ${contextData?.name} context... This may take 20-30 seconds.`,
      });

      const imageToUse = enhancedImage || previewUrl;

      const { data, error } = await supabase.functions.invoke('generate-contextual-scene', {
        body: { 
          imageData: imageToUse,
          contextType: contextType,
          contextDescription: contextData?.description
        }
      });

      if (error) throw error;

      if (!data?.sceneUrl) {
        throw new Error('No scene generated');
      }

      setGeneratedScenes(prev => [...prev, data.sceneUrl]);

      // Save to database
      await supabase.from('design_assets').insert({
        user_id: user.id,
        asset_type: 'enhanced_scene',
        asset_url: data.sceneUrl,
        prompt_used: `${contextType} context scene`
      });

      toast({
        title: "Scene Generated!",
        description: `Your ${contextData?.name} scene is ready.`,
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
      setSelectedContext('');
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `${filename} is being downloaded.`,
    });
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setEnhancedImage('');
    setGeneratedScenes([]);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Image Enhancer
          </CardTitle>
          <CardDescription>
            Upload a product image to enhance quality and generate marketing scenes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!previewUrl ? (
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-smooth cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Click to upload product image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Image */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Original Image</h3>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Enhanced Image */}
                {enhancedImage && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Enhanced Image</h3>
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                      <img src={enhancedImage} alt="Enhanced" className="w-full h-full object-contain" />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={() => downloadImage(enhancedImage, 'enhanced-image.png')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="craft"
                  onClick={enhanceImage}
                  disabled={isEnhancing || !!enhancedImage}
                  className="flex-1"
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : enhancedImage ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Enhanced
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Enhance Image
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetUpload}>
                  Upload New
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Context Scene Generation */}
      {(enhancedImage || previewUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Generate Contextual Scenes
            </CardTitle>
            <CardDescription>
              Create marketing-ready scenes with different contexts and backgrounds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {contextOptions.map((context) => (
                <Button
                  key={context.id}
                  variant="outline"
                  className="h-auto flex-col items-start p-4 text-left"
                  onClick={() => generateContextualScene(context.id)}
                  disabled={isGeneratingScene}
                >
                  {isGeneratingScene && selectedContext === context.id ? (
                    <Loader2 className="h-4 w-4 mb-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mb-2" />
                  )}
                  <div className="font-medium text-sm">{context.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{context.description}</div>
                </Button>
              ))}
            </div>

            {/* Generated Scenes */}
            {generatedScenes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Generated Scenes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generatedScenes.map((scene, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img src={scene} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth"
                        onClick={() => downloadImage(scene, `scene-${index + 1}.png`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
