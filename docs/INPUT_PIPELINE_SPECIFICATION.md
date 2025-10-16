# Input Pipeline Specification - "Your Idea" Section

**Version**: 2.0  
**Last Updated**: January 2025

---

## Overview

The "Your Idea" section provides three robust input methods for capturing business ideas:
1. **Text Input** - Natural language with AI refinement
2. **Voice Recording** - Speech-to-text with auto-translation
3. **Image Upload/Capture** - Product analysis via AI Vision

All three pipelines lead to structured business plan generation.

---

## 1. Text Input Pipeline

### User Flow
1. User types business idea in textarea
2. Optional: Click "Refine" icon (✨ bottom-right corner)
3. AI expands idea into structured sections
4. User selects business type
5. Submit to generate full business plan

### API Endpoint
**Endpoint**: `POST /functions/v1/refine-idea`  
**Model**: `gpt-5-2025-08-07`

### Request
```json
{
  "rawIdea": "I want to sell handmade crafts online to urban customers"
}
```

### Response
```json
{
  "refinedIdea": {
    "executiveSummary": "A comprehensive online marketplace...",
    "businessGoals": "Create sustainable income for artisans...",
    "marketOverview": "Growing demand for sustainable products...",
    "operationsPlan": "Digital marketplace with integrated payments...",
    "financialInsights": "Revenue-sharing model with 15% platform fee..."
  }
}
```

### Frontend Implementation
```typescript
const handleRefineIdea = async () => {
  setIsRefining(true);
  
  const { data, error } = await supabase.functions.invoke('refine-idea', {
    body: { rawIdea: businessIdea }
  });
  
  if (data) {
    setBusinessIdea(data.refinedIdea);
    toast({
      title: "Idea Refined!",
      description: "Your business idea has been expanded with AI insights.",
    });
  }
  
  setIsRefining(false);
};
```

---

## 2. Voice Recording Pipeline

### User Flow
1. User clicks "Start Recording" button
2. Browser requests microphone permission
3. User speaks in any language
4. User clicks "Stop Recording"
5. System auto-detects language
6. Transcribes speech using Whisper API
7. Translates to English if needed
8. Displays transcription with "Refine" icon
9. Optional: Click "Refine" to expand into structured plan
10. Submit to generate full business plan

### API Endpoints

#### Transcription & Translation
**Endpoint**: `POST /functions/v1/transcribe-voice`  
**Models**: 
- Whisper (transcription)
- `gpt-5-nano-2025-08-07` (language detection)
- `gpt-5-mini-2025-08-07` (translation)

### Request
```json
{
  "audioBase64": "data:audio/webm;base64,GkXfo59ChoE..."
}
```

### Response
```json
{
  "transcribedText": "मैं हस्तनिर्मित शिल्प बेचना चाहता हूँ",
  "detectedLanguage": "hi",
  "englishTranslation": "I want to sell handmade crafts"
}
```

### Frontend Implementation
```typescript
const handleVoiceRecording = async () => {
  if (!isRecording) {
    // Start recording
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const audioBase64 = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('transcribe-voice', {
          body: { audioBase64 }
        });
        
        if (data) {
          setTranscribedText(data.englishTranslation);
          toast({
            title: "Recording Complete",
            description: `Detected ${data.detectedLanguage}, transcribed and translated.`,
          });
        }
      };
      
      reader.readAsDataURL(blob);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
  } else {
    // Stop recording
    mediaRecorder.stop();
    setIsRecording(false);
  }
};
```

---

## 3. Image Upload/Capture Pipeline

### User Flow

#### Option A: Upload Existing Image
1. User clicks "Upload Image" button
2. File picker opens
3. User selects product image (JPG, PNG, WEBP)
4. Image validated (type, size <10MB)
5. AI Vision analyzes product
6. Results displayed with suggested business idea
7. Submit to generate full business plan

#### Option B: Camera Capture
1. User clicks "Take Photo" button
2. **Browser requests camera permission**
3. **Live camera preview displayed**
4. User positions product in frame
5. User clicks "Capture Photo" button
6. **Frame captured to canvas → JPEG blob**
7. **Camera stream stopped**
8. AI Vision analyzes captured image
9. Results displayed with suggested business idea
10. Submit to generate full business plan

### Camera Implementation Details

#### Browser API
```typescript
// Request camera access
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'environment' }, // Use back camera on mobile
  audio: false 
});

// Attach stream to video element
videoRef.current.srcObject = stream;

// Capture frame
const canvas = document.createElement('canvas');
canvas.width = videoRef.current.videoWidth;
canvas.height = videoRef.current.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(videoRef.current, 0, 0);

// Convert to blob
canvas.toBlob((blob) => {
  const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
  // Process file...
}, 'image/jpeg', 0.95);

// Stop camera
stream.getTracks().forEach(track => track.stop());
```

#### Component State
```typescript
const [isCameraActive, setIsCameraActive] = useState(false);
const videoRef = useRef<HTMLVideoElement>(null);
const streamRef = useRef<MediaStream | null>(null);
```

### API Endpoint
**Endpoint**: `POST /functions/v1/analyze-product-image`  
**Model**: `gpt-4o` (Vision)

### Request
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "source": "camera" // or "upload"
}
```

### Response
```json
{
  "analysis": {
    "productType": "Handwoven Textile / Fabric",
    "materials": ["Natural Cotton", "Traditional Dyes", "Hand-spun Thread"],
    "style": "Traditional Indian Handloom",
    "colors": ["Natural Beige", "Indigo Blue", "Earth Tones"],
    "targetAudience": "Urban customers who prefer sustainable and eco-friendly products",
    "businessContext": "Sustainable Fashion / Ethnic Wear",
    "suggestedBusinessIdea": "A business selling eco-friendly handcrafted traditional textiles, targeting urban customers who value sustainable living and authentic craftsmanship..."
  }
}
```

### Frontend Implementation
```typescript
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
    }
    
    toast({
      title: "Camera Ready",
      description: "Position your product and click Capture.",
    });
  } catch (error) {
    toast({
      title: "Camera Access Denied",
      description: "Please allow camera access to capture photos.",
      variant: "destructive",
    });
  }
};

const capturePhoto = () => {
  const canvas = document.createElement('canvas');
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const imageBase64 = reader.result as string;
          
          const { data, error } = await supabase.functions.invoke('analyze-product-image', {
            body: { imageBase64, source: 'camera' }
          });
          
          if (data) {
            setProductAnalysis(data.analysis);
          }
        };
        
        reader.readAsDataURL(file);
        stopCamera();
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
```

---

## 4. Unified Business Plan Generation

All three input methods converge into a single business plan generation pipeline:

### Final Submit Handler
```typescript
const handleSubmit = async () => {
  const ideaContent = productData?.businessIdea || transcribedText || businessIdea;
  
  if (!ideaContent.trim() || !businessType) {
    toast({
      title: "Missing Information",
      description: "Please provide your business idea and select a business type.",
      variant: "destructive",
    });
    return;
  }

  setIsProcessing(true);
  
  const { data, error } = await supabase.functions.invoke('generate-business-plan', {
    body: {
      businessIdea: ideaContent,
      businessType,
      inputMethod,
      productAnalysis: productData?.analysis || null
    }
  });
  
  if (data) {
    onIdeaSubmit(data);
    toast({
      title: "Business Plan Generated!",
      description: "Your comprehensive business plan is ready.",
    });
  }
  
  setIsProcessing(false);
};
```

---

## 5. Input Validation

### Text Input
- Minimum length: 10 characters
- Maximum length: 5000 characters
- Zod schema validation

### Voice Input
- Audio format: WebM, MP3, M4A
- Maximum duration: 5 minutes
- Maximum file size: 25MB

### Image Input
- Formats: JPG, PNG, JPEG, WEBP
- Maximum file size: 10MB
- Minimum dimensions: 512x512px
- Maximum dimensions: 4096x4096px

### Camera Capture
- Browser support check for `navigator.mediaDevices.getUserMedia()`
- Permission handling with error messages
- Auto-stop camera on component unmount
- JPEG quality: 0.95 (95%)

---

## 6. Error Handling

### Common Errors

#### Camera Access Denied
```typescript
{
  type: "CAMERA_ACCESS_DENIED",
  message: "Please allow camera access in your browser settings."
}
```

#### Unsupported Browser
```typescript
{
  type: "CAMERA_NOT_SUPPORTED",
  message: "Your browser doesn't support camera capture. Please use upload instead."
}
```

#### File Too Large
```typescript
{
  type: "FILE_TOO_LARGE",
  message: "Image must be smaller than 10MB."
}
```

#### AI Analysis Failed
```typescript
{
  type: "ANALYSIS_FAILED",
  message: "Failed to analyze the product. Please try again with a clearer image."
}
```

---

## 7. Performance Considerations

### Camera Stream
- Use `facingMode: 'environment'` for back camera on mobile
- Always stop camera stream when done to free resources
- Handle component unmount to prevent memory leaks

### Image Compression
- Capture at 95% JPEG quality for balance
- Consider client-side resize for very large images
- Base64 encoding increases size by ~33%

### API Optimization
- Batch refinement requests with debouncing
- Cache analyzed products by image hash
- Stream long-form responses for better UX

---

## 8. Browser Compatibility

### Camera Capture Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari (iOS/macOS): ✅ Full support
- Opera: ✅ Full support
- IE11: ❌ Not supported (use upload fallback)

### Fallback Strategy
```typescript
const isCameraSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Hide "Take Photo" button if not supported
{isCameraSupported() && (
  <Button onClick={handleCameraCapture}>
    <Camera className="mr-2 h-4 w-4" />
    Take Photo
  </Button>
)}
```

---

**End of Input Pipeline Specification**
