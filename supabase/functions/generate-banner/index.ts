import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BANNER_SIZE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  'instagram-post': { width: 1080, height: 1080 },
  'instagram-story': { width: 1080, height: 1920 },
  'facebook-cover': { width: 820, height: 312 },
  'facebook-post': { width: 1200, height: 630 },
  'linkedin-banner': { width: 1584, height: 396 },
  'twitter-header': { width: 1500, height: 500 },
  'youtube-thumbnail': { width: 1280, height: 720 },
  'website-hero': { width: 1920, height: 600 },
  'email-header': { width: 600, height: 200 },
  'leaderboard-ad': { width: 728, height: 90 },
};

const BannerRequestSchema = z.object({
  bannerSize: z.string().min(1).max(50),
  customWidth: z.number().int().min(100).max(5000).optional(),
  customHeight: z.number().int().min(100).max(5000).optional(),
  inputType: z.enum(['text', 'image']).optional(),
  headline: z.string().min(1).max(200),
  subheadline: z.string().max(300).optional().nullable(),
  ctaText: z.string().max(100).optional().nullable(),
  styleTheme: z.string().min(1).max(100),
  colorScheme: z.string().min(1).max(100),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  textDescription: z.string().max(1000).optional().nullable(),
  referenceImageData: z.string().max(10485760).optional().nullable(),
  planId: z.string().uuid().optional().nullable()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseKey || !lovableApiKey) {
      console.error('Missing required environment configuration');
      return new Response(
        JSON.stringify({ error: 'Service configuration error', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication failed', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validatedData = BannerRequestSchema.parse(body);
    
    const {
      bannerSize,
      customWidth,
      customHeight,
      inputType,
      headline,
      subheadline,
      ctaText,
      styleTheme,
      colorScheme,
      primaryColor,
      secondaryColor,
      textDescription,
      referenceImageData,
      planId,
    } = validatedData;

    // Get dimensions
    let width: number, height: number;
    if (bannerSize === 'custom') {
      if (!customWidth || !customHeight) {
        return new Response(
          JSON.stringify({ error: 'Custom dimensions required for custom banner size', success: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      width = customWidth;
      height = customHeight;
    } else {
      const dimensions = BANNER_SIZE_DIMENSIONS[bannerSize];
      if (!dimensions) {
        return new Response(
          JSON.stringify({ error: 'Invalid banner size selected', success: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      width = dimensions.width;
      height = dimensions.height;
    }

    console.log(`Generating banner: ${width}x${height}px, style: ${styleTheme}, scheme: ${colorScheme}`);

    // Construct the base prompt
    const basePrompt = `Generate a professional marketing banner with these specifications:

DIMENSIONS: ${width}x${height}px (aspect ratio ${width}:${height})
STYLE: ${styleTheme}
COLOR SCHEME: ${colorScheme}${primaryColor ? `, Primary: ${primaryColor}` : ''}${secondaryColor ? `, Secondary: ${secondaryColor}` : ''}

TEXT CONTENT:
- Headline: "${headline}" (prominent, bold, highly visible)
${subheadline ? `- Subheadline: "${subheadline}" (secondary emphasis)` : ''}
${ctaText ? `- Call-to-Action: "${ctaText}" (button or badge style)` : ''}

DESIGN GUIDELINES:
- Use ${styleTheme} design principles (clean layout, balanced composition)
- Apply ${colorScheme} color palette harmoniously
- Ensure all text is highly readable with proper contrast
- Follow modern UI/UX best practices
- Create visually striking and professional design
- Target audience: Indian market (culturally appropriate imagery)
${textDescription ? `- Additional context: ${textDescription}` : ''}
${inputType === 'image' && referenceImageData ? '- Incorporate visual elements from the provided reference image' : ''}

OUTPUT: Ultra high resolution marketing banner optimized for digital use. ${width}:${height} aspect ratio.`;

    // Generate 3 variants
    const variants = [
      basePrompt,
      `${basePrompt}\n\nVariation: Create a more vibrant and energetic version with bolder colors and dynamic composition.`,
      `${basePrompt}\n\nVariation: Create an alternative layout with different text positioning and visual hierarchy.`
    ];

    const generatedBanners: string[] = [];

    for (let i = 0; i < 3; i++) {
      console.log(`Generating variant ${i + 1}...`);
      
      const messages: any[] = [
        {
          role: 'user',
          content: inputType === 'image' && referenceImageData 
            ? [
                { type: 'text', text: variants[i] },
                {
                  type: 'image_url',
                  image_url: { url: referenceImageData }
                }
              ]
            : variants[i]
        }
      ];

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages,
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for variant ${i + 1}:`, response.status, errorText);
        throw new Error(`Failed to generate banner variant ${i + 1}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.error('No image in response:', JSON.stringify(data));
        throw new Error(`No image generated for variant ${i + 1}`);
      }

      generatedBanners.push(imageUrl);
      console.log(`Variant ${i + 1} generated successfully`);
    }

    // Save to database
    const { data: bannerData, error: insertError } = await supabase
      .from('banner_designs')
      .insert({
        user_id: user.id,
        plan_id: planId || null,
        banner_size: bannerSize,
        custom_width: bannerSize === 'custom' ? customWidth : null,
        custom_height: bannerSize === 'custom' ? customHeight : null,
        input_type: inputType,
        headline,
        subheadline: subheadline || null,
        cta_text: ctaText || null,
        style_theme: styleTheme,
        color_scheme: colorScheme,
        primary_color: primaryColor || null,
        secondary_color: secondaryColor || null,
        text_description: textDescription || null,
        reference_image_data: inputType === 'image' ? referenceImageData : null,
        banner_url_png_1: generatedBanners[0],
        banner_url_png_2: generatedBanners[1] || null,
        banner_url_png_3: generatedBanners[2] || null,
        prompt_used: basePrompt,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Banner saved to database:', bannerData.id);

    return new Response(
      JSON.stringify({
        success: true,
        banners: generatedBanners,
        bannerId: bannerData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-banner function:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message, success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate banner. Please try again.',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});