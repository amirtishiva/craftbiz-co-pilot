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

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const productDescriptions: Record<string, string> = {
      'tshirt': 'high-quality t-shirt mockup with the logo on the chest',
      'mug': 'ceramic coffee mug with the logo prominently displayed',
      'phone': 'phone case with the logo design elegantly placed',
      'bag': 'tote bag featuring the logo design'
    };

    const prompt = `Create a professional product mockup: ${productDescriptions[productType] || productType}. ${style || 'Clean, modern photography with neutral background'}. Professional lighting and composition.`;

    console.log('Generating mockup with DALL-E:', prompt);

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
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('DALL-E API error:', imageResponse.status, errorText);
      throw new Error(`DALL-E API error: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const mockupUrl = imageData.data[0].url;

    console.log('Mockup generated successfully:', mockupUrl);

    return new Response(
      JSON.stringify({ mockupUrl, productType, prompt }),
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
