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
    const { platform, businessName, targetAudience, productDescription } = await req.json();

    if (!platform || !businessName) {
      throw new Error('Platform and business name are required');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a social media marketing expert for Indian businesses. Create engaging, culturally relevant content.`;

    const userPrompt = `Create ${platform} marketing content for:
Business: ${businessName}
Target Audience: ${targetAudience || 'Indian consumers'}
Product: ${productDescription || 'Not specified'}

Provide:
1. Engaging post text (appropriate length for ${platform})
2. 5-7 relevant hashtags for Indian market
3. Call-to-action

Format as JSON with keys: contentText, hashtags (array), cta`;

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
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    // Save to database
    const { data: marketingContent, error: contentError } = await supabase
      .from('marketing_content')
      .insert({
        user_id: user.id,
        platform,
        content_text: content.contentText,
        hashtags: content.hashtags
      })
      .select()
      .single();

    if (contentError) {
      console.error('Error saving marketing content:', contentError);
      throw new Error('Failed to save marketing content');
    }

    console.log('Marketing content generated:', marketingContent.id);

    return new Response(
      JSON.stringify({ content: marketingContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-marketing-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
