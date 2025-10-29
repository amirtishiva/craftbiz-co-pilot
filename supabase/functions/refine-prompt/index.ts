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
    const { prompt, type } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
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

    let systemPrompt = '';
    if (type === 'logo') {
      systemPrompt = `You are an expert prompt engineer for logo design. Enhance the user's input to create a detailed, effective logo generation prompt. Include:
- Clear visual style and aesthetic direction
- Specific color preferences and symbolism
- Brand personality and values
- Design elements and composition
- Professional quality requirements

Keep it concise but comprehensive, under 150 words. Return ONLY the refined prompt, no explanations.`;
    } else if (type === 'mockup') {
      systemPrompt = `You are an expert prompt engineer for product mockup generation. Enhance the user's input to create a detailed mockup description. Include:
- Professional photography style
- Lighting and composition details
- Context and setting
- Product presentation angle
- Mood and atmosphere

Keep it concise but vivid, under 100 words. Return ONLY the refined prompt, no explanations.`;
    }

    console.log('Refining prompt with AI:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI refinement error: ${response.status}`);
    }

    const data = await response.json();
    const refinedPrompt = data.choices[0].message.content.trim();

    console.log('Prompt refined successfully');

    return new Response(
      JSON.stringify({ refinedPrompt }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in refine-prompt function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
