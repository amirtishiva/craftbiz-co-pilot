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
    const { ideaId, businessName } = await req.json();

    if (!ideaId) {
      throw new Error('Idea ID is required');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user's idea
    const { data: idea, error: ideaError } = await supabase
      .from('business_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      throw new Error('Idea not found');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert business consultant specializing in helping Indian entrepreneurs create comprehensive, detailed business plans. You understand the Indian market, local challenges, and opportunities for small businesses.

CRITICAL INSTRUCTIONS:
- Generate DETAILED, COMPREHENSIVE content for each section
- Each section must be 3-5 bullet points with specific, actionable information
- Use concrete numbers, examples, and market data relevant to India
- Avoid generic statements - be specific to the business idea
- You MUST return valid JSON ONLY - no markdown, no code blocks, no explanatory text
- Use the tool call to return structured data`;

    const userPrompt = `Business Idea: ${idea.refined_idea || idea.original_text}
Business Name: ${businessName || 'Not specified'}

Generate a comprehensive business plan with detailed content for each section:

1. EXECUTIVE SUMMARY (3-4 bullet points):
   - Compelling overview of the business concept and vision
   - Problem being solved and solution offered
   - Target market and unique value proposition
   - Key financial highlights and growth potential

2. MARKET ANALYSIS (4-5 bullet points):
   - Detailed target market size and demographics in India
   - Current market trends and growth opportunities
   - Customer behavior patterns and preferences
   - Market gaps and opportunities this business will address
   - Specific examples and data points

3. TARGET CUSTOMERS (3-4 bullet points):
   - Detailed customer personas with demographics
   - Customer pain points and needs
   - Buying behavior and decision-making factors
   - Customer acquisition and retention strategies

4. COMPETITIVE ADVANTAGE (3-4 bullet points):
   - Specific unique selling propositions
   - Competitive landscape analysis
   - Barriers to entry for competitors
   - How this business differentiates from existing solutions
   - Long-term competitive moats

5. REVENUE MODEL (3-4 bullet points):
   - Detailed pricing strategy with specific price points
   - Multiple revenue streams and their contribution
   - Unit economics and profit margins
   - Scalability of the business model
   - Payment terms and cash flow considerations

6. MARKETING STRATEGY (4-5 bullet points):
   - Specific digital and offline marketing channels
   - Customer acquisition strategy with cost estimates
   - Brand positioning and messaging
   - Partnership and collaboration opportunities
   - Month-by-month marketing roadmap for first 6 months

7. OPERATIONS PLAN (4-5 bullet points):
   - Day-to-day operational workflow
   - Key resources needed (team, technology, infrastructure)
   - Supply chain and vendor management
   - Quality control and customer service processes
   - Scalability and efficiency improvements

8. FINANCIAL PROJECTIONS (4-5 bullet points):
   - Detailed startup costs breakdown (₹50,000 - ₹5,00,000)
   - Monthly operating expenses with specific categories
   - Revenue projections for Year 1, 2, and 3
   - Break-even analysis and timeline
   - Funding requirements and ROI expectations

9. RISK ANALYSIS (3-4 bullet points):
   - Major business risks (market, operational, financial)
   - Specific mitigation strategies for each risk
   - Contingency plans and alternative approaches
   - Regulatory and compliance considerations

10. IMPLEMENTATION TIMELINE (3-4 bullet points):
    - Detailed 6-month roadmap with specific milestones
    - Month-by-month action items and deliverables
    - Key metrics and success indicators
    - Resource allocation timeline`;

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
                  executiveSummary: { type: "string", description: "3-4 bullet points executive summary" },
                  marketAnalysis: { type: "string", description: "4-5 bullet points market analysis" },
                  targetCustomers: { type: "string", description: "3-4 bullet points target customers" },
                  competitiveAdvantage: { type: "string", description: "3-4 bullet points competitive advantage" },
                  revenueModel: { type: "string", description: "3-4 bullet points revenue model" },
                  marketingStrategy: { type: "string", description: "4-5 bullet points marketing strategy" },
                  operationsPlan: { type: "string", description: "4-5 bullet points operations plan" },
                  financialProjections: { type: "string", description: "4-5 bullet points financial projections" },
                  riskAnalysis: { type: "string", description: "3-4 bullet points risk analysis" },
                  implementationTimeline: { type: "string", description: "3-4 bullet points implementation timeline" }
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
      console.error('Lovable AI API error:', response.status, errorText);
      throw new Error(`Lovable AI API error: ${response.status} - ${errorText}`);
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
          throw new Error('AI did not return valid business plan data');
        }
      } else {
        throw new Error('No content received from AI');
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
      throw new Error('Failed to save business plan');
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
