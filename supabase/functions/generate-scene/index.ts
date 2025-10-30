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
    const { description, style, aspectRatio } = await req.json();

    if (!description) {
      throw new Error('Scene description is required');
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

    const styleGuide = style || 'Photographic';
    
    const prompt = `${description}. ${styleGuide} style. Professional marketing photography with excellent composition and lighting. High quality, detailed, realistic. ${aspectRatio ? `Aspect ratio: ${aspectRatio}` : ''}`;

    console.log('Generating scene with nano-banana:', prompt);

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
            content: prompt
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
    console.log('Nano-banana response structure:', JSON.stringify(imageData, null, 2));
    
    const sceneUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!sceneUrl) {
      console.error('Failed to extract scene URL. Full response:', JSON.stringify(imageData));
      console.error('Message object:', JSON.stringify(imageData.choices?.[0]?.message));
      throw new Error(`No scene image generated in response. Check logs for details.`);
    }

    console.log('Scene generated successfully');

    return new Response(
      JSON.stringify({ sceneUrl, prompt }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-scene function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
