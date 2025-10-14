import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mic, 
  MicOff, 
  Type, 
  Upload,
  Lightbulb,
  Globe,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from './DocumentUpload';
import VoiceWaveform from './VoiceWaveform';

interface IdeaCaptureProps {
  onIdeaSubmit: (idea: any) => void;
}

const IdeaCapture: React.FC<IdeaCaptureProps> = ({ onIdeaSubmit }) => {
  const [inputMethod, setInputMethod] = useState<'text' | 'voice' | 'upload'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [businessIdea, setBusinessIdea] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [language, setLanguage] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentData, setDocumentData] = useState<{
    originalContent: string;
    originalLanguage: string;
    englishContent: string;
  } | null>(null);
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

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  ];

  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak your business idea clearly in your preferred language.",
      });
      
      // Simulate recording for demo
      setTimeout(() => {
        setIsRecording(false);
        setBusinessIdea("I want to start an online marketplace for handmade crafts by local artisans in my city. The platform will help artisans reach customers directly and get fair prices for their work.");
        toast({
          title: "Recording Complete",
          description: "Your idea has been captured and transcribed.",
        });
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const handleDocumentContent = (originalContent: string, originalLanguage: string, englishContent: string) => {
    setDocumentData({ originalContent, originalLanguage, englishContent });
    setBusinessIdea(englishContent);
    setLanguage(originalLanguage);
    
    toast({
      title: "Document Processed Successfully!",
      description: "Content has been refined and is ready for business plan generation.",
    });
  };

  const handleSubmit = async () => {
    const contentToSubmit = documentData?.englishContent || businessIdea;
    
    if (!contentToSubmit.trim() || !businessType) {
      toast({
        title: "Missing Information",
        description: "Please provide your business idea and select a business type.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing with enhanced data
    setTimeout(() => {
      const ideaData = {
        idea: contentToSubmit,
        originalContent: documentData?.originalContent || businessIdea,
        originalLanguage: documentData?.originalLanguage || language,
        englishContent: documentData?.englishContent || businessIdea,
        type: businessType,
        language: documentData?.originalLanguage || language,
        timestamp: new Date().toISOString(),
        isFromDocument: !!documentData,
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
            inputMethod === 'upload' ? 'ring-2 ring-accent-orange bg-accent/20' : 'hover:shadow-medium'
          }`}
          onClick={() => setInputMethod('upload')}
        >
          <CardContent className="pt-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">Upload Document</h3>
            <p className="text-sm text-muted-foreground">Upload an existing business plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Input Area */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Business Idea Input
          </CardTitle>
          <CardDescription>
            Share your business concept and we'll help you build it into a complete business plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select your language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Input */}
          {inputMethod === 'text' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Business Idea</label>
              <Textarea
                placeholder="Describe your business idea in detail. What problem does it solve? Who are your target customers? What makes it unique?"
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>
          )}

          {/* Voice Input */}
          {inputMethod === 'voice' && (
            <div className="space-y-6">
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
              
              {/* Animated Waveform */}
              <div className="relative">
                <VoiceWaveform isRecording={isRecording} />
                {isRecording && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm text-red-100 rounded-full border border-red-500/30">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      Listening...
                    </div>
                  </div>
                )}
              </div>

              {businessIdea && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transcribed Text</label>
                  <Textarea
                    value={businessIdea}
                    onChange={(e) => setBusinessIdea(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Upload Option */}
          {inputMethod === 'upload' && (
            <DocumentUpload onContentExtracted={handleDocumentContent} />
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
            disabled={isProcessing || !(documentData?.englishContent || businessIdea.trim()) || !businessType}
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