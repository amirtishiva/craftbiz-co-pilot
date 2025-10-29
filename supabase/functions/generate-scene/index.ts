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

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const sizeMap: Record<string, string> = {
      '16:9 (Landscape)': '1792x1024',
      '1:1 (Square)': '1024x1024',
      '9:16 (Portrait)': '1024x1792',
      '4:3 (Classic)': '1024x1024'
    };

    const size = sizeMap[aspectRatio || '16:9 (Landscape)'] || '1792x1024';
    const styleGuide = style || 'Photographic';
    
    const prompt = `${description}. ${styleGuide} style. Professional marketing photography with excellent composition and lighting. High quality, detailed, realistic.`;

    console.log('Generating scene with DALL-E:', prompt);

    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'hd',
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('DALL-E API error:', imageResponse.status, errorText);
      throw new Error(`DALL-E API error: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const sceneUrl = imageData.data[0].url;

    console.log('Scene generated successfully:', sceneUrl);

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
