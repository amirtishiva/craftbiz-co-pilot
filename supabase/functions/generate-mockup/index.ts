import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { logoUrl, productType, style } = await req.json();

    if (!logoUrl || !productType) {
      throw new Error('Logo URL and product type are required');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const productDescriptions: Record<string, string> = {
      'tshirt': 'Place this logo on a white t-shirt chest area. Professional product photography with clean background, realistic fabric texture, centered composition',
      'mug': 'Place this logo on a white ceramic coffee mug. Professional product photography with clean background, realistic ceramic texture, front-facing view',
      'phone': 'Place this logo on a phone case. Professional product photography with clean background, realistic case texture, clear logo visibility',
      'bag': 'Place this logo on a tote bag. Professional product photography with clean background, realistic fabric texture, logo prominently displayed'
    };

    const editPrompt = `${productDescriptions[productType] || `Place this logo on a ${productType}`}. ${style || 'Clean, modern photography with neutral background'}. Maintain logo colors and quality. Professional lighting and realistic mockup.`;

    console.log('Generating mockup with Gemini (image editing):', editPrompt);
    console.log('Using logo URL:', logoUrl);

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
      throw new Error(`Image generation error: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    
    // Extract base64 image from Gemini response
    const parts = imageData.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part: any) => part.inlineData?.mimeType?.startsWith('image/'));

    if (!imagePart?.inlineData?.data) {
      throw new Error('No mockup image generated in response');
    }

    const mockupUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    console.log('Mockup generated successfully with selected logo');

    return new Response(
      JSON.stringify({ mockupUrl, productType, prompt: editPrompt }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-mockup function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
