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
    const { imageData, contextType, contextDescription } = await req.json();

    if (!imageData) {
      throw new Error('Image data is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Generating ${contextType} contextual scene...`);

    // Create detailed prompt based on context type
    let scenePrompt = '';
    
    switch (contextType) {
      case 'studio':
        scenePrompt = 'Place this product in a professional studio setup with perfect lighting, clean white or grey background, professional photography setup. Make it look like a high-end product catalog image.';
        break;
      case 'lifestyle':
        scenePrompt = 'Show this product being used in a real-life scenario. Include hands or people using it naturally, in an authentic everyday setting. Make it relatable and aspirational.';
        break;
      case 'outdoor':
        scenePrompt = 'Place this product in a beautiful outdoor natural environment with natural lighting, maybe greenery, sky, or natural elements. Create a fresh, organic feeling.';
        break;
      case 'luxury':
        scenePrompt = 'Present this product in a luxury brand context - premium materials around it like marble, gold accents, velvet, elegant lighting. Make it look exclusive and high-end.';
        break;
      case 'minimalist':
        scenePrompt = 'Show this product in a minimalist, clean, modern setting. Simple geometric shapes, neutral colors, lots of negative space, contemporary aesthetic.';
        break;
      case 'vintage':
        scenePrompt = 'Place this product in a vintage, retro setting with nostalgic elements, warm tones, classic styling, maybe wood textures or vintage props.';
        break;
      default:
        scenePrompt = `Create a marketing scene for this product with ${contextDescription}. Make it professional and appealing.`;
    }

    const fullPrompt = `${scenePrompt} Keep the product recognizable and centered. Create a photorealistic, professional marketing image. High quality, 4K resolution.`;

    // Call Lovable AI with Nano Banana model for scene generation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: fullPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Scene generation response received');

    const sceneUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!sceneUrl) {
      console.error('No scene image in response:', JSON.stringify(data));
      throw new Error('No scene generated');
    }

    return new Response(
      JSON.stringify({ sceneUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-contextual-scene function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate scene' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
