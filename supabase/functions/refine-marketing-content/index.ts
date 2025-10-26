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
    const { content, contentType, audienceType } = await req.json();

    if (!content) {
      throw new Error('Content is required for refinement');
    }

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemPrompt = `You are an expert marketing copywriter specializing in Indian market campaigns. Your task is to refine and polish marketing content to make it more engaging, persuasive, and culturally relevant. Maintain the core message while enhancing clarity, impact, and emotional appeal.`;

    const userPrompt = `Refine and improve this ${contentType} marketing content for ${audienceType} audience:

"${content}"

Make it:
1. More engaging and compelling
2. Culturally appropriate for Indian market
3. Clear and concise
4. Action-oriented with strong emotional appeal
5. Professional yet relatable

Return ONLY the refined content text, no explanations.`;

    console.log('Refining marketing content with OpenAI GPT-5');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const refinedContent = data.choices[0].message.content.trim();

    console.log('Content refined successfully');

    return new Response(
      JSON.stringify({ refinedContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in refine-marketing-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
