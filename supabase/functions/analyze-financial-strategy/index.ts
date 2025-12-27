import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FinancialDataSchema = z.object({
  financialData: z.object({
    startupCost: z.number().nonnegative({ message: "Startup cost cannot be negative" }).max(1000000000, { message: "Value exceeds reasonable limit" }),
    monthlyExpenses: z.number().nonnegative({ message: "Expenses cannot be negative" }).max(100000000, { message: "Value exceeds reasonable limit" }),
    pricePerUnit: z.number().positive({ message: "Price must be positive" }).max(10000000, { message: "Value exceeds reasonable limit" }),
    unitsPerMonth: z.number().nonnegative({ message: "Units cannot be negative" }).max(10000000, { message: "Value exceeds reasonable limit" })
  }),
  projections: z.object({
    monthlyRevenue: z.number(),
    monthlyProfit: z.number(),
    breakEvenMonths: z.number(),
    yearlyRevenue: z.number()
  }),
  businessContext: z.string().trim().min(1).max(5000),
  businessName: z.string().trim().min(1).max(200)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { financialData, projections, businessContext, businessName } = FinancialDataSchema.parse(body);

    console.log("Analyzing financial strategy for:", businessName);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert financial advisor specializing in Indian startups and small businesses. 
Your role is to analyze financial data and provide actionable, specific, and realistic strategic recommendations.
Focus on practical advice tailored to the Indian business environment, considering local market conditions, 
regulations, and growth opportunities.

You MUST respond with a valid JSON object containing these exact fields:
- cashFlowAnalysis: string (2-3 sentences analyzing cash flow health and sustainability)
- pricingRecommendation: string (2-3 sentences about pricing strategy optimization)
- growthOpportunities: array of 3-4 strings (specific growth opportunities for this business)
- riskMitigation: array of 2-3 strings (key financial risks and how to address them)
- actionItems: array of 3-5 strings (immediate, specific action steps to improve financial position)

Return ONLY the JSON object, no additional text.`;

    const userPrompt = `Analyze the following financial data for "${businessName}":

Business Context: ${businessContext}

Financial Inputs:
- Initial Startup Cost: ₹${financialData.startupCost}
- Monthly Operating Expenses: ₹${financialData.monthlyExpenses}
- Price per Unit/Service: ₹${financialData.pricePerUnit}
- Units Sold per Month: ${financialData.unitsPerMonth}

Calculated Projections:
- Monthly Revenue: ₹${projections.monthlyRevenue}
- Monthly Profit: ₹${projections.monthlyProfit}
- Break-even Period: ${projections.breakEvenMonths} months
- Yearly Revenue: ₹${projections.yearlyRevenue}

Provide strategic financial recommendations as a JSON object.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    // Extract and parse the response
    const content = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    let insights;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      throw new Error("Failed to parse financial strategy response");
    }

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-financial-strategy:", error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to analyze financial strategy" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
