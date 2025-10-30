import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key is not configured');
    }

    const productDescriptions: Record<string, string> = {
      'tshirt': 'Place this logo on a white t-shirt chest area. Professional product photography with clean background, realistic fabric texture, centered composition',
      'mug': 'Place this logo on a white ceramic coffee mug. Professional product photography with clean background, realistic ceramic texture, front-facing view',
      'phone': 'Place this logo on a phone case. Professional product photography with clean background, realistic case texture, clear logo visibility',
      'bag': 'Place this logo on a tote bag. Professional product photography with clean background, realistic fabric texture, logo prominently displayed'
    };

    const editPrompt = `${productDescriptions[productType] || `Place this logo on a ${productType}`}. ${style || 'Clean, modern photography with neutral background'}. Maintain logo colors and quality. Professional lighting and realistic mockup.`;

    console.log('Generating mockup with nano-banana (image editing):', editPrompt);
    console.log('Using logo URL:', logoUrl);

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: editPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: logoUrl
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Nano-banana API error:', imageResponse.status, errorText);
      throw new Error(`Image generation error: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const mockupUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!mockupUrl) {
      throw new Error('No mockup image generated in response');
    }

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
