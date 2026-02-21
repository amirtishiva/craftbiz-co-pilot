import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z, ZodError } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const IdeaSchema = z.object({
  ideaText: z.string().trim().min(10, { message: "Idea text must be at least 10 characters" }).max(5000, { message: "Idea text must be less than 5000 characters" })
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { ideaText } = IdeaSchema.parse(body);

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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const refinedIdea = data.choices?.[0]?.message?.content?.trim() || '';

    console.log('Refined idea:', refinedIdea);

    if (!refinedIdea) {
      console.error('Empty refined idea returned');
      throw new Error('Failed to generate refined idea');
    }

    return new Response(
      JSON.stringify({ refinedIdea }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error in refine-idea function:', error);
    
    if (error instanceof ZodError) {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
