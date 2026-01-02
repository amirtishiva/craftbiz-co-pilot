import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RefineContentSchema = z.object({
  content: z.string().trim().min(1, { message: "Content is required" }).max(5000, { message: "Content exceeds 5000 character limit" }),
  contentType: z.string().max(50).optional(),
  audienceType: z.string().max(50).optional(),
  socialMediaType: z.string().max(50).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { content, contentType, audienceType, socialMediaType } = RefineContentSchema.parse(body);

    console.log('Refine request received:', { 
      contentLength: content.length, 
      contentType, 
      audienceType, 
      socialMediaType 
    });

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found in environment');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

CRITICAL: Return ONLY the refined content text. No explanations, no meta-commentary, no formatting markers, no hashtags.`;

    console.log('Refining marketing content with Gemini AI');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to refine content. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const refinedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!refinedContent) {
      console.error('Empty refined content from Gemini API');
      return new Response(
        JSON.stringify({ error: 'Failed to generate refined content. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Content refined successfully. Length:', refinedContent.length);

    return new Response(
      JSON.stringify({ refinedContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in refine-marketing-content function:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to refine content' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
