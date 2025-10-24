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

    const systemPrompt = `You are an expert business consultant and copywriter specializing in transforming raw business ideas into professional, compelling business descriptions. Your goal is to elevate informal or basic business concepts into polished, clear, and actionable business summaries that are suitable for business plans and investor presentations.

Your expertise includes:
- Refining grammar, tone, and clarity
- Structuring business ideas professionally
- Highlighting unique value propositions
- Maintaining conciseness while being comprehensive
- Using business-appropriate language and terminology

Transform the user's input into a refined, professional business description.`;

    const userPrompt = `Refine and elevate the following business idea into a clear, professional, and well-structured business description:

"${ideaText}"

Requirements:
1. Improve grammar, tone, and clarity
2. Make it professional and business-appropriate
3. Highlight what makes this business unique or valuable
4. Clearly state the product/service and target market
5. Keep it concise (2-4 sentences)
6. Use confident, action-oriented language

Provide ONLY the refined business description without any labels, introductions, or additional commentary.`;

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
