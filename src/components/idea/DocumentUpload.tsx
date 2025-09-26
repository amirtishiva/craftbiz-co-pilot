import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  FileCheck, 
  Edit3, 
  Check, 
  X, 
  Languages,
  Sparkles,
  Eye,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface DocumentUploadProps {
  onContentExtracted: (content: string, originalLanguage: string, englishContent: string) => void;
}

interface DocumentStats {
  characters: number;
  words: number;
  paragraphs: number;
  language: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onContentExtracted }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [englishContent, setEnglishContent] = useState('');
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'or', name: 'Odia' }
  ];

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    
    if (fileType === 'text/plain') {
      return await file.text();
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else if (fileType === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        text += pageText + '\n';
      }
      
      return text;
    }
    
    throw new Error('Unsupported file type');
  };

  const detectLanguage = (text: string): string => {
    // Simple language detection based on character patterns
    const devanagariPattern = /[\u0900-\u097F]/;
    const bengaliPattern = /[\u0980-\u09FF]/;
    const teluguPattern = /[\u0C00-\u0C7F]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const gujaratiPattern = /[\u0A80-\u0AFF]/;
    const kannadaPattern = /[\u0C80-\u0CFF]/;
    const malayalamPattern = /[\u0D00-\u0D7F]/;
    const odiaPattern = /[\u0B00-\u0B7F]/;

    if (devanagariPattern.test(text)) return 'hi';
    if (bengaliPattern.test(text)) return 'bn';
    if (teluguPattern.test(text)) return 'te';
    if (tamilPattern.test(text)) return 'ta';
    if (gujaratiPattern.test(text)) return 'gu';
    if (kannadaPattern.test(text)) return 'kn';
    if (malayalamPattern.test(text)) return 'ml';
    if (odiaPattern.test(text)) return 'or';
    
    return 'en';
  };

  const normalizeContent = (text: string): string => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim()
      .split('\n\n')
      .filter(para => para.trim().length > 0)
      .join('\n\n');
  };

  const simulateNLPProcessing = async (text: string): Promise<string> => {
    // Simulate NLP processing steps
    setProcessingStep('Removing redundancy...');
    setProgress(25);
    await new Promise(resolve => setTimeout(resolve, 800));

    setProcessingStep('Correcting grammar & spelling...');
    setProgress(50);
    await new Promise(resolve => setTimeout(resolve, 800));

    setProcessingStep('Simplifying complex sentences...');
    setProgress(75);
    await new Promise(resolve => setTimeout(resolve, 800));

    setProcessingStep('Finalizing business-ready content...');
    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return processed text with improvements
    return text
      .replace(/\b(very|really|quite|pretty)\s+/gi, '')
      .replace(/\b(I think|I believe|maybe|perhaps)\s+/gi, '')
      .replace(/(\w+)\s+\1\b/gi, '$1')
      .trim();
  };

  const simulateTranslation = async (text: string, fromLang: string): Promise<string> => {
    setProcessingStep(`Translating from ${supportedLanguages.find(l => l.code === fromLang)?.name} to English...`);
    setProgress(50);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate translation - in real app, this would call translation API
    return `[Translated from ${fromLang}] ${text}`;
  };

  const calculateStats = (text: string, language: string): DocumentStats => {
    const characters = text.length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const paragraphs = text.split('\n\n').filter(para => para.trim().length > 0).length;
    
    return { characters, words, paragraphs, language };
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported File Type",
        description: "Please upload a .txt, .docx, or .pdf file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setProgress(0);
    setProcessingStep('Extracting text from document...');

    try {
      // Extract text
      const text = await extractTextFromFile(file);
      setProgress(20);
      
      // Normalize content
      setProcessingStep('Normalizing content...');
      const normalizedText = normalizeContent(text);
      setProgress(40);
      
      // Detect language
      setProcessingStep('Detecting language...');
      const detectedLanguage = detectLanguage(normalizedText);
      setProgress(60);
      
      // Calculate stats
      const stats = calculateStats(normalizedText, detectedLanguage);
      setDocumentStats(stats);
      
      setExtractedContent(normalizedText);
      setEditedContent(normalizedText);
      setProgress(100);
      setProcessingStep('Document processed successfully!');
      
      toast({
        title: "Document Uploaded Successfully",
        description: `Extracted ${stats.words} words in ${supportedLanguages.find(l => l.code === detectedLanguage)?.name || 'Unknown'} language.`,
      });
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the document. Please try again.",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProcessingStep('');
    }
  }, [toast]);

  const handleContentEdit = (newContent: string) => {
    setEditedContent(newContent);
    if (documentStats) {
      const updatedStats = calculateStats(newContent, documentStats.language);
      setDocumentStats(updatedStats);
    }
  };

  const processForBusinessPlan = async () => {
    if (!editedContent.trim() || !documentStats) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      let finalEnglishContent = editedContent;

      // If not English, translate first
      if (documentStats.language !== 'en') {
        finalEnglishContent = await simulateTranslation(editedContent, documentStats.language);
        setProgress(50);
      }

      // Apply NLP processing
      const refinedContent = await simulateNLPProcessing(finalEnglishContent);
      setEnglishContent(refinedContent);

      // Call parent callback
      onContentExtracted(editedContent, documentStats.language, refinedContent);

      toast({
        title: "Content Processed Successfully!",
        description: "Your business idea is ready for plan generation.",
      });

    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProcessingStep('');
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setExtractedContent('');
    setEditedContent('');
    setEnglishContent('');
    setDocumentStats(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      {!uploadedFile ? (
        <Card>
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Upload Business Document</h3>
              <p className="text-muted-foreground mb-4">
                Supported formats: .txt, .docx, .pdf (max 10MB)
              </p>
              <input
                type="file"
                accept=".txt,.docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <CardTitle>Document Preview & Edit</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={resetUpload}>
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
            <CardDescription>
              Review and edit your content before processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Info */}
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium">{uploadedFile.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              {documentStats && (
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    <Languages className="h-3 w-3 mr-1" />
                    {supportedLanguages.find(l => l.code === documentStats.language)?.name}
                  </Badge>
                </div>
              )}
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{processingStep}</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Document Stats */}
            {documentStats && !isProcessing && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{documentStats.characters}</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{documentStats.words}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{documentStats.paragraphs}</div>
                  <div className="text-sm text-muted-foreground">Paragraphs</div>
                </div>
              </div>
            )}

            {/* Content Preview/Edit */}
            {extractedContent && !isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Content Preview</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      {isEditMode ? (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isEditMode ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => handleContentEdit(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                    placeholder="Edit your content here..."
                  />
                ) : (
                  <div className="max-h-[300px] overflow-y-auto p-4 bg-secondary/30 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm">{editedContent}</pre>
                  </div>
                )}
              </div>
            )}

            {/* English Translation Preview */}
            {englishContent && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-orange" />
                  Refined English Content
                </h4>
                <div className="max-h-[200px] overflow-y-auto p-4 bg-green-50 rounded-lg border border-green-200">
                  <pre className="whitespace-pre-wrap text-sm">{englishContent}</pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {extractedContent && !isProcessing && (
              <div className="flex gap-3">
                <Button
                  onClick={processForBusinessPlan}
                  disabled={!editedContent.trim()}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Process for Business Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;