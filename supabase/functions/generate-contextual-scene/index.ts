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

    console.log(`Step 1: Analyzing product for ${contextType} scene generation...`);

    // First, analyze the product to create adaptive scenes
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
                text: 'Analyze this product and describe: 1) Product type and category, 2) Color palette and materials, 3) Size and proportions, 4) Suitable environment/context, 5) Target audience and brand positioning. Keep it concise.'
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
      console.error('Product analysis failed:', analysisResponse.status);
      throw new Error('Product analysis failed');
    }

    const analysisData = await analysisResponse.json();
    const productAnalysis = analysisData.choices?.[0]?.message?.content || '';
    console.log('Product analysis for scene:', productAnalysis);

    console.log(`Step 2: Generating unique ${contextType} contextual scene...`);

    // Generate unique variation elements to avoid repetition
    const timeOfDay = ['golden hour', 'soft morning light', 'bright midday', 'warm afternoon', 'sunset glow'][Math.floor(Math.random() * 5)];
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Create adaptive, detailed prompts based on context type and product analysis
    let scenePrompt = '';
    
    switch (contextType) {
      case 'studio':
        const studioStyles = [
          `Professional photography studio with softbox lighting and seamless white backdrop. Three-point lighting setup highlighting the product's form and texture. Clean, sharp shadows. Studio-grade quality.`,
          `Minimalist studio environment with gradient grey background transitioning from light to dark. Key light from 45-degree angle, rim light creating edge separation. Professional product photography aesthetic.`,
          `High-end studio setup with pure white cyclorama background. Overhead diffused lighting with subtle fill lights. Product positioned on reflective acrylic surface creating elegant mirror effect.`,
          `Contemporary studio scene with neutral beige backdrop. Soft diffused lighting from camera left, subtle accent light creating dimension. Product casting natural shadow on matte surface.`
        ];
        scenePrompt = studioStyles[Math.floor(Math.random() * studioStyles.length)];
        break;
        
      case 'lifestyle':
        const lifestyleScenes = [
          `Authentic lifestyle scene with the product in daily use on a wooden dining table. Natural ${timeOfDay} streaming through nearby window. Hands naturally interacting with product. Soft focus on background showing cozy home interior.`,
          `Real-world usage scenario in a modern living space. Product placed on marble countertop with soft ambient lighting. Person's hands gently handling the product. Blurred background showing contemporary home decor and plants.`,
          `Casual lifestyle setting on outdoor patio table. Product being enjoyed during ${timeOfDay}. Natural hand positioning showing product scale and usage. Bokeh background with garden elements and warm atmosphere.`,
          `Everyday moment captured in minimalist home office. Product on clean desk surface with laptop and coffee cup nearby. Natural light from side window. Hands in frame showing natural product interaction.`
        ];
        scenePrompt = lifestyleScenes[Math.floor(Math.random() * lifestyleScenes.length)];
        break;
        
      case 'outdoor':
        const outdoorSettings = [
          `Pristine natural outdoor setting during ${timeOfDay}. Product positioned on weathered stone surface surrounded by native wildflowers and moss. Soft natural sunlight with atmospheric depth. Mountains or forest visible in soft-focus background.`,
          `Organic outdoor scene with product on reclaimed wood surface. Lush green foliage and natural elements surrounding. Dappled sunlight filtering through leaves creating dynamic light patterns. Fresh, earthy atmosphere.`,
          `Coastal outdoor environment with product on driftwood or beach stone. Ocean and sky in blurred background during ${timeOfDay}. Natural beach elements like sand, shells, and sea grass. Gentle, diffused natural lighting.`,
          `Garden setting with product placed on natural stone or rustic wooden bench. Vibrant flowers and greenery in foreground and background. ${timeOfDay} creating warm, inviting atmosphere. Butterflies or natural details adding life.`
        ];
        scenePrompt = outdoorSettings[Math.floor(Math.random() * outdoorSettings.length)];
        break;
        
      case 'luxury':
        const luxuryContexts = [
          `Ultra-premium luxury brand presentation on polished Carrara marble surface. Subtle gold leaf accents and soft velvet elements. Dramatic side lighting creating sophisticated highlights and shadows. Black or deep navy background with elegant depth.`,
          `High-end luxury scene with product on brushed brass platform. Rich burgundy velvet draping in background. Precision rim lighting emphasizing premium quality. Subtle reflections on glossy surfaces. Museum-quality presentation.`,
          `Opulent luxury setting with product displayed on obsidian stone pedestal. Champagne gold geometric elements framing the composition. Soft diffused lighting from above creating premium glow. Deep emerald or sapphire tones in blurred background.`,
          `Exclusive brand showcase on mirror-polished rose gold surface. Soft white leather and silk textures surrounding. Precision studio lighting with elegant lens flare effects. Minimalist luxury aesthetic with maximum sophistication.`
        ];
        scenePrompt = luxuryContexts[Math.floor(Math.random() * luxuryContexts.length)];
        break;
        
      case 'minimalist':
        const minimalistStyles = [
          `Clean minimalist composition with product on matte concrete platform. Single geometric shape (cube or cylinder) in complementary neutral tone nearby. Soft overhead lighting creating subtle gradient. Vast negative space. Contemporary zen aesthetic.`,
          `Ultra-minimal scene with product floating against pure gradient background (cream to warm grey). Single circular element for visual balance. Soft shadow underneath product. Scandinavian-inspired simplicity and elegance.`,
          `Modern minimalist setting with product on smooth terrazzo surface. Simple arch shape in background creating architectural interest. Monochromatic color scheme with subtle texture variations. Abundant breathing space around product.`,
          `Contemporary minimal composition with product on brushed aluminum surface. Single organic element (branch or leaf) for natural contrast. Soft directional light creating clean shadow. Neutral palette with sophisticated restraint.`
        ];
        scenePrompt = minimalistStyles[Math.floor(Math.random() * minimalistStyles.length)];
        break;
        
      case 'vintage':
        const vintageSettings = [
          `Nostalgic vintage scene with product on weathered oak table. Aged brass candlestick and antique books nearby. Warm ${timeOfDay} through lace curtains. Sepia-toned atmosphere with film grain texture. 1920s-inspired styling.`,
          `Retro setting with product on distressed wood surface. Vintage tin containers and old glass bottles in background. Warm tungsten lighting creating amber glow. Faded wallpaper or textile backdrop. 1950s aesthetic with authentic patina.`,
          `Classic vintage composition on antique marble vanity. Ornate picture frame and vintage perfume bottles surrounding. Soft warm light mimicking old photography. Muted color palette with period-appropriate styling. Victorian elegance.`,
          `Timeless retro scene with product on worn leather surface. Old brass compass and vintage map elements nearby. Warm candle-like lighting. Aged wood paneling background. 1940s explorer aesthetic with authentic wear and character.`
        ];
        scenePrompt = vintageSettings[Math.floor(Math.random() * vintageSettings.length)];
        break;
        
      default:
        scenePrompt = `Custom marketing scene: ${contextDescription}. Professional composition with thoughtful lighting and complementary background elements.`;
    }

    const fullPrompt = `Product Analysis: ${productAnalysis}

Scene Requirements:
${scenePrompt}

CRITICAL INSTRUCTIONS:
- Keep the original product PERFECTLY RECOGNIZABLE and centered as the hero element
- Blend the product naturally into the scene with matching lighting, shadows, and reflections
- Ensure the product looks physically embedded in the environment (not pasted)
- Match product shadows and highlights to the scene's lighting direction
- Create photorealistic, marketing-ready composition
- Ultra-high quality, 4K resolution, professional photography standard
- Make each generation unique - vary angles, props, and subtle details (ID: ${uniqueId})
- Product must remain sharp and in focus while background can have subtle depth of field`;


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
