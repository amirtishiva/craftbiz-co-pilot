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
    const { imageData, enhancementType } = await req.json();

    if (!imageData) {
      throw new Error('Image data is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Step 1: Analyzing product image...');

    // First, analyze the image to understand product characteristics
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this product image and describe: 1) Product type/category, 2) Dominant colors and materials, 3) Current lighting quality, 4) Texture and finish, 5) Brand tone (luxury/casual/artisan/modern). Be concise but detailed.'
              },
              {
                type: 'image_url',
                image_url: { url: imageData }
              }
            ]
          }
        ]
      })
    });

    if (!analysisResponse.ok) {
      console.error('Analysis failed:', analysisResponse.status);
      throw new Error('Image analysis failed');
    }

    const analysisData = await analysisResponse.json();
    const productAnalysis = analysisData.choices?.[0]?.message?.content || '';
    console.log('Product analysis:', productAnalysis);

    console.log('Step 2: Enhancing image based on analysis...');

    // Create adaptive enhancement prompt based on analysis
    const enhancementPrompt = `Based on this product analysis: ${productAnalysis}

Enhance this product image with the following improvements:
- Optimize lighting to highlight the product's unique textures and materials
- Correct color balance to match the product's natural tones and enhance vibrancy
- Sharpen details while maintaining natural appearance
- Improve contrast and shadows for professional depth
- Enhance visual appeal while keeping the product authentic and recognizable
- Make it look like a high-end product photography shot

CRITICAL: Keep the exact product unchanged - only improve visual quality, lighting, and presentation. Do not alter the product itself, its shape, or core features.`;

    // Call Lovable AI with Nano Banana model for image enhancement
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
                text: enhancementPrompt
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
    console.log('AI response received');

    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!enhancedImageUrl) {
      console.error('No enhanced image in response:', JSON.stringify(data));
      throw new Error('No enhanced image generated');
    }

    return new Response(
      JSON.stringify({ enhancedImage: enhancedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhance-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to enhance image' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
