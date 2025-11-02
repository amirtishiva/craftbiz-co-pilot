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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert financial advisor specializing in Indian startups and small businesses. 
Your role is to analyze financial data and provide actionable, specific, and realistic strategic recommendations.
Focus on practical advice tailored to the Indian business environment, considering local market conditions, 
regulations, and growth opportunities.`;

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

Provide strategic financial recommendations focusing on:
1. Cash flow health and sustainability
2. Pricing strategy optimization
3. Growth opportunities specific to this business
4. Risk mitigation strategies
5. Immediate action items for improvement`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_financial_strategy",
              description: "Provide structured financial strategy recommendations",
              parameters: {
                type: "object",
                properties: {
                  cashFlowAnalysis: {
                    type: "string",
                    description: "2-3 sentences analyzing cash flow health and sustainability"
                  },
                  pricingRecommendation: {
                    type: "string",
                    description: "2-3 sentences about pricing strategy optimization"
                  },
                  growthOpportunities: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 specific growth opportunities for this business"
                  },
                  riskMitigation: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 key financial risks and how to address them"
                  },
                  actionItems: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 immediate, specific action steps to improve financial position"
                  }
                },
                required: ["cashFlowAnalysis", "pricingRecommendation", "growthOpportunities", "riskMitigation", "actionItems"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_financial_strategy" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    // Extract insights from tool call
    let insights;
    if (aiResponse.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const argsString = aiResponse.choices[0].message.tool_calls[0].function.arguments;
      insights = typeof argsString === 'string' ? JSON.parse(argsString) : argsString;
      console.log("Successfully extracted financial strategy from tool call");
    } else {
      throw new Error("No tool call found in AI response");
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
