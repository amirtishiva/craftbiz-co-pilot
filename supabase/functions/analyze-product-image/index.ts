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
    const { imageData, imageUrl } = await req.json();

    console.log('Received request with imageData:', imageData ? 'present' : 'missing', 'imageUrl:', imageUrl ? 'present' : 'missing');

    if (!imageData && !imageUrl) {
      throw new Error('Image data or URL is required');
    }

    // Use imageUrl if provided, otherwise use imageData
    const imageInput = imageUrl || imageData;

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemPrompt = `You are a product analysis expert specializing in identifying business opportunities from product images. You have extensive knowledge of Indian markets, craftsmanship, and business opportunities.

Your task is to analyze the product image and extract:
1. Product Name - A clear, specific name for the product
2. Category - The business category (e.g., Automotive, Handicrafts, Food, etc.)
3. Target Customers - An array of specific customer segments (e.g., ["Vehicle owners", "Fleet operators"])
4. Features - An array of key product features and selling points (e.g., ["Durable rubber", "All-terrain capability"])
5. Suggested Business Idea - A 150-200 word unique, detailed business idea specifically for THIS product that includes:
   - What makes this product/business unique
   - Specific target market
   - Revenue potential
   - Competitive advantage
   - Implementation approach
6. Market Insights - Brief market analysis for this product category

CRITICAL: The business idea MUST be specific to the actual product in the image. Do NOT give generic responses.

Return ONLY a JSON object with this exact structure:
{
  "productName": "specific product name",
  "category": "product category",
  "targetCustomers": ["customer 1", "customer 2", "customer 3"],
  "features": ["feature 1", "feature 2", "feature 3", "feature 4"],
  "suggestedIdea": "A detailed 150-200 word business idea specific to this product...",
  "marketInsights": "Market analysis for this product category..."
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
                text: 'Analyze this product image in detail. Identify exactly what product is shown and provide a comprehensive, unique business analysis. Return ONLY valid JSON with the exact keys: productName, category, targetCustomers (array), features (array), suggestedIdea (150-200 words), marketInsights.' 
              },
              { type: 'image_url', image_url: { url: imageInput } }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
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
