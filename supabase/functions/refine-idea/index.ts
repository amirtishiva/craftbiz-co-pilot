import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ideaText } = await req.json();

    if (!ideaText || ideaText.trim().length === 0) {
      throw new Error('Idea text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key is not configured');
    }

    const systemPrompt = `You are an expert AI business content writer.

Your task is to refine the following translated English text into a clear, fluent, and professional business idea summary. 
Ensure it sounds polished and investor-ready while keeping the original meaning intact.

Guidelines:
- Keep it concise (2–4 sentences)
- Correct grammar, tone, and flow
- Highlight the business goal or uniqueness
- Use simple, professional language

Example Input:
"I want to start a shop that sells handmade pots and cups made by village artisans."

Example Output:
"A local business promoting handcrafted pottery made by skilled village artisans, offering sustainable and authentic homeware products to modern customers."`;

    const userPrompt = `Now refine this business idea:\n\n"${ideaText}"`;

    console.log('Refining idea with Lovable AI:', ideaText);

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const refinedIdea = data.choices[0]?.message?.content?.trim() || '';

    console.log('Refined idea:', refinedIdea);

    if (!refinedIdea) {
      console.error('Empty refined idea returned from OpenAI');
      throw new Error('Failed to generate refined idea');
    }

    return new Response(
      JSON.stringify({ refinedIdea }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in refine-idea function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
