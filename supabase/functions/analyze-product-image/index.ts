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

    console.log('Received request with imageUrl:', imageUrl ? `present (${imageUrl.substring(0, 50)}...)` : 'missing');

    if (!imageUrl) {
      throw new Error('Image URL (base64 data URL) is required');
    }

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemPrompt = `You are a product analysis expert specializing in identifying business opportunities from product images.

Analyze the product image in detail and extract:
1. Product Name - The EXACT product visible in the image (e.g., "Premium Darjeeling Tea", "Handwoven Silk Scarf", "Ceramic Teapot")
2. Category - Specific business category (e.g., "Beverage/Tea", "Textiles/Fashion", "Home Decor", "Food Products")
3. Target Customers - Array of 3-4 specific customer segments for THIS exact product
4. Features - Array of 4-6 key features visible or implied from THIS product
5. Suggested Business Idea - A unique 150-200 word business idea SPECIFICALLY for this exact product
6. Market Insights - Market analysis for this specific product category

CRITICAL RULES:
- Base your response ENTIRELY on what you see in the image
- Do NOT use generic responses
- Do NOT default to "handicrafts" unless the product is actually a handicraft
- Be SPECIFIC about the product type (e.g., if it's tea, say "tea business", not "handicraft business")
- The business idea must match the actual product in the image

Return ONLY valid JSON with this structure:
{
  "productName": "exact product name from image",
  "category": "specific category",
  "targetCustomers": ["customer 1", "customer 2", "customer 3"],
  "features": ["feature 1", "feature 2", "feature 3", "feature 4"],
  "suggestedIdea": "150-200 word business idea for THIS specific product",
  "marketInsights": "Market analysis for THIS product"
}`;

    console.log('Analyzing product image with OpenAI GPT-4o Vision');

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
          { 
            role: 'user', 
            content: [
              { 
                type: 'text', 
                text: 'Look at this image carefully. What SPECIFIC product do you see? Analyze this EXACT product and create a detailed business analysis for it. Do NOT give generic handicraft responses. Return ONLY valid JSON.' 
              },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageUrl,
                  detail: 'high'
                } 
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const content = data.choices[0].message.content.trim();
    console.log('Raw content from OpenAI:', content.substring(0, 200));
    
    // Try to parse JSON from the response
    let analysis;
    try {
      // Remove markdown code blocks if present
      let jsonContent = content;
      if (content.includes('```json')) {
        jsonContent = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonContent = content.split('```')[1].split('```')[0].trim();
      }
      
      analysis = JSON.parse(jsonContent);
      console.log('Successfully parsed JSON analysis');
    } catch (e) {
      console.error('Failed to parse JSON, error:', e);
      console.error('Content that failed to parse:', content);
      // If not valid JSON, try to extract information from text
      analysis = {
        productName: 'Analyzed Product',
        category: 'General',
        targetCustomers: ['Indian consumers', 'Small business owners'],
        features: ['Quality craftsmanship', 'Locally sourced materials'],
        suggestedIdea: content.length > 200 ? content.substring(0, 200) : content,
        marketInsights: content
      };
    }

    console.log('Final product analysis:', JSON.stringify(analysis, null, 2));

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
