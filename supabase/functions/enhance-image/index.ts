import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z, ZodError } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EnhanceImageSchema = z.object({
  imageData: z.string()
    .min(1, { message: "Image data is required" })
    .max(10485760, { message: "Image size exceeds 10MB limit" }),
  enhancementType: z.string().max(100).optional()
});

// Helper function to extract base64 data from data URL
function extractBase64(dataUrl: string): { data: string; mimeType: string } {
  if (dataUrl.startsWith('data:')) {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      return { data: matches[2], mimeType: matches[1] };
    }
  }
  // Assume it's already base64
  return { data: dataUrl, mimeType: 'image/png' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageData, enhancementType } = EnhanceImageSchema.parse(body);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY configuration');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Step 1: Analyzing product image...');

    const imageInfo = extractBase64(imageData);

    // First, analyze the image to understand product characteristics
    const analysisResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Analyze this product image and describe: 1) Product type/category, 2) Dominant colors and materials, 3) Current lighting quality, 4) Texture and finish, 5) Brand tone (luxury/casual/artisan/modern). Be concise but detailed.'
              },
              {
                inlineData: {
                  mimeType: imageInfo.mimeType,
                  data: imageInfo.data
                }
              }
            ]
          }
        ]
      })
    });

    if (!analysisResponse.ok) {
      console.error('Image analysis failed:', analysisResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysisData = await analysisResponse.json();
    const productAnalysis = analysisData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Product analysis:', productAnalysis);

    console.log('Step 2: Enhancing image based on analysis...');

    // Create adaptive enhancement prompt based on analysis
    const enhancementPrompt = `Based on this product analysis: ${productAnalysis}

Enhance this product image with the following improvements:
- Optimize lighting to highlight the product's unique textures and materials
- Correct color balance to match the product's natural tones and enhance vibrancy
- Sharpen details while maintaining natural appearance
- Improve contrast and shadows for professional depth
- Enhance visual appeal while keeping the product authentic and recognizable
- Make it look like a high-end product photography shot

CRITICAL: Keep the exact product unchanged - only improve visual quality, lighting, and presentation. Do not alter the product itself, its shape, or core features.`;

    // Call Gemini API for image enhancement
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: enhancementPrompt },
              {
                inlineData: {
                  mimeType: imageInfo.mimeType,
                  data: imageInfo.data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image enhancement failed:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to enhance image. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract base64 image from Gemini response
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part: { inlineData?: { mimeType?: string; data?: string } }) => 
      part.inlineData?.mimeType?.startsWith('image/')
    );

    if (!imagePart?.inlineData?.data) {
      console.error('No enhanced image in response');
      return new Response(
        JSON.stringify({ error: 'Failed to generate enhanced image. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const enhancedImageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    return new Response(
      JSON.stringify({ enhancedImage: enhancedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in enhance-image function:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to enhance image. Please try again.' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
