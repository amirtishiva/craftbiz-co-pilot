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
    const { prompt, contentType, audienceType, socialMediaType } = await req.json();

    if (!prompt) {
      throw new Error('Campaign focus/prompt is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let user = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Platform-specific style guidelines for SOCIAL MEDIA POSTS ONLY
    const platformStyles: Record<string, string> = {
      facebook: 'Conversational and community-oriented. Use warm, inclusive language. Length: 150-250 words. Include emojis sparingly. Generate 3-5 contextual hashtags based on the campaign focus.',
      instagram: 'Visual and emotional. Use storytelling, evocative language, and relevant emojis. Length: 125-150 words. Generate 5-10 trending, contextual hashtags that match the content theme.',
      linkedin: 'Professional and insightful. Use industry terminology, data-driven language. Length: 150-300 words. Formal tone. Generate 3-5 professional hashtags relevant to the industry and content.',
      x: 'Short, witty, and impactful. Use punchy language, emojis. Length: 200-280 characters. Highly engaging. Generate 2-4 trending hashtags that complement the message.'
    };

    // Content type specific guidelines (NO hashtags or emojis for non-social posts)
    const contentTypeGuidelines: Record<string, string> = {
      'social-post': 'Create engaging social media content with emojis and hashtags.',
      'ad-copy': 'Create persuasive advertisement copy. Professional tone. No hashtags or emojis. Focus on benefits and call-to-action. Length: 100-200 words.',
      'email': 'Create engaging email newsletter content. Professional yet warm tone. No hashtags or emojis. Include subject line suggestion. Length: 200-300 words.',
      'blog-intro': 'Create compelling blog introduction. Informative and engaging tone. No hashtags or emojis. Hook the reader and set up the topic. Length: 150-250 words.'
    };

    const audienceDescriptions: Record<string, string> = {
      general: 'Indian consumers',
      millennials: 'Millennials aged 25-40 in India',
      conscious: 'Conscious consumers who value sustainability and ethics',
      local: 'Local community members',
      business: 'Business owners and entrepreneurs'
    };

    const contentTypeDescriptions: Record<string, string> = {
      'social-post': 'social media post',
      'ad-copy': 'advertisement copy',
      'email': 'email newsletter',
      'blog-intro': 'blog introduction'
    };

    const audience = audienceDescriptions[audienceType || 'general'] || audienceDescriptions.general;
    const contentTypeDesc = contentTypeDescriptions[contentType || 'social-post'] || contentTypeDescriptions['social-post'];
    const contentGuideline = contentTypeGuidelines[contentType || 'social-post'] || contentTypeGuidelines['social-post'];

    let systemPrompt = '';
    let userPrompt = '';

    if (contentType === 'social-post') {
      // Social media post - use platform-specific styling with hashtags and emojis
      const platformStyle = platformStyles[socialMediaType || 'facebook'] || platformStyles.facebook;
      
      systemPrompt = `You are an expert marketing copywriter specializing in Indian market campaigns for ${socialMediaType || 'social media'}. 
You create culturally relevant, engaging content that resonates with Indian audiences. 
You understand local cultural nuances, festivals, values, and communication styles.
Always maintain authenticity and emotional connection while being professional.`;

      userPrompt = `Create compelling ${contentTypeDesc} content for ${socialMediaType || 'social media'} with these specifications:

PLATFORM: ${socialMediaType || 'Facebook'}
STYLE GUIDE: ${platformStyle}
TARGET AUDIENCE: ${audience}
CAMPAIGN FOCUS: ${prompt}

Requirements:
1. Write engaging, culturally appropriate content for Indian market
2. Incorporate emotional appeal and storytelling where relevant
3. Use appropriate tone and length for the platform
4. Include strong call-to-action
5. Make it actionable and inspiring
6. Use inclusive language that resonates with Indian values
7. Generate relevant, contextual hashtags based on the campaign theme (DO NOT use generic hashtags like #MadeInIndia unless specifically relevant)
8. Place hashtags naturally within or at the end of the content
9. Use emojis appropriately for the platform

Return ONLY the marketing content text with hashtags and emojis, no explanations or additional formatting.`;
    } else {
      // Non-social content - NO hashtags, NO emojis
      systemPrompt = `You are an expert marketing copywriter specializing in Indian market campaigns. 
You create culturally relevant, professional content that resonates with Indian audiences. 
You understand local cultural nuances, festivals, values, and communication styles.
Always maintain authenticity and emotional connection while being professional.`;

      userPrompt = `Create compelling ${contentTypeDesc} with these specifications:

CONTENT TYPE: ${contentType}
GUIDELINE: ${contentGuideline}
TARGET AUDIENCE: ${audience}
CAMPAIGN FOCUS: ${prompt}

Requirements:
1. Write engaging, culturally appropriate content for Indian market
2. Incorporate emotional appeal and storytelling where relevant
3. Professional tone - NO hashtags, NO emojis
4. Include strong call-to-action
5. Make it actionable and inspiring
6. Use inclusive language that resonates with Indian values

Return ONLY the marketing content text, no explanations or additional formatting.`;
    }

    console.log('Generating marketing content with OpenAI GPT-5');
    console.log('System prompt:', systemPrompt);
    console.log('User prompt:', userPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }
    
    const generatedContent = data.choices[0].message.content.trim();
    
    console.log('Marketing content generated successfully. Length:', generatedContent.length);
    console.log('Generated content preview:', generatedContent.substring(0, 200));

    // Save to database if user is authenticated
    if (user) {
      const { data: marketingContent, error: contentError } = await supabase
        .from('marketing_content')
        .insert({
          user_id: user.id,
          platform: contentType === 'social-post' ? (socialMediaType || null) : null,
          content_type: contentType,
          content_text: generatedContent,
          hashtags: [] // Hashtags are now included in the content_text
        })
        .select()
        .single();

      if (contentError) {
        console.error('Error saving marketing content:', contentError);
      } else {
        console.log('Marketing content saved:', marketingContent.id);
        return new Response(
          JSON.stringify({ 
            content: generatedContent,
            savedContent: marketingContent
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Return generated content without saving if no user
    return new Response(
      JSON.stringify({ 
        content: generatedContent
      }),
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
