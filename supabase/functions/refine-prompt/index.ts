import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PromptSchema = z.object({
  userPrompt: z.string().trim().min(3, { message: "Prompt must be at least 3 characters" }).max(2000, { message: "Prompt must be less than 2000 characters" }),
  promptType: z.string().optional(),
  businessName: z.string().optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userPrompt, promptType, businessName } = PromptSchema.parse(body);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Refining user prompt:', userPrompt);

    let systemPrompt = '';
    
    if (promptType === 'scene') {
      systemPrompt = `You are an expert AI prompt engineer specializing in product photography and marketing visuals. Your task is to refine user-provided scene descriptions into detailed, professional prompts for AI image generation.

When refining a scene description:
1. Identify the product category and context from the user's description
2. Expand lighting details (e.g., "natural morning light" → "soft golden morning sunlight streaming from the side, creating gentle shadows")
3. Add camera and composition details (depth of field, angle, perspective)
4. Specify material textures and environmental elements
5. Include atmosphere and mood descriptors
6. Ensure the product remains the central focus
7. Add photorealistic quality markers

Important guidelines:
- Keep descriptions concise but specific (2-4 sentences)
- Focus on visual elements that make the scene unique
- Ensure lighting direction and shadows are consistent
- Maintain professional marketing photography standards
- Do not change the core intent of the user's description
- Output only the refined prompt, no explanations`;
    } else if (promptType === 'logo') {
      const businessNameContext = businessName ? ` for "${businessName}"` : '';
      systemPrompt = `You are an expert AI prompt engineer specializing in logo design. Refine the user's prompt to be more detailed and effective for AI logo generation${businessNameContext}. Maintain the business name exactly as provided${businessNameContext ? `: "${businessName}"` : ''}. Output only the refined prompt with specific design elements, colors, style preferences, and visual characteristics while keeping the original intent.`;
    } else {
      systemPrompt = `You are an expert AI prompt engineer. Refine the user's prompt to be more detailed, specific, and effective for AI generation while maintaining their original intent. Output only the refined prompt.`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser prompt: ${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const refinedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!refinedPrompt) {
      console.error('No refined prompt in response:', JSON.stringify(data));
      throw new Error('No refined prompt generated');
    }

    console.log('Refined prompt:', refinedPrompt);

    return new Response(
      JSON.stringify({ refinedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in refine-prompt function:', error);
    
    if (error.name === 'ZodError') {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to refine prompt' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
