import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mic, 
  MicOff, 
  Type, 
  Image,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';

interface IdeaCaptureProps {
  onIdeaSubmit: (idea: any) => void;
}

const IdeaCapture: React.FC<IdeaCaptureProps> = ({ onIdeaSubmit }) => {
  const [inputMethod, setInputMethod] = useState<'text' | 'voice' | 'image'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [businessIdea, setBusinessIdea] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [productData, setProductData] = useState<any>(null);
  const { toast } = useToast();

  const businessTypes = [
    'E-commerce',
    'Food & Restaurant',
    'Technology',
    'Healthcare',
    'Education',
    'Retail',
    'Services',
    'Manufacturing',
    'Agriculture',
    'Other'
  ];

  const handleRefineIdea = async () => {
    setIsRefining(true);
    
    // Simulate AI refinement
    setTimeout(() => {
      const refinedIdea = `${businessIdea}\n\nExecutive Summary: A comprehensive platform connecting artisans with customers.\n\nBusiness Goals: Create sustainable income for local artisans while providing authentic handmade products to customers.\n\nMarket Overview: Growing demand for authentic, sustainable, and locally-made products.\n\nOperations Plan: Digital marketplace with integrated payment and shipping solutions.\n\nFinancial Insights: Revenue sharing model with 15% platform fee.`;
      
      setBusinessIdea(refinedIdea);
      setIsRefining(false);
      
      toast({
        title: "Idea Refined!",
        description: "Your business idea has been expanded with AI insights.",
      });
    }, 2000);
  };

  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak your business idea clearly in any language.",
      });
      
      // Simulate recording, transcription, and translation
      setTimeout(() => {
        setIsRecording(false);
        const transcribed = "I want to start an online marketplace for handmade crafts by local artisans in my city. The platform will help artisans reach customers directly and get fair prices for their work.";
        setTranscribedText(transcribed);
        setBusinessIdea(transcribed);
        toast({
          title: "Recording Complete",
          description: "Auto-detected language, transcribed, and translated to English.",
        });
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const handleRefineTranscription = async () => {
    setIsRefining(true);
    
    // Simulate AI refinement of transcription
    setTimeout(() => {
      const refinedTranscription = `${transcribedText}\n\nExecutive Summary: A digital platform connecting local artisans with customers seeking authentic handmade products.\n\nBusiness Goals: Empower artisans with fair pricing and direct customer access.\n\nMarket Overview: Rising consumer interest in sustainable and locally-made products.\n\nOperations Plan: Online marketplace with secure payments and logistics support.\n\nFinancial Insights: Commission-based revenue model with value-added services.`;
      
      setBusinessIdea(refinedTranscription);
      setTranscribedText(refinedTranscription);
      setIsRefining(false);
      
      toast({
        title: "Transcription Refined!",
        description: "Your idea has been converted into a structured business plan.",
      });
    }, 2000);
  };

  const handleProductAnalyzed = (data: any) => {
    setProductData(data);
    setBusinessIdea(data.businessIdea);
    setBusinessType(data.analysis.businessContext);
    
    toast({
      title: "Product Analyzed Successfully!",
      description: "Business plan will be generated based on your product.",
    });
  };

  const handleSubmit = async () => {
    const contentToSubmit = productData?.businessIdea || businessIdea;
    
    if (!contentToSubmit.trim() || !businessType) {
      toast({
        title: "Missing Information",
        description: "Please provide your business idea and select a business type.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const ideaData = {
        idea: contentToSubmit,
        type: businessType,
        timestamp: new Date().toISOString(),
        inputMethod,
        productData: productData || null,
      };
      
      onIdeaSubmit(ideaData);
      setIsProcessing(false);
      
      toast({
        title: "Idea Captured Successfully!",
        description: "Your business idea has been analyzed and a comprehensive business plan will be generated.",
      });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Lightbulb className="h-8 w-8 text-accent-orange" />
          <h1 className="text-3xl font-bold text-foreground">Share Your Business Idea</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Tell us about your business concept in your preferred language and format
        </p>
      </div>

      {/* Input Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card 
          className={`cursor-pointer transition-smooth ${
            inputMethod === 'text' ? 'ring-2 ring-accent-orange bg-accent/20' : 'hover:shadow-medium'
          }`}
          onClick={() => setInputMethod('text')}
        >
          <CardContent className="pt-6 text-center">
            <Type className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">Type Your Idea</h3>
            <p className="text-sm text-muted-foreground">Write your business idea in detail</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-smooth ${
            inputMethod === 'voice' ? 'ring-2 ring-accent-orange bg-accent/20' : 'hover:shadow-medium'
          }`}
          onClick={() => setInputMethod('voice')}
        >
          <CardContent className="pt-6 text-center">
            <Mic className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Voice Recording</h3>
            <p className="text-sm text-muted-foreground">Speak your idea in any language</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-smooth ${
            inputMethod === 'image' ? 'ring-2 ring-accent-orange bg-accent/20' : 'hover:shadow-medium'
          }`}
          onClick={() => setInputMethod('image')}
        >
          <CardContent className="pt-6 text-center">
            <Image className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">Image Upload</h3>
            <p className="text-sm text-muted-foreground">Upload product photo for AI analysis</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Input Area */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Business Idea Input
          </CardTitle>
          <CardDescription>
            Share your business concept and we'll help you build it into a complete business plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Input */}
          {inputMethod === 'text' && (
            <div className="space-y-2 relative">
              <label className="text-sm font-medium">Your Business Idea</label>
              <Textarea
                placeholder="Describe your business idea in detail. What problem does it solve? Who are your target customers? What makes it unique?"
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                className="min-h-[150px] resize-none pr-12"
              />
              {businessIdea.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 h-8 w-8 p-0"
                  onClick={handleRefineIdea}
                  disabled={isRefining}
                  title="Refine with AI"
                >
                  {isRefining ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <Sparkles className="h-4 w-4 text-accent-orange" />
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Voice Input */}
          {inputMethod === 'voice' && (
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  variant={isRecording ? "destructive" : "accent"}
                  size="xl"
                  onClick={handleVoiceRecording}
                  className="group"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-2 h-6 w-6" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-6 w-6" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
              
              {isRecording && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-full">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    Recording in progress...
                  </div>
                </div>
              )}

              {transcribedText && (
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium">Transcribed Text (Auto-translated to English)</label>
                  <Textarea
                    value={transcribedText}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    className="min-h-[100px] pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 h-8 w-8 p-0"
                    onClick={handleRefineTranscription}
                    disabled={isRefining}
                    title="Refine with AI"
                  >
                    {isRefining ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <Sparkles className="h-4 w-4 text-accent-orange" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Image Upload */}
          {inputMethod === 'image' && (
            <ImageUpload onProductAnalyzed={handleProductAnalyzed} />
          )}

          {/* Business Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Type</label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="text-center">
          <Button 
            variant="craft" 
            size="xl" 
            onClick={handleSubmit}
            disabled={isProcessing || !(productData?.businessIdea || businessIdea.trim()) || !businessType}
            className="group min-w-[200px]"
          >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Submit Idea
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default IdeaCapture;