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
    const { userPrompt, promptType } = await req.json();

    if (!userPrompt) {
      throw new Error('User prompt is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Refining user prompt:', userPrompt);

    // Create system prompt based on prompt type
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
- Output only the refined prompt, no explanations

Example:
User: "Place the product on a wooden café table with natural morning light"
Refined: "Professional product photography showing the item placed on a weathered oak café table. Soft golden morning sunlight streams from a nearby window, creating warm highlights and gentle shadows. Background shows a subtly blurred café interior with warm earth tones. Shallow depth of field keeps the product sharp and prominent. Photorealistic, marketing-ready composition."`;
    } else {
      systemPrompt = `You are an expert AI prompt engineer. Refine the user's prompt to be more detailed, specific, and effective for AI generation while maintaining their original intent. Output only the refined prompt.`;
    }

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
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const refinedPrompt = data.choices?.[0]?.message?.content;

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
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to refine prompt' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
