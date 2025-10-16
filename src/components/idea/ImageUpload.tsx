import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  Camera, 
  X, 
  Eye,
  Sparkles,
  CheckCircle,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onProductAnalyzed: (productData: any) => void;
}

interface ProductAnalysis {
  productType: string;
  materials: string[];
  style: string;
  colors: string[];
  targetAudience: string;
  businessContext: string;
  suggestedBusinessIdea: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onProductAnalyzed }) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const simulateImageAnalysis = async (): Promise<ProductAnalysis> => {
    // Step 1: Image Understanding
    setAnalysisStep('Analyzing product image...');
    setProgress(20);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setAnalysisStep('Identifying product type and materials...');
    setProgress(40);
    await new Promise(resolve => setTimeout(resolve, 1200));

    setAnalysisStep('Detecting style and craftsmanship details...');
    setProgress(60);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setAnalysisStep('Mapping product to business context...');
    setProgress(80);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setAnalysisStep('Generating business plan prompt...');
    setProgress(95);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate AI Vision Analysis (GPT-4o or CLIP)
    const analysis: ProductAnalysis = {
      productType: 'Handwoven Textile / Fabric',
      materials: ['Natural Cotton', 'Traditional Dyes', 'Hand-spun Thread'],
      style: 'Traditional Indian Handloom',
      colors: ['Natural Beige', 'Indigo Blue', 'Earth Tones'],
      targetAudience: 'Urban customers who prefer sustainable and eco-friendly products',
      businessContext: 'Sustainable Fashion / Ethnic Wear',
      suggestedBusinessIdea: 'A business selling eco-friendly handcrafted traditional textiles, targeting urban customers who value sustainable living and authentic craftsmanship. The products will feature traditional Indian handloom techniques with natural dyes and organic materials.'
    };

    setProgress(100);
    return analysis;
  };

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, WEBP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Start analysis
    setIsAnalyzing(true);
    setProgress(0);

    try {
      const analysis = await simulateImageAnalysis();
      setProductAnalysis(analysis);
      
      toast({
        title: "Product Analysis Complete!",
        description: `Identified as ${analysis.productType}. Ready to generate business plan.`,
      });

    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the product image. Please try again.",
        variant: "destructive",
      });
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
      setAnalysisStep('');
    }
  }, [toast]);

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      streamRef.current = stream;
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly play the video stream
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error('Video play error:', playError);
        }
      }
      
      toast({
        title: "Camera Ready",
        description: "Position your product and click Capture to take a photo.",
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to capture photos.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setUploadedImage(file);
          setImagePreview(canvas.toDataURL('image/jpeg'));
          
          stopCamera();
          
          // Start analysis
          setIsAnalyzing(true);
          setProgress(0);

          try {
            const analysis = await simulateImageAnalysis();
            setProductAnalysis(analysis);
            
            toast({
              title: "Product Analysis Complete!",
              description: `Identified as ${analysis.productType}. Ready to generate business plan.`,
            });
          } catch (error) {
            toast({
              title: "Analysis Failed",
              description: "Failed to analyze the product image. Please try again.",
              variant: "destructive",
            });
            console.error('Analysis error:', error);
          } finally {
            setIsAnalyzing(false);
            setProgress(0);
            setAnalysisStep('');
          }
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const resetUpload = () => {
    stopCamera();
    setUploadedImage(null);
    setImagePreview('');
    setProductAnalysis(null);
  };

  const handleGenerateBusinessPlan = () => {
    if (!productAnalysis) return;

    const productData = {
      type: 'image',
      imageFile: uploadedImage,
      analysis: productAnalysis,
      businessIdea: productAnalysis.suggestedBusinessIdea,
      timestamp: new Date().toISOString(),
    };

    onProductAnalyzed(productData);
  };

  return (
    <div className="space-y-6">
      {!uploadedImage && !isCameraActive ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload or Capture Product Image</h3>
                <p className="text-muted-foreground mb-4">
                  Upload an existing photo or use your camera to capture a new one
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleCameraCapture}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Product Analysis
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Our AI will analyze your product image to identify the type, materials, style, and craftsmanship details. 
                  Then it will generate a tailored business plan based on your product.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isCameraActive ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle>Camera Capture</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={stopCamera}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
            <CardDescription>
              Position your product in the frame and click Capture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              onClick={capturePhoto}
              variant="craft"
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        uploadedImage && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle>Product Image Analysis</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <CardDescription>
                AI analysis of your product image
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Preview */}
            <div className="flex items-start gap-4 p-3 bg-secondary rounded-lg">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{uploadedImage.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {(uploadedImage.size / 1024).toFixed(1)} KB
                </p>
                {productAnalysis && (
                  <Badge variant="secondary" className="mt-2">
                    <Eye className="h-3 w-3 mr-1" />
                    Analyzed
                  </Badge>
                )}
              </div>
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{analysisStep}</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Product Analysis Results */}
            {productAnalysis && !isAnalyzing && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Analysis Results
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">Product Type:</span>
                      <p className="text-green-800 dark:text-green-200">{productAnalysis.productType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">Style:</span>
                      <p className="text-green-800 dark:text-green-200">{productAnalysis.style}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">Materials:</span>
                      <p className="text-green-800 dark:text-green-200">{productAnalysis.materials.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">Colors:</span>
                      <p className="text-green-800 dark:text-green-200">{productAnalysis.colors.join(', ')}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-green-900 dark:text-green-100">Business Context:</span>
                      <p className="text-green-800 dark:text-green-200">{productAnalysis.businessContext}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-green-900 dark:text-green-100">Target Audience:</span>
                      <p className="text-green-800 dark:text-green-200">{productAnalysis.targetAudience}</p>
                    </div>
                  </div>
                </div>

                {/* Suggested Business Idea */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Suggested Business Idea:
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {productAnalysis.suggestedBusinessIdea}
                  </p>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleGenerateBusinessPlan}
                  variant="craft"
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Business Plan from Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        )
      )}
    </div>
  );
};

export default ImageUpload;