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

    const systemPrompt = `You are an expert AI business content writer specializing in refining business ideas into polished, professional summaries.

Your task is to transform raw or translated business ideas into clear, fluent, and professional business descriptions that sound investor-ready while maintaining the original meaning.

Guidelines:
- Keep the output concise (2-4 sentences maximum)
- Correct grammar, tone, and flow
- Highlight the business goal or unique value proposition
- Use simple, professional, and confident language
- Focus on what product/service is offered and who the target customers are
- Make it action-oriented and business-appropriate`;

    const userPrompt = `Refine the following business idea into a clear, professional, and well-structured business description:

"${ideaText}"

Provide ONLY the refined business description. Do not include any labels, introductions, explanations, or additional commentary. Just the polished business idea.`;

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
        max_completion_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
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
