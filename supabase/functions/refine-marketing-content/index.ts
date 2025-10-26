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
    const { content, contentType, audienceType, socialMediaType } = await req.json();

    console.log('Refine request received:', { 
      contentLength: content?.length, 
      contentType, 
      audienceType, 
      socialMediaType 
    });

    if (!content || content.trim() === '') {
      throw new Error('Content is required for refinement');
    }

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key is not configured');
    }

    // Platform-specific refinement guidelines
    const platformGuidelines: Record<string, string> = {
      facebook: 'Make it conversational, warm, and community-focused. Use emojis sparingly and create a welcoming tone.',
      instagram: 'Make it visually descriptive, emotional, and story-driven. Use emojis and create aspirational content.',
      linkedin: 'Make it professional, insightful, and value-driven. Use industry language and maintain formal tone.',
      x: 'Make it punchy, witty, and ultra-concise. Use impactful words and create maximum engagement in minimal characters.'
    };

    const audienceDescriptions: Record<string, string> = {
      general: 'Indian consumers',
      millennials: 'Millennials aged 25-40 in India',
      conscious: 'Conscious consumers who value sustainability',
      local: 'Local community members',
      business: 'Business owners and entrepreneurs'
    };

    const platformGuideline = platformGuidelines[socialMediaType || 'facebook'] || platformGuidelines.facebook;
    const audience = audienceDescriptions[audienceType || 'general'] || audienceDescriptions.general;

    const systemPrompt = `You are an expert marketing copywriter specializing in Indian market campaigns and ${socialMediaType || 'social media'} content. 
Your task is to refine and elevate marketing content while preserving the core message.
You understand Indian cultural nuances, values, communication styles, and emotional triggers.
You create content that is authentic, engaging, and culturally appropriate.`;

    const userPrompt = `Refine and polish this ${contentType || 'marketing'} content for ${audience} on ${socialMediaType || 'social media'}:

"${content}"

REFINEMENT GUIDELINES:
${platformGuideline}

Make it:
✓ More engaging and emotionally compelling
✓ Culturally appropriate for Indian market
✓ Clear, concise, and impactful
✓ Action-oriented with strong call-to-action
✓ Professional yet relatable and authentic
✓ Optimized for ${socialMediaType || 'social media'} platform

CRITICAL: Return ONLY the refined content text. No explanations, no meta-commentary, no formatting markers.`;

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
