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

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemPrompt = `You are a business idea refinement specialist with expertise in helping Indian entrepreneurs develop their business concepts. Your goal is to transform raw, informal business ideas into clear, actionable business concepts.

Your task is to:
1. Understand the core business idea from the user's input
2. Identify the key product or service being offered
3. Extract potential target customers
4. Refine and enhance the idea with clarity and structure
5. Keep the refined idea concise (2-3 sentences max)
6. Focus on what makes the business unique or valuable`;

    const userPrompt = `Original business idea: "${ideaText}"

Please refine this business idea into a clear, concise business concept. Focus on:
- What product/service is being offered
- Who are the target customers
- What value does it provide

Provide only the refined business idea, without any labels or additional commentary.`;

    console.log('Refining idea with OpenAI GPT-5:', ideaText);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const refinedIdea = data.choices[0].message.content.trim();

    console.log('Refined idea:', refinedIdea);

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
