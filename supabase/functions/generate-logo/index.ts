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
    const { prompt, businessName, count = 1 } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }
    
    // Parse prompts if multiple variations are provided (separated by |||)
    const prompts = prompt.includes('|||') ? prompt.split('|||').map((p: string) => p.trim()) : [prompt];

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Generating', count, 'logo(s) with DALL-E using', prompts.length, 'prompt variations');

    // Generate logos using available prompts
    const logoUrls = [];
    const numToGenerate = Math.min(count, prompts.length);
    
    for (let i = 0; i < numToGenerate; i++) {
      const currentPrompt = prompts[i] || prompts[0];
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: currentPrompt,
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
      logoUrls.push(imageData.data[0].url);
      console.log(`Logo ${i + 1} generated successfully`);
    }

    return new Response(
      JSON.stringify({ logoUrls }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-logo function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
