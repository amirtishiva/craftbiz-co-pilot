import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z, ZodError } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ImageSchema = z.object({
  imageUrl: z.string()
    .max(10485760, { message: "Image size exceeds 10MB limit" })
    .refine((val) => val.startsWith('data:image/'), { message: 'Must be a valid image data URL' })
});

// Helper function to extract base64 data from data URL
function extractBase64(dataUrl: string): { data: string; mimeType: string } {
  if (dataUrl.startsWith('data:')) {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      return { data: matches[2], mimeType: matches[1] };
    }
  }
  return { data: dataUrl, mimeType: 'image/png' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageUrl } = ImageSchema.parse(body);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('Missing Gemini API key configuration');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageInfo = extractBase64(imageUrl);

    const systemPrompt = `You are an expert product analyst. Analyze the uploaded image and identify the EXACT product shown.

CRITICAL INSTRUCTIONS:
1. Look at the image carefully - what SPECIFIC product do you see?
2. If it's tea → say "Tea Beverage" NOT "Handcrafted Product"
3. If it's pottery → say "Ceramic Pottery" NOT "General Handicraft"
4. If it's textiles → say "Textile/Fabric Product" NOT "Traditional Craft"
5. Be SPECIFIC about materials you can SEE in the image
6. Base colors on what's VISIBLE in the image
7. Create a business idea that matches the ACTUAL product

You MUST respond with a valid JSON object containing exactly these fields:
- productName: string (specific product you see in image)
- category: string (specific category matching the product)
- targetCustomers: array of 3 strings (specific customer types)
- features: array of 4 strings (visible features from the image)
- suggestedIdea: string (150-200 word business idea for THIS EXACT product)
- marketInsights: string (market analysis for this specific product category)

Return ONLY the JSON object, no additional text or markdown formatting.`;

    console.log('Analyzing product image with Gemini Vision API...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
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
          temperature: 0.7,
          maxOutputTokens: 1500,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini Vision API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received successfully');
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!content) {
      console.error('Empty response from Gemini API');
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw AI response (first 300 chars):', content.substring(0, 300));
    
    // Parse JSON from the response
    let analysis;
    try {
      // Remove markdown code blocks if present
      let jsonContent = content;
      
      if (content.includes('```json')) {
        console.log('Removing ```json markdown wrapper');
        jsonContent = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        console.log('Removing ``` markdown wrapper');
        jsonContent = content.split('```')[1].split('```')[0].trim();
      }
      
      // Try to extract JSON object
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(jsonContent);
      }
      
      console.log('✅ Successfully parsed product analysis:', JSON.stringify(analysis, null, 2));
      
      // Validate required fields
      if (!analysis.productName || !analysis.category || !analysis.suggestedIdea) {
        console.error('Missing required fields in analysis');
        return new Response(
          JSON.stringify({ error: 'Failed to extract product details. Please try a clearer image.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.error('JSON parsing failed:', errorMessage, 'Content:', content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to process image analysis. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error in analyze-product-image function:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to analyze product image. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
