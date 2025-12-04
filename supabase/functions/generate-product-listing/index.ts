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
    const { productName, category, imageBase64, craftType, materials } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating product listing for:", productName, "category:", category);

    const systemPrompt = `You are an expert product copywriter specializing in artisan and handcrafted products for the Indian market. Generate compelling, SEO-optimized product listings that highlight the artisan's story and craft heritage.

Your output must be structured and include:
1. An engaging, SEO-friendly title (max 80 characters)
2. A compelling product description (150-250 words) that tells the product's story
3. A craft heritage section explaining cultural significance
4. Suggested price range in INR based on similar artisan products
5. Relevant tags for search optimization

Focus on emotional storytelling, authenticity, and the unique value of handcrafted items.`;

    const userPrompt = `Create a product listing for:
- Product Name: ${productName}
- Category: ${category}
- Craft Type: ${craftType || 'Traditional Indian craft'}
- Materials: ${materials || 'Traditional materials'}
${imageBase64 ? '- Product image is provided for reference' : ''}

Generate an authentic, compelling listing that would appeal to customers who value handcrafted, artisan products.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "generate_product_listing",
              description: "Generate a complete product listing with all required fields",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "SEO-optimized product title, max 80 characters"
                  },
                  description: {
                    type: "string",
                    description: "Compelling product description, 150-250 words"
                  },
                  story: {
                    type: "string",
                    description: "Artisan's story behind this product, 50-100 words"
                  },
                  craft_heritage: {
                    type: "string",
                    description: "Cultural and historical context of the craft"
                  },
                  suggested_price_min: {
                    type: "number",
                    description: "Minimum suggested price in INR"
                  },
                  suggested_price_max: {
                    type: "number",
                    description: "Maximum suggested price in INR"
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-10 relevant search tags"
                  }
                },
                required: ["title", "description", "story", "craft_heritage", "suggested_price_min", "suggested_price_max", "tags"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_product_listing" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const listing = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, data: listing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating product listing:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate listing" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
