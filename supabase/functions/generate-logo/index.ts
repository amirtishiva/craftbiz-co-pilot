import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, industry, style } = await req.json();

    if (!businessName) {
      throw new Error('Business name is required');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Create a modern, professional logo for "${businessName}", a ${industry || 'business'}. Style: ${style || 'minimalist and professional'}. The logo should be clean, memorable, and suitable for digital and print use.`;

    console.log('Generating logo with prompt:', prompt);

    // Simulate logo generation - in production, this would call an image generation API
    const mockLogoUrl = `https://via.placeholder.com/400x400/6366F1/FFFFFF?text=${encodeURIComponent(businessName)}`;

    // Save to database
    const { data: asset, error: assetError } = await supabase
      .from('design_assets')
      .insert({
        user_id: user.id,
        asset_type: 'logo',
        asset_url: mockLogoUrl,
        prompt_used: prompt
      })
      .select()
      .single();

    if (assetError) {
      console.error('Error saving logo:', assetError);
      throw new Error('Failed to save logo');
    }

    console.log('Logo generated and saved:', asset.id);

    return new Response(
      JSON.stringify({ asset }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-logo function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
