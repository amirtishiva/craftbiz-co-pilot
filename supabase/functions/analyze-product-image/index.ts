import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ImageSchema = z.object({
  imageUrl: z.string()
    .max(10485760, { message: "Image size exceeds 10MB limit" })
    .refine((val) => val.startsWith('data:image/'), { message: 'Must be a valid image data URL' })
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageUrl } = ImageSchema.parse(body);

    const OPENAI_API_KEY = Deno.env.get('Open_API');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemPrompt = `You are an expert product analyst. Analyze the uploaded image and identify the EXACT product shown.

CRITICAL INSTRUCTIONS:
1. Look at the image carefully - what SPECIFIC product do you see?
2. If it's tea → say "Tea Beverage" NOT "Handcrafted Product"
3. If it's pottery → say "Ceramic Pottery" NOT "General Handicraft"
4. If it's textiles → say "Textile/Fabric Product" NOT "Traditional Craft"
5. Be SPECIFIC about materials you can SEE in the image
6. Base colors on what's VISIBLE in the image
7. Create a business idea that matches the ACTUAL product

RESPONSE FORMAT - Return ONLY valid JSON (no markdown, no extra text):
{
  "productName": "specific product you see in image",
  "category": "specific category matching the product",
  "targetCustomers": ["specific customer 1", "specific customer 2", "specific customer 3"],
  "features": ["visible feature 1", "visible feature 2", "visible feature 3", "visible feature 4"],
  "suggestedIdea": "A unique 150-200 word business idea for THIS EXACT product you see in the image",
  "marketInsights": "Market analysis for THIS specific product category"
}`;

    console.log('Calling OpenAI GPT-4o Vision API...');

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
                text: 'Analyze this product image. What do you see? Describe the EXACT product, materials, colors visible. Return ONLY valid JSON matching the schema provided. NO markdown formatting, NO code blocks, ONLY raw JSON.' 
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
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error - Status:', response.status);
      console.error('OpenAI API error - Details:', errorText);
      throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', JSON.stringify(data));
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    console.log('Raw AI response (first 300 chars):', content.substring(0, 300));
    
    // Parse JSON from the response
    let analysis;
    try {
      // Remove markdown code blocks if present
      let jsonContent = content;
      
      if (content.includes('```json')) {
        console.log('Removing ```json markdown wrapper');
        jsonContent = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        console.log('Removing ``` markdown wrapper');
        jsonContent = content.split('```')[1].split('```')[0].trim();
      }
      
      analysis = JSON.parse(jsonContent);
      console.log('✅ Successfully parsed product analysis:', JSON.stringify(analysis, null, 2));
      
      // Validate required fields
      if (!analysis.productName || !analysis.category || !analysis.suggestedIdea) {
        throw new Error('Missing required fields in analysis');
      }
      
    } catch (e) {
      console.error('❌ JSON parsing failed:', e.message);
      console.error('Raw content that failed:', content);
      throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
    }

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
