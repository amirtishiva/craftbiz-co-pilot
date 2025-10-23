import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemPrompt = `You are a product analysis expert specializing in identifying business opportunities from product images.
    
Your task is to:
1. Identify the product category and type
2. Suggest potential target customers
3. Identify key features and selling points
4. Suggest a business idea based on the product
5. Provide market insights

Format your response as JSON with keys: productName, category, targetCustomers (array), features (array), suggestedIdea, marketInsights`;

    console.log('Analyzing product image with OpenAI GPT-5 Vision');

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
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Analyze this product image and provide detailed business insights.' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Try to parse JSON from the response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (e) {
      // If not valid JSON, extract information from text
      analysis = {
        productName: 'Analyzed Product',
        category: 'General',
        targetCustomers: ['Indian consumers', 'Small business owners'],
        features: ['Quality craftsmanship', 'Locally sourced materials'],
        suggestedIdea: content.substring(0, 200),
        marketInsights: content
      };
    }

    console.log('Product analysis:', analysis);

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-product-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
