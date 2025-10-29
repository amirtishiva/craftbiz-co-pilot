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
    const { prompt, type, businessName } = await req.json();

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
    let userPrompt = prompt;
    
    if (type === 'logo') {
      // For logo generation, preserve business name and generate 2 distinct variations
      systemPrompt = `You are an expert logo design prompt engineer for DALL-E 3.

CRITICAL: Generate clean, natural language prompts. NO special tokens, NO LoRA tags, NO technical syntax.

Task: Create 2 distinct logo variations for the same business.
Each variation must differ in:
- Color palette and mood
- Typography style  
- Icon/symbol concept
- Overall composition

${businessName ? `IMPORTANT: Always use the exact business name "${businessName}" in both prompts.` : ''}

Format: Return exactly 2 prompts separated by "|||" with NO explanations or extra text.

Example output format:
Professional minimalist logo for [BUSINESS NAME] with geometric shapes...|||Creative organic logo for [BUSINESS NAME] with hand-drawn elements...`;

      if (businessName) {
        userPrompt = `Business Name: ${businessName}\nBrand Description: ${prompt}`;
      }
    } else if (type === 'mockup') {
      systemPrompt = `You are an expert product mockup prompt engineer for DALL-E 3.

Create a natural language prompt describing professional product photography. Include:
- Photography style and lighting
- Product presentation details
- Background and setting
- Composition and angle

Keep it under 100 words. Return ONLY the refined prompt, no explanations.`;
    }

    console.log('Refining prompt with AI:', userPrompt);

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
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 400,
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
