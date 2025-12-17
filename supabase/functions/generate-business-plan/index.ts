import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BusinessPlanRequestSchema = z.object({
  ideaId: z.string().uuid({ message: "Valid idea ID is required" }),
  businessName: z.string().min(1).max(200).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { ideaId, businessName } = BusinessPlanRequestSchema.parse(body);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseKey || !LOVABLE_API_KEY) {
      console.error('Missing required environment configuration');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user's idea
    const { data: idea, error: ideaError } = await supabase
      .from('business_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      console.error('Idea not found:', ideaId);
      return new Response(
        JSON.stringify({ error: 'Business idea not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert business consultant specializing in helping Indian entrepreneurs create concise, actionable business plans. You understand the Indian market and provide clear, structured insights.

CRITICAL FORMATTING INSTRUCTIONS:
- Each section must have EXACTLY 3-5 bullet points
- Format each bullet point as: "• " followed by 1-2 sentences
- Each bullet point MUST be on a new line (use \\n to separate)
- Example format:
  "• First key point goes here. Additional detail if needed.\\n• Second point here.\\n• Third point here."
- Use specific numbers and data relevant to India when possible
- Be concise and actionable - no lengthy paragraphs
- You MUST return valid JSON with properly formatted bullet points
- Use the tool call to return structured data`;

    const userPrompt = `Business Idea: ${idea.refined_idea || idea.original_text}
Business Name: ${businessName || 'Not specified'}

Generate a concise business plan with EXACTLY 3-5 bullet points per section.

FORMAT REQUIREMENTS:
- Each bullet point MUST start with "• " 
- Each bullet point MUST be on a new line (use \\n)
- Each bullet point should be 1-2 sentences maximum
- Example: "• Point one.\\n• Point two.\\n• Point three."

SECTIONS REQUIRED:
1. Executive Summary
2. Market Analysis  
3. Target Customers
4. Competitive Advantage
5. Revenue Model
6. Marketing Strategy
7. Operations Plan
8. Financial Projections
9. Risk Analysis
10. Implementation Timeline

Focus on specific, actionable, and measurable information relevant to the Indian market.`;

    console.log('Generating business plan for idea:', ideaId);

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
        tools: [
          {
            type: "function",
            function: {
              name: "create_business_plan",
              description: "Create a comprehensive business plan with all required sections",
              parameters: {
                type: "object",
                properties: {
                  executiveSummary: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." },
                  marketAnalysis: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." },
                  targetCustomers: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." },
                  competitiveAdvantage: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." },
                  revenueModel: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." },
                  marketingStrategy: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." },
                  operationsPlan: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." },
                  financialProjections: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." },
                  riskAnalysis: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." },
                  implementationTimeline: { type: "string", description: "3-5 bullet points. Format: '• Point one.\\n• Point two.\\n• Point three.' Each 1-2 sentences." }
                },
                required: [
                  "executiveSummary", "marketAnalysis", "targetCustomers", 
                  "competitiveAdvantage", "revenueModel", "marketingStrategy",
                  "operationsPlan", "financialProjections", "riskAnalysis", 
                  "implementationTimeline"
                ],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_business_plan" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate business plan. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI Response received');
    
    // Extract tool call result
    let planContent;
    const toolCalls = data.choices[0].message.tool_calls;
    
    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      planContent = JSON.parse(toolCall.function.arguments);
      console.log('Successfully extracted business plan from tool call');
    } else {
      // Fallback: try to parse content directly
      const content = data.choices[0].message.content?.trim();
      if (content) {
        try {
          planContent = JSON.parse(content);
        } catch (e) {
          console.error('Failed to parse AI response:', e);
          return new Response(
            JSON.stringify({ error: 'Failed to process business plan data. Please try again.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        console.error('No content received from AI');
        return new Response(
          JSON.stringify({ error: 'Failed to generate business plan content. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Save business plan to database
    const { data: businessPlan, error: planError } = await supabase
      .from('business_plans')
      .insert({
        user_id: idea.user_id,
        idea_id: ideaId,
        business_name: businessName || 'My Business',
        executive_summary: planContent.executiveSummary,
        market_analysis: planContent.marketAnalysis,
        target_customers: planContent.targetCustomers,
        competitive_advantage: planContent.competitiveAdvantage,
        revenue_model: planContent.revenueModel,
        marketing_strategy: planContent.marketingStrategy,
        operations_plan: planContent.operationsPlan,
        financial_projections: planContent.financialProjections,
        risk_analysis: planContent.riskAnalysis,
        implementation_timeline: planContent.implementationTimeline,
        status: 'completed'
      })
      .select()
      .single();

    if (planError) {
      console.error('Error saving business plan:', planError);
      return new Response(
        JSON.stringify({ error: 'Failed to save business plan. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Business plan generated and saved:', businessPlan.id);

    return new Response(
      JSON.stringify({ businessPlan }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-business-plan function:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate business plan. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
