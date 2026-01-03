import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z, ZodError } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_PRODUCT_TYPES = ['tshirt', 'mug', 'phone', 'bag', 'poster', 'hoodie', 'cap'] as const;

const MockupRequestSchema = z.object({
  logoUrl: z.string().min(1, { message: "Logo URL is required" }).max(10485760, { message: "Logo data exceeds 10MB limit" }),
  productType: z.string().min(1, { message: "Product type is required" }),
  style: z.string().max(200).optional()
});

// Helper function to fetch image and convert to base64
async function imageUrlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  if (url.startsWith('data:')) {
    const matches = url.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      return { data: matches[2], mimeType: matches[1] };
    }
  }
  
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  const contentType = response.headers.get('content-type') || 'image/png';
  return { data: base64, mimeType: contentType };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { logoUrl, productType, style } = MockupRequestSchema.parse(body);

    // Validate product type with helpful error message
    const normalizedProductType = productType.toLowerCase().trim();
    const validTypes = [...VALID_PRODUCT_TYPES];
    
    if (!validTypes.includes(normalizedProductType as typeof VALID_PRODUCT_TYPES[number])) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid product type "${productType}". Must be one of: ${validTypes.join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY configuration');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const productDescriptions: Record<string, string> = {
      'tshirt': 'Place this logo on a white t-shirt chest area. Professional product photography with clean background, realistic fabric texture, centered composition',
      'mug': 'Place this logo on a white ceramic coffee mug. Professional product photography with clean background, realistic ceramic texture, front-facing view',
      'phone': 'Place this logo on a phone case. Professional product photography with clean background, realistic case texture, clear logo visibility',
      'bag': 'Place this logo on a tote bag. Professional product photography with clean background, realistic fabric texture, logo prominently displayed',
      'poster': 'Place this logo on a poster in a frame. Professional photography with clean background, high-quality print appearance',
      'hoodie': 'Place this logo on a hoodie chest area. Professional product photography with clean background, realistic fabric texture',
      'cap': 'Place this logo on a baseball cap front. Professional product photography with clean background, realistic cap texture'
    };

    const editPrompt = `${productDescriptions[normalizedProductType] || productDescriptions['tshirt']}. ${style || 'Clean, modern photography with neutral background'}. Maintain logo colors and quality. Professional lighting and realistic mockup.`;

    console.log('Generating mockup with Gemini (image editing):', editPrompt);

    // Convert logo URL to base64
    const logoImage = await imageUrlToBase64(logoUrl);

    const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: editPrompt },
              {
                inlineData: {
                  mimeType: logoImage.mimeType,
                  data: logoImage.data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Gemini API error:', imageResponse.status, errorText);
      
      if (imageResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate mockup. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageData = await imageResponse.json();
    
    // Extract base64 image from Gemini response
    const parts = imageData.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part: { inlineData?: { mimeType?: string; data?: string } }) => 
      part.inlineData?.mimeType?.startsWith('image/')
    );

    if (!imagePart?.inlineData?.data) {
      console.error('No mockup image in response:', JSON.stringify(imageData));
      return new Response(
        JSON.stringify({ error: 'No mockup image generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mockupUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    console.log('Mockup generated successfully');

    return new Response(
      JSON.stringify({ mockupUrl, productType: normalizedProductType, prompt: editPrompt }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error in generate-mockup function:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate mockup';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
