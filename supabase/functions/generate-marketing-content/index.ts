import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemPrompt = `You are a social media marketing expert for Indian businesses. Create engaging, culturally relevant content. Format your response as JSON with keys: contentText, hashtags (array), cta`;

    const userPrompt = `Create ${platform} marketing content for:
Business: ${businessName}
Target Audience: ${targetAudience || 'Indian consumers'}
Product: ${productDescription || 'Not specified'}

Provide:
1. Engaging post text (appropriate length for ${platform})
2. 5-7 relevant hashtags for Indian market
3. Call-to-action`;

    console.log('Generating marketing content with OpenAI GPT-5');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseContent = data.choices[0].message.content.trim();
    
    // Try to parse JSON from the response
    let content;
    try {
      content = JSON.parse(responseContent);
    } catch (e) {
      // If not valid JSON, create structured content
      content = {
        contentText: responseContent,
        hashtags: ['#MadeInIndia', '#SmallBusiness', '#LocalBusiness', '#SupportLocal', '#IndianEntrepreneur'],
        cta: 'Contact us to learn more!'
      };
    }

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
